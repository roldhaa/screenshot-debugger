import type { AnalysisReport } from "@/lib/analysis-schema";

export type ErrorCardStatus =
  | "diagnostic_propose"
  | "correction_proposee"
  | "resolution_declaree";

export type ErrorCard = {
  title: string;
  framework: string;
  symptom: string | null;
  observations: string[];
  probableCause: string | null;
  neededContext: string[];
  proposedFix: string | null;
  suggestedCode: string | null;
  learnedPrinciple: string | null;
  verificationSteps: { action: string; expectedResult: string }[];
  prevention: string[];
  limitations: string[];
  changeNotes: string[];
  cardStatus: ErrorCardStatus;
  model: string;
  promptVersion: string;
};

const cardStatusLabel: Record<ErrorCardStatus, string> = {
  diagnostic_propose: "Diagnostic proposé",
  correction_proposee: "Correction proposée",
  resolution_declaree: "Résolution déclarée par l'utilisateur",
};

export function buildErrorCard(
  report: AnalysisReport,
  options: {
    framework: string;
    cardStatus?: ErrorCardStatus;
    includeCode?: boolean;
  },
): ErrorCard {
  const cardStatus =
    options.cardStatus ??
    (report.proposedFix || report.suggestedCode ? "correction_proposee" : "diagnostic_propose");
  return {
    title: report.observedError ?? "Fiche d'erreur Screenshot Debugger",
    framework: options.framework,
    symptom: report.observedError,
    observations: report.evidence,
    probableCause: report.hypotheses[0]?.cause ?? null,
    neededContext: report.missingContext,
    proposedFix: report.proposedFix,
    suggestedCode: options.includeCode ? report.suggestedCode : null,
    learnedPrinciple: report.learnedPrinciple,
    verificationSteps: report.verificationSteps,
    prevention: report.prevention,
    limitations: report.limitations,
    changeNotes: report.changeNotes,
    cardStatus,
    model: report.metadata.model,
    promptVersion: report.metadata.promptVersion,
  };
}

export function errorCardToMarkdown(card: ErrorCard): string {
  const lines = [
    `# ${card.title}`,
    ``,
    `Statut : ${cardStatusLabel[card.cardStatus]}`,
    `Langage / framework : ${card.framework}`,
    ``,
    section("Symptôme", card.symptom),
    listSection("Observations", card.observations),
    section("Cause probable", card.probableCause),
    listSection("Contexte nécessaire", card.neededContext),
    section("Correction proposée", card.proposedFix),
    card.suggestedCode
      ? [`## Code proposé`, ``, fence(card.suggestedCode), ``].join("\n")
      : "",
    listSection("Notes sur le changement", card.changeNotes),
    section("Principe appris", card.learnedPrinciple),
    stepsSection(card.verificationSteps),
    listSection("Prévention", card.prevention),
    listSection("Limites du diagnostic", card.limitations),
    ``,
    `Modèle : ${card.model}`,
    `Prompt : ${card.promptVersion}`,
    ``,
    `Cette fiche est une aide pédagogique. L'application n'a pas exécuté la correction.`,
    `Une résolution déclarée par l'utilisateur n'est pas une validation automatique.`,
  ];
  return lines.filter((line) => line !== "").join("\n");
}

const STORAGE_KEY = "screenshot-debugger-error-cards-v1";

export type StoredErrorCard = ErrorCard & { id: string; savedAt: string };

export function listStoredErrorCards(): StoredErrorCard[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as StoredErrorCard[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveErrorCard(card: ErrorCard): StoredErrorCard {
  const entry: StoredErrorCard = {
    ...card,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: new Date().toISOString(),
  };
  const next = [entry, ...listStoredErrorCards()].slice(0, 20);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return entry;
}

export function deleteStoredErrorCard(id: string): void {
  const next = listStoredErrorCards().filter((item) => item.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function section(title: string, body: string | null): string {
  return [`## ${title}`, ``, body ?? "Non fourni.", ``].join("\n");
}

function listSection(title: string, items: string[]): string {
  const body = items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "Non fourni.";
  return [`## ${title}`, ``, body, ``].join("\n");
}

function stepsSection(items: ErrorCard["verificationSteps"]): string {
  if (items.length === 0) {
    return section("Vérification", null);
  }
  const body = items
    .map((item, index) => `${index + 1}. ${item.action}\n   Résultat attendu : ${item.expectedResult}`)
    .join("\n");
  return [`## Vérification`, ``, body, ``].join("\n");
}

function fence(code: string): string {
  const runs = code.match(/`+/g) ?? [];
  const width = Math.max(3, ...runs.map((run) => run.length + 1));
  const ticks = "`".repeat(width);
  return `${ticks}\n${code}\n${ticks}`;
}
