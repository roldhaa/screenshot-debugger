import { afterEach, describe, expect, it } from "vitest";
import { LIMITS } from "../lib/limits";
import { ProviderError } from "../lib/server/diagnose";
import { handleAnalyze } from "../lib/server/handle-analyze";
import { acquireAnalysisSlot, resetRateLimitForTests } from "../lib/server/rate-limit";

const PNG_1X1 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const validJson = JSON.stringify({
  status: "no_error_detected",
  observedError: null,
  evidence: ["L'image est un pixel."],
  hypotheses: [],
  explanation: "Aucun message d'erreur n'est visible.",
  proposedFix: null,
  suggestedCode: null,
  verificationSteps: [],
  missingContext: [],
  limitations: ["Image de test minuscule."],
});

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: {
      origin: "http://localhost",
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

const input = {
  imageBase64: PNG_1X1,
  framework: "react",
  context: "affichage",
  code: "users.map((user) => user.name)",
  language: "fr",
};

describe("handleAnalyze", () => {
  afterEach(() => {
    resetRateLimitForTests();
    delete process.env.DEMO_ACCESS_TOKEN;
    delete process.env.GEMINI_API_KEY;
    delete process.env.PUBLIC_APP_URL;
  });


  it("rejects an invalid image before calling the provider", async () => {
    let calls = 0;
    const response = await handleAnalyze(
      request({ ...input, imageBase64: Buffer.from("<svg></svg>").toString("base64") }),
      {
        caller: async () => {
          calls += 1;
          return validJson;
        },
      },
    );
    expect(response.status).toBe(400);
    expect(calls).toBe(0);
    const payload = await response.json();
    expect(payload.error.code).toBe("unsupported_type");
  });

  it("returns a normalized report and never echoes a server key", async () => {
    process.env.GEMINI_API_KEY = "AIzaSECRETVALUE";
    const response = await handleAnalyze(request(input), { caller: async () => validJson });
    const text = await response.text();
    expect(response.status).toBe(200);
    expect(text).toContain("no_error_detected");
    expect(text).toContain("gemma-4-26b-a4b-it");
    expect(text).not.toContain("AIzaSECRETVALUE");
  });

  it("rejects a cross-origin request and a missing demo token", async () => {
    const cross = await handleAnalyze(
      request(input, { origin: "https://evil.example" }),
      { caller: async () => validJson },
    );
    expect(cross.status).toBe(403);

    process.env.PUBLIC_APP_URL = "https://screenshot-debugger-qzyjc.ondigitalocean.app";
    const proxied = await handleAnalyze(
      request(input, {
        origin: "https://screenshot-debugger-qzyjc.ondigitalocean.app",
      }),
      { caller: async () => validJson },
    );
    expect(proxied.status).toBe(200);
    delete process.env.PUBLIC_APP_URL;


    process.env.DEMO_ACCESS_TOKEN = "judge-access";
    const denied = await handleAnalyze(request(input), { caller: async () => validJson });
    expect(denied.status).toBe(401);
    const allowed = await handleAnalyze(request(input, { "x-demo-access": "judge-access" }), {
      caller: async () => validJson,
    });
    expect(allowed.status).toBe(200);
  });

  it("stops answering after the hourly slot is exhausted", async () => {
    let calls = 0;
    for (let index = 0; index < LIMITS.rateLimitMax; index += 1) {
      const response = await handleAnalyze(request({ ...input, imageBase64: "%%%" }), {
        caller: async () => {
          calls += 1;
          return validJson;
        },
      });
      expect(response.status).toBe(400);
    }
    const blocked = await handleAnalyze(request(input), {
      caller: async () => {
        calls += 1;
        return validJson;
      },
    });
    expect(blocked.status).toBe(429);
    expect(calls).toBe(0);
  });

  it("returns hostile model text as JSON data", async () => {
    const hostile = JSON.parse(validJson) as Record<string, unknown>;
    hostile.explanation = '<script>alert(1)</script> [lien](javascript:alert(1))';
    hostile.suggestedCode = "<img src=x onerror=alert(1)>";
    const response = await handleAnalyze(request(input), {
      caller: async () => JSON.stringify(hostile),
    });
    const text = await response.text();
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(text).toContain("<script>alert(1)</script>");
    expect(text).toContain("javascript:alert(1)");
    expect(text.startsWith("{")).toBe(true);
  });

  it("maps a timeout without including provider details", async () => {
    const response = await handleAnalyze(request(input), {
      caller: async () => {
        throw new ProviderError("timeout");
      },
    });
    expect(response.status).toBe(408);
    const payload = await response.json();
    expect(payload.error.message).toBe("L'analyse a dépassé le délai. Tu peux réessayer.");
    expect(JSON.stringify(payload)).not.toContain("stack");
  });

  it("reports a missing key without calling out to the network helper", async () => {
    const response = await handleAnalyze(request(input));
    expect(response.status).toBe(502);
    const payload = await response.json();
    expect(payload.error.code).toBe("missing_key");
    expect(payload.error.message).not.toMatch(/AIza|GEMINI_API_KEY=/);
  });
});

describe("acquireAnalysisSlot", () => {
  afterEach(() => {
    resetRateLimitForTests();
  });

  it("caps simultaneous analyses for this process", () => {
    const first = acquireAnalysisSlot("a");
    const second = acquireAnalysisSlot("b");
    const third = acquireAnalysisSlot("c");
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(third).toEqual({ ok: false, reason: "in_flight" });
    if (first.ok) {
      first.release();
    }
    expect(acquireAnalysisSlot("c").ok).toBe(true);
  });
});
