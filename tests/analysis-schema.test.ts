import { describe, expect, it } from "vitest";
import {
  analyzeInputSchema,
  type AnalysisReport,
  ModelOutputError,
  parseModelOutput,
} from "../lib/analysis-schema";
import { LIMITS } from "../lib/limits";
import { issueDraftMarkdown, reportToMarkdown } from "../lib/report-markdown";

const validOutput = {
  status: "diagnosed" as const,
  observedError: "Cannot read properties of undefined (reading 'map')",
  evidence: ["La console affiche TypeError"],
  hypotheses: [
    {
      cause: "La liste n'est pas encore définie.",
      justification: "map est appelé sur la valeur affichée undefined.",
      toVerify: "Vérifier la valeur avant le rendu.",
    },
  ],
  explanation: "map ne peut pas être appelé sur undefined.",
  proposedFix: "Donner un tableau vide tant que les données ne sont pas arrivées.",
  suggestedCode: "const names = (users ?? []).map((user) => user.name);",
  verificationSteps: [
    {
      action: "Recharger la page avant l'arrivée des données.",
      expectedResult: "La liste reste vide, sans TypeError.",
    },
  ],
  missingContext: [],
  limitations: ["La capture ne montre pas l'appel réseau."],
};

const metadata = {
  model: "gemma-4-26b-a4b-it",
  mode: "live" as const,
  promptVersion: "2026-10-09.1",
  durationMs: 1200,
};

describe("parseModelOutput", () => {
  it("accepts a valid diagnosis and drops metadata invented by the model", () => {
    const output = parseModelOutput(
      JSON.stringify({ ...validOutput, metadata: { model: "fake-model", mode: "live" } }),
    );
    expect(output.observedError).toBe(validOutput.observedError);
    expect(output).not.toHaveProperty("metadata");
  });

  it("accepts JSON wrapped in a fence", () => {
    expect(parseModelOutput("```json\n" + JSON.stringify(validOutput) + "\n```").status).toBe(
      "diagnosed",
    );
  });

  it("rejects empty, truncated and non JSON text", () => {
    expect(() => parseModelOutput("")).toThrow(ModelOutputError);
    expect(() => parseModelOutput("{")).toThrowError(
      expect.objectContaining({ reason: "invalid_json" }),
    );
    expect(() => parseModelOutput("   ")).toThrowError(
      expect.objectContaining({ reason: "empty" }),
    );
  });

  it("rejects missing fields, extra-long text and a diagnosis without an observed error", () => {
    expect(() => parseModelOutput(JSON.stringify({ status: "diagnosed" }))).toThrowError(
      expect.objectContaining({ reason: "nonconforming" }),
    );
    expect(() =>
      parseModelOutput(JSON.stringify({ ...validOutput, explanation: "x".repeat(2001) })),
    ).toThrowError(expect.objectContaining({ reason: "nonconforming" }));
    expect(() =>
      parseModelOutput(JSON.stringify({ ...validOutput, observedError: null })),
    ).toThrowError(expect.objectContaining({ reason: "nonconforming" }));
  });

  it.each([
    ["needs_context", { ...validOutput, status: "needs_context", missingContext: ["Le fichier source."] }],
    ["unreadable", { ...validOutput, status: "unreadable", observedError: null, proposedFix: null }],
    ["no_error_detected", { ...validOutput, status: "no_error_detected", observedError: null, proposedFix: null }],
  ] as const)("accepts status %s", (_status, payload) => {
    expect(parseModelOutput(JSON.stringify(payload)).status).toBe(payload.status);
  });

  it("rejects needs_context when nothing is missing", () => {
    expect(() =>
      parseModelOutput(JSON.stringify({ ...validOutput, status: "needs_context", missingContext: [] })),
    ).toThrowError(expect.objectContaining({ reason: "nonconforming" }));
  });
});

describe("analyzeInputSchema", () => {
  const input = {
    imageBase64: "abcd",
    framework: "react",
    context: "J'affiche une liste.",
    code: "users.map()",
    language: "fr",
  };

  it("rejects an unknown framework and text over the combined limit", () => {
    expect(analyzeInputSchema.safeParse({ ...input, framework: "python" }).success).toBe(false);
    expect(
      analyzeInputSchema.safeParse({
        ...input,
        context: "a".repeat(LIMITS.maxTextChars),
        code: "b",
      }).success,
    ).toBe(false);
  });
});

describe("reportToMarkdown", () => {
  const report: AnalysisReport = { ...validOutput, metadata };

  it("keeps hostile text literal and preserves the proposed code", () => {
    const hostile: AnalysisReport = {
      ...report,
      explanation: '<script>alert(1)</script> [clique](javascript:alert(1))',
      suggestedCode: "const value = `template`;",
    };
    const markdown = reportToMarkdown(hostile);
    expect(markdown).toContain("<script>alert(1)</script>");
    expect(markdown).toContain("javascript:alert(1)");
    expect(markdown).toContain("const value = `template`;");
    expect(markdown).not.toContain("<img");
  });

  it("does not invent a missing fix", () => {
    const markdown = reportToMarkdown({
      ...report,
      status: "needs_context",
      proposedFix: null,
      suggestedCode: null,
      missingContext: ["Le composant qui appelle map."],
    });
    expect(markdown).toContain("Correction proposée");
    expect(markdown).toContain("Non fourni.");
    expect(markdown).not.toContain("corrigé");
  });

  it("builds an issue draft from the same report", () => {
    expect(issueDraftMarkdown(report)).toContain("Brouillon d'issue");
    expect(issueDraftMarkdown(report)).toContain(report.observedError ?? "");
  });
});
