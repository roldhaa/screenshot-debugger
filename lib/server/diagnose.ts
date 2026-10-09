import {
  type AnalysisReport,
  ModelOutputError,
  type ModelOutput,
  parseModelOutput,
} from "@/lib/analysis-schema";
import { LIMITS } from "@/lib/limits";
import {
  buildRepairPrompt,
  buildUserPrompt,
  FALLBACK_MODEL,
  PRIMARY_MODEL,
  PROMPT_VERSION,
} from "@/lib/prompts/screenshot-debugger";

export type ProviderKind =
  | "missing_key"
  | "transient"
  | "auth"
  | "quota"
  | "model_not_found"
  | "schema_unsupported"
  | "timeout"
  | "unavailable"
  | "invalid"
  | "cancelled";

export class ProviderError extends Error {
  readonly kind: ProviderKind;

  constructor(kind: ProviderKind) {
    super(kind);
    this.name = "ProviderError";
    this.kind = kind;
  }
}

export type DiagnosisImage = {
  mimeType: "image/png" | "image/jpeg";
  dataBase64: string;
};

export type DiagnosisRequest = {
  image: DiagnosisImage;
  framework: "auto" | "react" | "typescript" | "javascript";
  context: string;
  code: string;
  language: "fr" | "en";
};

export type ModelCall = {
  model: string;
  purpose: "diagnose" | "repair";
  image?: DiagnosisImage;
  userText: string;
  responseSchema: boolean;
};

export type ModelCaller = (request: ModelCall) => Promise<string>;

type DiagnoseOptions = {
  model?: string;
  fallbackModel?: string;
  now?: () => number;
};

export async function diagnose(
  input: DiagnosisRequest,
  caller: ModelCaller,
  options: DiagnoseOptions = {},
): Promise<AnalysisReport> {
  const now = options.now ?? Date.now;
  const started = now();
  const primary = options.model ?? (process.env.GEMMA_MODEL?.trim() || PRIMARY_MODEL);
  const fallback = options.fallbackModel ?? FALLBACK_MODEL;
  let calls = 0;
  let modelUsed = primary;

  const invoke = async (request: ModelCall) => {
    if (calls >= LIMITS.maxProviderCalls) {
      throw new ProviderError("unavailable");
    }
    calls += 1;
    return caller(request);
  };

  const userText = buildUserPrompt(input);
  const diagnoseCall = (model: string, responseSchema: boolean): ModelCall => ({
    model,
    purpose: "diagnose",
    image: input.image,
    userText,
    responseSchema,
  });

  let text: string;
  try {
    text = await invoke(diagnoseCall(primary, true));
  } catch (error) {
    const mapped = error instanceof ProviderError ? error : new ProviderError("unavailable");
    if (mapped.kind === "schema_unsupported") {
      text = await invoke(diagnoseCall(primary, false));
    } else if (mapped.kind === "model_not_found" && fallback !== primary) {
      modelUsed = fallback;
      text = await invoke(diagnoseCall(fallback, true));
    } else if (mapped.kind === "transient") {
      text = await invoke(diagnoseCall(primary, true));
    } else {
      throw mapped;
    }
  }

  const finish = (output: ModelOutput): AnalysisReport => ({
    ...output,
    metadata: {
      model: modelUsed,
      mode: "live",
      promptVersion: PROMPT_VERSION,
      durationMs: Math.max(0, now() - started),
    },
  });

  try {
    return finish(parseModelOutput(text));
  } catch (error) {
    if (!(error instanceof ModelOutputError)) {
      throw error;
    }
    const repaired = await invoke({
      model: modelUsed,
      purpose: "repair",
      userText: buildRepairPrompt(text),
      responseSchema: true,
    });
    return finish(parseModelOutput(repaired));
  }
}
