import { timingSafeEqual } from "node:crypto";
import { analyzeInputSchema, decodeImageBase64, ModelOutputError } from "@/lib/analysis-schema";
import { LIMITS } from "@/lib/limits";
import { type PublicErrorCode, publicErrorMessage } from "@/lib/public-errors";
import { diagnose, type ModelCaller, ProviderError } from "@/lib/server/diagnose";
import { createGemmaCaller } from "@/lib/server/gemma";
import { acquireAnalysisSlot, clientRateKey } from "@/lib/server/rate-limit";
import { validateImageBytes } from "@/lib/validate-upload";

type HandleDeps = {
  caller?: ModelCaller;
};

export async function handleAnalyze(request: Request, deps: HandleDeps = {}): Promise<Response> {
  const started = Date.now();
  if (!isSameOrigin(request)) {
    return jsonError(403, "unsupported_origin");
  }
  if (!hasDemoAccess(request)) {
    return jsonError(401, "demo_forbidden");
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > LIMITS.maxContentLength) {
    return jsonError(413, "payload_too_large");
  }

  const slot = acquireAnalysisSlot(clientRateKey(request));
  if (!slot.ok) {
    return jsonError(429, slot.reason);
  }

  try {
    const body = await readJson(request);
    if (!body) {
      return jsonError(400, "invalid_body");
    }

    const parsed = analyzeInputSchema.safeParse(body);
    if (!parsed.success) {
      const tooLong = parsed.error.issues.some((issue) => issue.message === "text_too_long");
      return jsonError(400, tooLong ? "text_too_long" : "invalid_body");
    }

    const bytes = decodeImageBase64(parsed.data.imageBase64);
    if (!bytes) {
      return jsonError(400, "invalid_image");
    }
    const image = validateImageBytes(bytes);
    if (!image.ok) {
      return jsonError(400, image.code);
    }

    const caller = deps.caller ?? createGemmaCaller(request.signal);
    const report = await diagnose(
      {
        image: { mimeType: image.mimeType, dataBase64: Buffer.from(bytes).toString("base64") },
        framework: parsed.data.framework,
        context: parsed.data.context,
        code: parsed.data.code,
        language: parsed.data.language,
      },
      caller,
    );

    console.info(
      JSON.stringify({
        event: "analyze",
        outcome: "ok",
        status: report.status,
        model: report.metadata.model,
        durationMs: Date.now() - started,
      }),
    );
    return Response.json({ ok: true, report });
  } catch (error) {
    const code = errorCode(error);
    console.info(
      JSON.stringify({
        event: "analyze",
        outcome: code,
        durationMs: Date.now() - started,
      }),
    );
    return jsonError(statusFor(code), code);
  } finally {
    slot.release();
  }
}

function errorCode(error: unknown): PublicErrorCode {
  if (error instanceof ProviderError) {
    if (error.kind === "missing_key" || error.kind === "auth" || error.kind === "quota") {
      return error.kind;
    }
    if (error.kind === "timeout" || error.kind === "cancelled") {
      return error.kind === "timeout" ? "timeout" : "cancelled";
    }
    if (error.kind === "invalid" || error.kind === "schema_unsupported") {
      return "invalid_output";
    }
    return "unavailable";
  }
  if (error instanceof ModelOutputError) {
    return "invalid_output";
  }
  return "unavailable";
}

function statusFor(code: PublicErrorCode): number {
  if (code === "quota" || code === "in_flight") {
    return 429;
  }
  if (code === "timeout" || code === "cancelled") {
    return 408;
  }
  if (code === "missing_key" || code === "auth" || code === "invalid_output" || code === "unavailable") {
    return 502;
  }
  return 400;
}

function jsonError(status: number, code: PublicErrorCode): Response {
  return Response.json(
    { ok: false, error: { code, message: publicErrorMessage[code] } },
    { status },
  );
}

async function readJson(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export function hasDemoAccess(request: Request): boolean {
  const expected = process.env.DEMO_ACCESS_TOKEN?.trim();
  if (!expected) {
    return true;
  }
  const provided = request.headers.get("x-demo-access") ?? "";
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}
