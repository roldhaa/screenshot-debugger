import { investigateInputSchema, ModelOutputError } from "@/lib/analysis-schema";
import { LIMITS } from "@/lib/limits";
import { type PublicErrorCode, publicErrorMessage } from "@/lib/public-errors";
import { investigate, type ModelCaller, ProviderError } from "@/lib/server/diagnose";
import { createGemmaCaller } from "@/lib/server/gemma";
import { hasDemoAccess, isSameOrigin } from "@/lib/server/handle-analyze";
import { acquireAnalysisSlot, clientRateKey } from "@/lib/server/rate-limit";

type HandleDeps = {
  caller?: ModelCaller;
};

export async function handleInvestigate(request: Request, deps: HandleDeps = {}): Promise<Response> {
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
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError(400, "invalid_body");
    }

    const parsed = investigateInputSchema.safeParse(body);
    if (!parsed.success) {
      const tooLong = parsed.error.issues.some((issue) => issue.message === "text_too_long");
      return jsonError(400, tooLong ? "text_too_long" : "invalid_body");
    }

    const caller = deps.caller ?? createGemmaCaller(request.signal);
    const report = await investigate(parsed.data, caller);

    console.info(
      JSON.stringify({
        event: "investigate",
        outcome: "ok",
        status: report.status,
        model: report.metadata.model,
        round: parsed.data.round,
        durationMs: Date.now() - started,
      }),
    );
    return Response.json({ ok: true, report });
  } catch (error) {
    const code = errorCode(error);
    console.info(
      JSON.stringify({
        event: "investigate",
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
