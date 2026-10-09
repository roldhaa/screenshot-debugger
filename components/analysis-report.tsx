"use client";

import { useState } from "react";
import type { AnalysisReport } from "@/lib/analysis-schema";
import { CodeDiffView } from "@/components/code-diff";
import {
  buildErrorCard,
  deleteStoredErrorCard,
  errorCardToMarkdown,
  listStoredErrorCards,
  saveErrorCard,
  type ErrorCardStatus,
  type StoredErrorCard,
} from "@/lib/error-card";
import { issueDraftMarkdown, reportToMarkdown } from "@/lib/report-markdown";

const statusLabel = {
  diagnosed: "Diagnostic",
  needs_context: "Contexte insuffisant",
  unreadable: "Capture illisible",
  no_error_detected: "Aucune erreur visible",
} as const;

export type WorkshopMode = "learn" | "direct";

type AnalysisReportProps = {
  report: AnalysisReport | null;
  elapsedSeconds: number;
  analyzing: boolean;
  errorMessage: string | null;
  mode: WorkshopMode;
  userCode: string;
  framework: string;
  investigating: boolean;
  investigationRound: number;
  onInvestigate: (answer: string) => void;
};

export function AnalysisReportView({
  report,
  elapsedSeconds,
  analyzing,
  errorMessage,
  mode,
  userCode,
  framework,
  investigating,
  investigationRound,
  onInvestigate,
}: AnalysisReportProps) {
  return (
    <section aria-live="polite" className="flex min-w-0 flex-col gap-4">
      <h2 className="text-lg font-semibold">Résultat</h2>
      {analyzing || investigating ? (
        <p className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
          {investigating ? "Mise à jour de l'enquête avec Gemma 4" : "Analyse en cours avec"}{" "}
          <span className="font-semibold">Gemma 4 · gemma-4-26b-a4b-it</span>. Temps écoulé :{" "}
          {elapsedSeconds} s. Ce compteur n&apos;est pas une barre de progression du modèle.
        </p>
      ) : null}
      {errorMessage ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100"
        >
          {errorMessage}
        </p>
      ) : null}
      {!report && !analyzing && !investigating && !errorMessage ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          L&apos;enquête et le diagnostic s&apos;afficheront ici.
        </p>
      ) : null}
      {report ? (
        <ReportBody
          key={`${report.metadata.durationMs}-${report.observedError}-${mode}-${investigationRound}`}
          report={report}
          mode={mode}
          userCode={userCode}
          framework={framework}
          investigating={investigating}
          investigationRound={investigationRound}
          onInvestigate={onInvestigate}
        />
      ) : null}
    </section>
  );
}

function ReportBody({
  report,
  mode,
  userCode,
  framework,
  investigating,
  investigationRound,
  onInvestigate,
}: {
  report: AnalysisReport;
  mode: WorkshopMode;
  userCode: string;
  framework: string;
  investigating: boolean;
  investigationRound: number;
  onInvestigate: (answer: string) => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showLearnExplanation, setShowLearnExplanation] = useState(false);
  const [revealFix, setRevealFix] = useState(mode === "direct");
  const [answer, setAnswer] = useState("");
  const [includeCodeInCard, setIncludeCodeInCard] = useState(false);
  const [userResolved, setUserResolved] = useState(false);
  const [library, setLibrary] = useState<StoredErrorCard[]>(() => listStoredErrorCards());

  async function copy(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
  }

  const pendingInvestigation =
    Boolean(report.investigationQuestion) && investigationRound === 0;
  const showSolution = !pendingInvestigation && (mode === "direct" || revealFix);
  const cardStatus: ErrorCardStatus = userResolved
    ? "resolution_declaree"
    : report.proposedFix || report.suggestedCode
      ? "correction_proposee"
      : "diagnostic_propose";

  return (
    <article className="flex min-w-0 flex-col gap-4 rounded-md border border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-base font-semibold">{statusLabel[report.status]}</p>
        {report.metadata.mode === "live" ? (
          <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100">
            live
          </span>
        ) : null}
        <span className="rounded-full border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-600">
          {mode === "learn" ? "Mode Apprendre" : "Diagnostic direct"}
        </span>
      </div>

      {investigationRound > 0 ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
          Diagnostic mis à jour après ta réponse (tour {investigationRound} sur 2). Relis surtout
          les hypothèses, l&apos;explication et la correction — Gemma les a réévalués sans renvoyer
          l&apos;image.
        </p>
      ) : null}

      <ProminentField title="Erreur observée" value={report.observedError} />
      <NumberedEvidence items={report.evidence} />

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

      {report.investigationQuestion && investigationRound < 2 ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
          <h3 className="text-base font-semibold">Enquête</h3>
          <p className="mt-1 text-sm text-zinc-800 dark:text-zinc-200">
            Cette question sert à préciser une info absente de la capture (ex. état initial, forme
            de l&apos;API). Gemma s&apos;en sert pour affiner le diagnostic — sans renvoyer
            l&apos;image.{" "}
            {pendingInvestigation
              ? "Réponds d'abord ici : la correction reste masquée tant que tu n'as pas envoyé une réponse."
              : null}
          </p>
          <p className="mt-2 text-sm font-medium">{report.investigationQuestion.prompt}</p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
            Pourquoi : {report.investigationQuestion.why}
          </p>
          <label className="mt-3 block text-sm font-medium" htmlFor="investigation-answer">
            Ta réponse
          </label>
          <textarea
            id="investigation-answer"
            className="mt-1 min-h-24 w-full rounded-md border border-zinc-300 bg-white p-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            disabled={investigating}
            placeholder="Ex. users = undefined au premier rendu, ou Je ne sais pas"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="min-h-11 rounded-md bg-zinc-900 px-3 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              disabled={investigating || !answer.trim()}
              onClick={() => onInvestigate(answer.trim())}
            >
              Envoyer la réponse
            </button>
            <button
              type="button"
              className="min-h-11 rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-600 dark:bg-zinc-900"
              disabled={investigating}
              onClick={() => setAnswer("Je ne sais pas")}
            >
              Je ne sais pas
            </button>
          </div>
          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
            Tour {investigationRound + 1} sur 2. « Je ne sais pas » est valide : Gemma continue avec
            un contexte incomplet et peut proposer une protection prudente. Pas d&apos;image
            renvoyée.
          </p>
        </div>
      ) : null}

      {report.learn && mode === "learn" ? (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
          <h3 className="text-base font-semibold">Réfléchir avant la correction</h3>
          <p className="mt-2 text-sm">{report.learn.question}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="min-h-11 rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-600 dark:bg-zinc-900"
              onClick={() => setShowHint(true)}
              disabled={pendingInvestigation}
            >
              Donner un indice
            </button>
            <button
              type="button"
              className="min-h-11 rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-600 dark:bg-zinc-900"
              onClick={() => setShowLearnExplanation(true)}
              disabled={pendingInvestigation}
            >
              Voir l&apos;explication
            </button>
            <button
              type="button"
              className="min-h-11 rounded-md bg-blue-700 px-3 text-sm font-medium text-white disabled:opacity-50"
              onClick={() => setRevealFix(true)}
              disabled={pendingInvestigation}
            >
              Afficher la correction
            </button>
          </div>
          {pendingInvestigation ? (
            <p className="mt-3 text-sm text-zinc-800 dark:text-zinc-200">
              Réponds d&apos;abord à l&apos;enquête ci-dessus pour débloquer cette étape.
            </p>
          ) : null}
          {showHint ? <p className="mt-3 text-sm">Indice : {report.learn.hint}</p> : null}
          {showLearnExplanation ? (
            <p className="mt-3 text-sm">Explication : {report.learn.explanation}</p>
          ) : null}
        </div>
      ) : null}

      {showSolution ? (
        <>
          <ProminentField title="Correction proposée" value={report.proposedFix} />
          <CodeDiffView before={userCode} after={report.suggestedCode} changeNotes={report.changeNotes} />
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
          <Field title="Principe appris" value={report.learnedPrinciple} />
          <List title="Prévention" items={report.prevention} />
        </>
      ) : pendingInvestigation ? (
        <p className="rounded-md border border-zinc-200 p-3 text-sm text-zinc-800 dark:border-zinc-700 dark:text-zinc-200">
          Correction masquée : envoie d&apos;abord une réponse à l&apos;enquête (même « Je ne sais
          pas »). Ensuite tu pourras voir le correctif proposé.
        </p>
      ) : (
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          La correction reste masquée tant que tu n&apos;as pas demandé à la voir.
        </p>
      )}

      <List title="Contexte manquant" items={report.missingContext} />
      <List title="Limites" items={report.limitations} />

      <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-700">
        <h3 className="text-base font-semibold">Fiche d&apos;erreur</h3>
        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
          Export Markdown pour tes notes. Les données sauvées restent dans ce navigateur.
        </p>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeCodeInCard}
            onChange={(event) => setIncludeCodeInCard(event.target.checked)}
          />
          Inclure le code proposé dans l&apos;export
        </label>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={userResolved}
            onChange={(event) => setUserResolved(event.target.checked)}
          />
          Je déclare avoir résolu le problème (pas une validation automatique)
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="min-h-11 rounded-md bg-zinc-900 px-3 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
            onClick={() => {
              const card = buildErrorCard(report, {
                framework,
                cardStatus,
                includeCode: includeCodeInCard,
              });
              void copy("fiche", errorCardToMarkdown(card));
            }}
          >
            Exporter ma fiche en Markdown
          </button>
          <button
            type="button"
            className="min-h-11 rounded-md border border-zinc-300 px-3 text-sm dark:border-zinc-600"
            onClick={() => {
              const card = buildErrorCard(report, {
                framework,
                cardStatus,
                includeCode: includeCodeInCard,
              });
              saveErrorCard(card);
              setLibrary(listStoredErrorCards());
              setCopied("bibliothèque");
            }}
          >
            Sauver dans ce navigateur
          </button>
        </div>
        {library.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {library.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 pt-2 dark:border-zinc-700"
              >
                <span>
                  {item.title} · {new Date(item.savedAt).toLocaleString()}
                </span>
                <button
                  type="button"
                  className="min-h-9 rounded-md border border-zinc-300 px-2 text-xs dark:border-zinc-600"
                  onClick={() => {
                    deleteStoredErrorCard(item.id);
                    setLibrary(listStoredErrorCards());
                  }}
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <p className="text-xs text-zinc-600 dark:text-zinc-400">
        Modèle {report.metadata.model}, mode {report.metadata.mode}, prompt {report.metadata.promptVersion},{" "}
        {report.metadata.durationMs} ms. Cette correction est une proposition. Elle n&apos;a pas été exécutée.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="min-h-11 rounded-md bg-zinc-900 px-3 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
          onClick={() => copy("rapport", reportToMarkdown(report))}
        >
          Copier le rapport
        </button>
        <button
          type="button"
          className="min-h-11 rounded-md border border-zinc-300 px-3 text-sm dark:border-zinc-700"
          onClick={() => copy("issue", issueDraftMarkdown(report))}
        >
          Copier un brouillon d&apos;issue
        </button>
        {report.suggestedCode && showSolution ? (
          <button
            type="button"
            className="min-h-11 rounded-md border border-zinc-300 px-3 text-sm dark:border-zinc-700"
            onClick={() => copy("code", report.suggestedCode ?? "")}
          >
            Copier le code
          </button>
        ) : null}
      </div>
      {copied ? <p className="text-sm">Copié : {copied}.</p> : null}
    </article>
  );
}

function NumberedEvidence({ items }: { items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-medium">Indices observés</h3>
      {items.length === 0 ? (
        <p className="mt-1 text-sm">Non fourni.</p>
      ) : (
        <ol className="mt-2 flex list-decimal flex-col gap-2 pl-5 text-sm">
          {items.map((item, index) => (
            <li id={`evidence-${index + 1}`} key={item}>
              <span className="font-medium">[{index + 1}]</span> {item}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function ProminentField({ title, value }: { title: string; value: string | null }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-950">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 whitespace-pre-wrap text-base">{value ?? "Non fourni."}</p>
    </div>
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
