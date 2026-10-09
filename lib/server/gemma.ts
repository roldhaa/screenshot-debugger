import {
  ApiError,
  GoogleGenAI,
  ThinkingLevel,
  createPartFromUri,
  createUserContent,
  type Part,
} from "@google/genai";
import { LIMITS } from "@/lib/limits";
import { MODEL_RESPONSE_JSON_SCHEMA, SYSTEM_PROMPT } from "@/lib/prompts/screenshot-debugger";
import { type ModelCall, type ModelCaller, ProviderError } from "@/lib/server/diagnose";

export function createGemmaCaller(signal?: AbortSignal): ModelCaller {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new ProviderError("missing_key");
  }

  const ai = new GoogleGenAI({ apiKey });

  return async (request) => {
    const timeout = AbortSignal.timeout(LIMITS.requestTimeoutMs);
    const abortSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
    try {
      return await generate(ai, request, abortSignal, true);
    } catch (error) {
      throw mapProviderError(error);
    }
  };
}

export function mapProviderError(error: unknown): ProviderError {
  if (error instanceof ProviderError) {
    return error;
  }
  if (error instanceof Error && error.name === "TimeoutError") {
    return new ProviderError("timeout");
  }
  if (error instanceof Error && error.name === "AbortError") {
    return new ProviderError("cancelled");
  }

  const status = readStatus(error);
  const message = error instanceof Error ? error.message : "";
  if (status === 401 || status === 403) {
    return new ProviderError("auth");
  }
  if (status === 429) {
    return new ProviderError("quota");
  }
  if (status === 404) {
    return new ProviderError("model_not_found");
  }
  if (status === 408) {
    return new ProviderError("timeout");
  }
  if (status === 400 && /schema|responseMimeType|response_mime_type|json schema/i.test(message)) {
    return new ProviderError("schema_unsupported");
  }
  if (status === 400) {
    return new ProviderError("invalid");
  }
  if (status !== undefined && status >= 500) {
    return new ProviderError("unavailable");
  }
  if (/fetch failed|network|ECONNRESET|ETIMEDOUT/i.test(message)) {
    return new ProviderError("transient");
  }
  return new ProviderError("unavailable");
}

async function generate(
  ai: GoogleGenAI,
  request: ModelCall,
  abortSignal: AbortSignal,
  allowInlineFallback: boolean,
): Promise<string> {
  if (request.image) {
    try {
      return await generateFromUploadedFile(ai, request, abortSignal);
    } catch (error) {
      if (allowInlineFallback && isUploadTransportError(error)) {
        return generateWithParts(ai, request, abortSignal, [
          {
            inlineData: {
              mimeType: request.image.mimeType,
              data: request.image.dataBase64,
            },
          },
          { text: request.userText },
        ]);
      }
      throw error;
    }
  }
  return generateWithParts(ai, request, abortSignal, [{ text: request.userText }]);
}

async function generateFromUploadedFile(
  ai: GoogleGenAI,
  request: ModelCall,
  abortSignal: AbortSignal,
): Promise<string> {
  if (!request.image) {
    throw new ProviderError("invalid");
  }
  const bytes = Buffer.from(request.image.dataBase64, "base64");
  const uploaded = await ai.files.upload({
    file: new Blob([bytes], { type: request.image.mimeType }),
    config: { mimeType: request.image.mimeType },
  });
  try {
    if (!uploaded.uri) {
      throw new ProviderError("unavailable");
    }
    const mimeType = uploaded.mimeType ?? request.image.mimeType;
    return await generateWithParts(
      ai,
      request,
      abortSignal,
      createUserContent([createPartFromUri(uploaded.uri, mimeType), request.userText]).parts ?? [],
    );
  } finally {
    if (uploaded.name) {
      await ai.files.delete({ name: uploaded.name }).catch(() => {
        console.info(JSON.stringify({ event: "file_delete_failed" }));
      });
    }
  }
}

async function generateWithParts(
  ai: GoogleGenAI,
  request: ModelCall,
  abortSignal: AbortSignal,
  parts: Part[],
): Promise<string> {
  const response = await ai.models.generateContent({
    model: request.model,
    contents: [{ role: "user", parts }],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.2,
      maxOutputTokens: 700,
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
      abortSignal,
      responseMimeType: "application/json",
      ...(request.responseSchema ? { responseJsonSchema: MODEL_RESPONSE_JSON_SCHEMA } : {}),
    },
  });
  return response.text ?? "";
}

function isUploadTransportError(error: unknown): boolean {
  const status = readStatus(error);
  const message = error instanceof Error ? error.message : "";
  return status === 400 && /upload|file|inline|mime/i.test(message) && !/schema/i.test(message);
}

function readStatus(error: unknown): number | undefined {
  if (error instanceof ApiError) {
    return error.status;
  }
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === "number") {
      return status;
    }
  }
  return undefined;
}
