import type { AnalysisReport } from "@/lib/analysis-schema";

const statusLabel: Record<AnalysisReport["status"], string> = {
  diagnosed: "Diagnostic",
  needs_context: "Contexte insuffisant",
  unreadable: "Capture illisible",
  no_error_detected: "Aucune erreur visible",
};

export function reportToMarkdown(report: AnalysisReport): string {
  const lines = [
    `# Screenshot Debugger`,
    ``,
    `Statut : ${statusLabel[report.status]}`,
    ``,
    section("Erreur observée", report.observedError),
    listSection("Indices", report.evidence),
    hypothesesSection(report.hypotheses),
    section("Explication", report.explanation),
    section("Correction proposée", report.proposedFix),
    codeSection(report.suggestedCode),
    stepsSection(report.verificationSteps),
    listSection("Contexte manquant", report.missingContext),
    listSection("Limites", report.limitations),
    ``,
    `Modèle : ${report.metadata.model}`,
    `Mode : ${report.metadata.mode}`,
    `Version du prompt : ${report.metadata.promptVersion}`,
    `Durée : ${report.metadata.durationMs} ms`,
    ``,
    `Cette correction est une proposition. L'application ne l'a pas exécutée.`,
  ];
  return lines.join("\n");
}

export function issueDraftMarkdown(report: AnalysisReport): string {
  const title = report.observedError ?? statusLabel[report.status];
  return [`## Brouillon d'issue`, ``, `Titre suggéré : ${title}`, ``, reportToMarkdown(report)].join(
    "\n",
  );
}

function section(title: string, body: string | null): string {
  return [`## ${title}`, ``, body ?? "Non fourni.", ``].join("\n");
}

function listSection(title: string, items: string[]): string {
  const body = items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "Non fourni.";
  return [`## ${title}`, ``, body, ``].join("\n");
}

function hypothesesSection(items: AnalysisReport["hypotheses"]): string {
  if (items.length === 0) {
    return section("Hypothèses", null);
  }
  const body = items
    .map(
      (item, index) =>
        `${index + 1}. ${item.cause}\n   Justification : ${item.justification}\n   À vérifier : ${item.toVerify}`,
    )
    .join("\n");
  return [`## Hypothèses`, ``, body, ``].join("\n");
}

function stepsSection(items: AnalysisReport["verificationSteps"]): string {
  if (items.length === 0) {
    return section("Vérification", null);
  }
  const body = items
    .map((item, index) => `${index + 1}. ${item.action}\n   Résultat attendu : ${item.expectedResult}`)
    .join("\n");
  return [`## Vérification`, ``, body, ``].join("\n");
}

function codeSection(code: string | null): string {
  if (!code) {
    return section("Code proposé", null);
  }
  return [`## Code proposé`, ``, fence(code), ``].join("\n");
}

function fence(code: string): string {
  const runs = code.match(/`+/g) ?? [];
  const width = Math.max(3, ...runs.map((run) => run.length + 1));
  const ticks = "`".repeat(width);
  return `${ticks}\n${code}\n${ticks}`;
}
