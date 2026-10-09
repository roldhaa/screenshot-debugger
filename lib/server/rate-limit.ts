import { LIMITS } from "@/lib/limits";

type Bucket = {
  count: number;
  windowStart: number;
};

const buckets = new Map<string, Bucket>();
let inFlight = 0;

export type AnalysisSlot =
  | { ok: true; release: () => void }
  | { ok: false; reason: "in_flight" | "quota" };

/**
 * Per-process limit. On several serverless instances this is not a global quota.
 */
export function acquireAnalysisSlot(key: string, now = Date.now()): AnalysisSlot {
  if (inFlight >= LIMITS.maxInFlight) {
    return { ok: false, reason: "in_flight" };
  }

  const current = buckets.get(key);
  if (!current || now - current.windowStart >= LIMITS.rateLimitWindowMs) {
    buckets.set(key, { count: 1, windowStart: now });
  } else if (current.count >= LIMITS.rateLimitMax) {
    return { ok: false, reason: "quota" };
  } else {
    current.count += 1;
  }

  inFlight += 1;
  let released = false;
  return {
    ok: true,
    release() {
      if (released) {
        return;
      }
      released = true;
      inFlight = Math.max(0, inFlight - 1);
    },
  };
}

export function resetRateLimitForTests(): void {
  buckets.clear();
  inFlight = 0;
}

export function clientRateKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "local";
}
