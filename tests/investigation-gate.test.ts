import { describe, expect, it } from "vitest";
import {
  canAcceptInvestigationAnswer,
  canShowSolution,
  isInvestigationPending,
  normalizeInvestigationAnswer,
} from "../lib/investigation-gate";

describe("investigation gate (demo-safe unlock)", () => {
  it("trims answers and rejects blanks", () => {
    expect(normalizeInvestigationAnswer("  Je ne sais pas  ")).toBe("Je ne sais pas");
    expect(normalizeInvestigationAnswer("   ")).toBeNull();
    expect(normalizeInvestigationAnswer("")).toBeNull();
  });

  it("blocks the fix until an answer exists when a question is present", () => {
    expect(isInvestigationPending(true, null)).toBe(true);
    expect(isInvestigationPending(true, "Je ne sais pas")).toBe(false);
    expect(isInvestigationPending(false, null)).toBe(false);
  });

  it("shows the solution in direct mode once investigation is done", () => {
    expect(
      canShowSolution({ pendingInvestigation: true, mode: "direct", revealFix: true }),
    ).toBe(false);
    expect(
      canShowSolution({ pendingInvestigation: false, mode: "direct", revealFix: false }),
    ).toBe(true);
  });

  it("keeps the fix hidden in learn mode until Afficher la correction", () => {
    expect(
      canShowSolution({ pendingInvestigation: false, mode: "learn", revealFix: false }),
    ).toBe(false);
    expect(
      canShowSolution({ pendingInvestigation: false, mode: "learn", revealFix: true }),
    ).toBe(true);
  });

  it("accepts any non-empty answer once, never while analyzing", () => {
    expect(
      canAcceptInvestigationAnswer({
        hasReport: true,
        answer: "users est undefined",
        existingAnswer: null,
        analyzing: false,
      }),
    ).toBe(true);
    expect(
      canAcceptInvestigationAnswer({
        hasReport: true,
        answer: "Je ne sais pas",
        existingAnswer: null,
        analyzing: false,
      }),
    ).toBe(true);
    expect(
      canAcceptInvestigationAnswer({
        hasReport: true,
        answer: "  ",
        existingAnswer: null,
        analyzing: false,
      }),
    ).toBe(false);
    expect(
      canAcceptInvestigationAnswer({
        hasReport: true,
        answer: "ok",
        existingAnswer: "déjà répondu",
        analyzing: false,
      }),
    ).toBe(false);
    expect(
      canAcceptInvestigationAnswer({
        hasReport: true,
        answer: "ok",
        existingAnswer: null,
        analyzing: true,
      }),
    ).toBe(false);
    expect(
      canAcceptInvestigationAnswer({
        hasReport: false,
        answer: "ok",
        existingAnswer: null,
        analyzing: false,
      }),
    ).toBe(false);
  });
});
