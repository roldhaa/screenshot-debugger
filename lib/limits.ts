/** Product limits. They are not provider or host limits. */
export const LIMITS = {
  maxImageBytes: 2 * 1024 * 1024,
  maxDimension: 4096,
  maxPixels: 8_000_000,
  maxTextChars: 15_000,
  maxBase64Chars: 3_000_000,
  maxContentLength: 4_000_000,
  requestTimeoutMs: 30_000,
  fastRetryMs: 8_000,
  maxProviderCalls: 2,
  maxSectionChars: 4_000,
  rateLimitWindowMs: 60 * 60 * 1000,
  rateLimitMax: 12,
  maxInFlight: 2,
} as const;
