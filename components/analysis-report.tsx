import { useState } from "react";
import type { AnalysisReport } from "@/lib/analysis-schema";
import { issueDraftMarkdown, reportToMarkdown } from "@/lib/report-markdown";

const statusLabel = {
  diagnosed: "Diagnostic",
  needs_context: "Contexte insuffisant",
  unreadable: "Capture illisible",
  no_error_detected: "Aucune erreur visible",
} as const;

type AnalysisReportProps = {
  report: AnalysisReport | null;
  elapsedSeconds: number;
  analyzing: boolean;
  errorMessage: string | null;
};

export function AnalysisReportView({ report, elapsedSeconds, analyzing, errorMessage }: AnalysisReportProps) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
  }

  return (
    <section aria-live="polite" className="flex min-w-0 flex-col gap-4">
      <h2 className="text-lg font-semibold">Résultat</h2>
      {analyzing ? (
        <p className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
          Analyse en cours. L&apos;image et le texte sont envoyés à Google. Temps écoulé : {elapsedSeconds} s.
          Ce compteur ne représente pas une progression interne du modèle.
        </p>
      ) : null}
      {errorMessage ? (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
          {errorMessage}
        </p>
      ) : null}
      {!report && !analyzing && !errorMessage ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Le diagnostic s&apos;affichera ici.</p>
      ) : null}
      {report ? (
        <article className="flex min-w-0 flex-col gap-4 rounded-md border border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm font-semibold">{statusLabel[report.status]}</p>
          <Field title="Erreur observée" value={report.observedError} />
          <List title="Indices" items={report.evidence} />
          <div>
            <h3 className="text-sm font-medium">Hypothèses</h3>
            {report.hypotheses.length === 0 ? (
              <p className="mt-1 text-sm">Non fourni.</p>
            ) : (
              <ol className="mt-2 flex flex-col gap-3 text-sm">
                {report.hypotheses.map((item) => (
                  <li key={`${item.cause}-${item.toVerify}`}>
                    <p>{item.cause}</p>
                    <p className="text-zinc-700 dark:text-zinc-300">Justification : {item.justification}</p>
                    <p className="text-zinc-700 dark:text-zinc-300">À vérifier : {item.toVerify}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <Field title="Explication" value={report.explanation} />
          <Field title="Correction proposée" value={report.proposedFix} />
          <div>
            <h3 className="text-sm font-medium">Code proposé</h3>
            {report.suggestedCode ? (
              <pre className="mt-2 max-w-full overflow-x-auto rounded-md bg-zinc-950 p-3 text-sm text-zinc-50">
                <code>{report.suggestedCode}</code>
              </pre>
            ) : (
              <p className="mt-1 text-sm">Non fourni.</p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium">Vérification</h3>
            {report.verificationSteps.length === 0 ? (
              <p className="mt-1 text-sm">Non fourni.</p>
            ) : (
              <ol className="mt-2 flex list-decimal flex-col gap-2 pl-5 text-sm">
                {report.verificationSteps.map((step) => (
                  <li key={`${step.action}-${step.expectedResult}`}>
                    {step.action}
                    <span className="block text-zinc-700 dark:text-zinc-300">
                      Résultat attendu : {step.expectedResult}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <List title="Contexte manquant" items={report.missingContext} />
          <List title="Limites" items={report.limitations} />
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Modèle {report.metadata.model}, mode {report.metadata.mode}, prompt {report.metadata.promptVersion},{" "}
            {report.metadata.durationMs} ms. Cette correction est une proposition. Elle n&apos;a pas été exécutée.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="min-h-11 rounded-md bg-zinc-900 px-3 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900" onClick={() => copy("rapport", reportToMarkdown(report))}>
              Copier le rapport
            </button>
            <button type="button" className="min-h-11 rounded-md border border-zinc-300 px-3 text-sm dark:border-zinc-700" onClick={() => copy("issue", issueDraftMarkdown(report))}>
              Copier un brouillon d&apos;issue
            </button>
            {report.suggestedCode ? (
              <button type="button" className="min-h-11 rounded-md border border-zinc-300 px-3 text-sm dark:border-zinc-700" onClick={() => copy("code", report.suggestedCode ?? "")}>
                Copier le code
              </button>
            ) : null}
          </div>
          {copied ? <p className="text-sm">Copié : {copied}.</p> : null}
        </article>
      ) : null}
    </section>
  );
}

function Field({ title, value }: { title: string; value: string | null }) {
  return (
    <div>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="mt-1 whitespace-pre-wrap text-sm">{value ?? "Non fourni."}</p>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-medium">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-1 text-sm">Non fourni.</p>
      ) : (
        <ul className="mt-1 list-disc pl-5 text-sm">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
