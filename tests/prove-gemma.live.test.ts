import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { diagnose } from "../lib/server/diagnose";
import { createGemmaCaller } from "../lib/server/gemma";

const enabled = process.env.GEMMA_LIVE_TEST === "1" && Boolean(process.env.GEMINI_API_KEY?.trim());

describe.skipIf(!enabled)("live Gemma", () => {
  it("analyzes the public React capture", async () => {
    const bytes = readFileSync("examples/react-map-undefined/error.png");
    const report = await diagnose(
      {
        image: { mimeType: "image/png", dataBase64: bytes.toString("base64") },
        framework: "react",
        context: "J'affiche les noms au premier rendu, avant que la liste soit chargée.",
        code: "function renderNames(users) {\n  return users.map((user) => user.name);\n}",
        language: "fr",
      },
      createGemmaCaller(),
    );

    expect(report.metadata.mode).toBe("live");
    expect(report.metadata.model).toMatch(/^gemma-4-/);
    expect(["diagnosed", "needs_context", "unreadable", "no_error_detected"]).toContain(report.status);
    console.info(
      JSON.stringify({
        model: report.metadata.model,
        status: report.status,
        durationMs: report.metadata.durationMs,
        promptVersion: report.metadata.promptVersion,
        observedError: report.observedError,
      }),
    );
  }, 45_000);
});
