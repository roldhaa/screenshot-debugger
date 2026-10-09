import { writeFileSync } from "node:fs";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEMO_EXAMPLES } from "../lib/demo-examples";
import { diagnose } from "../lib/server/diagnose";
import { createGemmaCaller } from "../lib/server/gemma";

const enabled = process.env.GEMMA_LIVE_TEST === "1" && Boolean(process.env.GEMINI_API_KEY?.trim());
const exampleId = (process.env.HARNESS_EXAMPLE?.trim() || "2") as "1" | "2" | "3";
const example = DEMO_EXAMPLES.find((item) => item.id === exampleId) ?? DEMO_EXAMPLES[0];

describe.skipIf(!enabled)("harness demo", () => {
  it(`diagnoses demo example ${example.id} live`, async () => {
    const relative = example.fixturePath.replace(/^\//, "public/");
    const bytes = readFileSync(relative);
    const report = await diagnose(
      {
        image: { mimeType: "image/png", dataBase64: bytes.toString("base64") },
        framework: example.framework,
        context: example.context,
        code: example.code,
        language: "fr",
      },
      createGemmaCaller(),
    );

    expect(report.metadata.mode).toBe("live");
    expect(report.metadata.model).toMatch(/^gemma-4-/);
    expect(["diagnosed", "needs_context", "unreadable", "no_error_detected"]).toContain(report.status);

    const summary = {
      harness: "screenshot-debugger",
      example: example.id,
      model: report.metadata.model,
      status: report.status,
      mode: report.metadata.mode,
      durationMs: report.metadata.durationMs,
      observedError: report.observedError,
    };
    const outPath = process.env.HARNESS_OUT?.trim();
    if (outPath) {
      writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`);
    }
  }, 45_000);
});
