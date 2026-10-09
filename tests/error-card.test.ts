import { describe, expect, it } from "vitest";
import type { AnalysisReport } from "../lib/analysis-schema";
import { buildErrorCard, errorCardToMarkdown } from "../lib/error-card";
import { buildLineDiff } from "../lib/code-diff";

const report: AnalysisReport = {
  status: "diagnosed",
  observedError: "Cannot read properties of null (reading 'length')",
  evidence: ["TypeError visible"],
  hypotheses: [
    {
      cause: "email est null.",
      justification: "length est lu sur null.",
      toVerify: "Vérifier l'initialisation.",
    },
  ],
  explanation: "length exige une chaîne.",
  proposedFix: "Garder si email est null.",
  suggestedCode: "if (!email || email.length === 0) {\n  return false;\n}",
  verificationSteps: [{ action: "Soumettre sans email.", expectedResult: "Pas de TypeError." }],
  missingContext: [],
  limitations: ["Pas d'exécution."],
  investigationQuestion: {
    prompt: "Comment email est-il initialisé ?",
    why: "Pour distinguer null initial et réponse API.",
  },
  learn: {
    question: "Que renvoie .length sur null ?",
    hint: "null n'a pas de propriétés.",
    explanation: "Il faut tester null avant length.",
  },
  learnedPrinciple: "Vérifier la forme des données avant d'accéder aux propriétés.",
  prevention: ["Typer les états possibles."],
  changeNotes: ["Ajoute un garde avant length."],
  metadata: {
    model: "gemma-4-26b-a4b-it",
    mode: "live",
    promptVersion: "2026-10-09.4",
    durationMs: 9000,
  },
};

describe("error card and diff", () => {
  it("builds a markdown fiche without image and optional code", () => {
    const withoutCode = buildErrorCard(report, { framework: "typescript", includeCode: false });
    const markdown = errorCardToMarkdown(withoutCode);
    expect(markdown).toContain("Principe appris");
    expect(markdown).toContain(report.learnedPrinciple ?? "");
    expect(markdown).not.toContain("if (!email");
    expect(markdown).toContain("Correction proposée");

    const withCode = buildErrorCard(report, { framework: "typescript", includeCode: true });
    expect(errorCardToMarkdown(withCode)).toContain("if (!email");
  });

  it("marks a user-declared resolution without claiming automatic validation", () => {
    const card = buildErrorCard(report, {
      framework: "typescript",
      cardStatus: "resolution_declaree",
    });
    expect(errorCardToMarkdown(card)).toContain("Résolution déclarée par l'utilisateur");
    expect(errorCardToMarkdown(card)).toContain("pas une validation automatique");
  });

  it("builds a readable line diff", () => {
    const lines = buildLineDiff("if (email.length === 0) {", "if (!email || email.length === 0) {");
    expect(lines.some((line) => line.kind === "removed")).toBe(true);
    expect(lines.some((line) => line.kind === "added")).toBe(true);
  });
});
