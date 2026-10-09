/** Client-side investigation unlock rules (no second Gemma call). */

export function normalizeInvestigationAnswer(answer: string): string | null {
  const trimmed = answer.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function isInvestigationPending(
  hasQuestion: boolean,
  investigationAnswer: string | null,
): boolean {
  return hasQuestion && investigationAnswer === null;
}

export function canShowSolution(options: {
  pendingInvestigation: boolean;
  mode: "learn" | "direct";
  revealFix: boolean;
}): boolean {
  return !options.pendingInvestigation && (options.mode === "direct" || options.revealFix);
}

export function canAcceptInvestigationAnswer(options: {
  hasReport: boolean;
  answer: string;
  existingAnswer: string | null;
  analyzing: boolean;
}): boolean {
  return (
    options.hasReport &&
    !options.analyzing &&
    options.existingAnswer === null &&
    normalizeInvestigationAnswer(options.answer) !== null
  );
}
