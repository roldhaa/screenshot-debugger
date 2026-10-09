"use client";

import { useEffect, useRef, useState } from "react";
import type { AnalysisReport } from "@/lib/analysis-schema";
import { DEMO_EXAMPLES, type DemoExample } from "@/lib/demo-examples";
import { LIMITS } from "@/lib/limits";
import { messageForUnreadableAnalyzeBody, publicErrorMessage } from "@/lib/public-errors";
import { uploadErrorMessage, validateImageBytes } from "@/lib/validate-upload";
import { AnalysisReportView } from "@/components/analysis-report";
import { ContextForm } from "@/components/context-form";
import { ScreenshotInput } from "@/components/screenshot-input";

type ApiError = { code: string; message: string };

export function DebuggerApp() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [framework, setFramework] = useState("auto");
  const [context, setContext] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("fr");
  const [showDemoToken, setShowDemoToken] = useState(false);
  const [demoToken, setDemoToken] = useState("");
  const [phase, setPhase] = useState<"idle" | "analyzing" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const requestId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const previewRef = useRef<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("screenshot-debugger-demo-access") ?? "";
    void fetch("/api/analyze")
      .then((response) => response.json())
      .then((payload: { demoProtected?: boolean }) => {
        setShowDemoToken(Boolean(payload.demoProtected));
        if (stored) {
          setDemoToken(stored);
        }
      })
      .catch(() => {
        setShowDemoToken(false);
        if (stored) {
          setDemoToken(stored);
        }
      });
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (phase !== "analyzing") {
      return;
    }
    const started = Date.now();
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - started) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  function replacePreview(nextUrl: string | null) {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
    }
    previewRef.current = nextUrl;
    setPreviewUrl(nextUrl);
  }

  function invalidatePendingResult() {
    requestId.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    setReport(null);
    setErrorMessage(null);
    setPhase("idle");
    setElapsedSeconds(0);
  }

  async function selectFile(file: File) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const validation = validateImageBytes(bytes);
    if (!validation.ok) {
      setFileError(uploadErrorMessage[validation.code]);
      return;
    }
    invalidatePendingResult();
    setFileError(null);
    setImageBase64(bytesToBase64(bytes));
    replacePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    invalidatePendingResult();
    setImageBase64(null);
    setFileError(null);
    replacePreview(null);
  }

  async function loadDemoExample(example: DemoExample) {
    const response = await fetch(example.fixturePath);
    if (!response.ok) {
      setFileError("L'exemple public est introuvable.");
      return;
    }
    const bytes = new Uint8Array(await response.arrayBuffer());
    const validation = validateImageBytes(bytes);
    if (!validation.ok) {
      setFileError(uploadErrorMessage[validation.code]);
      return;
    }
    invalidatePendingResult();
    setFileError(null);
    setImageBase64(bytesToBase64(bytes));
    replacePreview(URL.createObjectURL(new Blob([bytes], { type: validation.mimeType })));
    setFramework(example.framework);
    setLanguage("fr");
    setContext(example.context);
    setCode(example.code);
  }

  function clearSession() {
    removeImage();
    setFramework("auto");
    setContext("");
    setCode("");
    setLanguage("fr");
  }

  const textTooLong = context.length + code.length > LIMITS.maxTextChars;
  const canAnalyze = Boolean(imageBase64) && !textTooLong && phase !== "analyzing";

  async function analyze() {
    if (!imageBase64 || !canAnalyze) {
      return;
    }
    const id = requestId.current + 1;
    requestId.current = id;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setPhase("analyzing");
    setErrorMessage(null);
    setReport(null);
    setElapsedSeconds(0);
    if (demoToken) {
      sessionStorage.setItem("screenshot-debugger-demo-access", demoToken);
    }

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(demoToken ? { "x-demo-access": demoToken } : {}),
        },
        body: JSON.stringify({
          imageBase64,
          framework,
          context,
          code,
          language,
        }),
        signal: controller.signal,
      });
      const raw = await response.text();
      let payload: { ok: true; report: AnalysisReport } | { ok: false; error?: ApiError };
      try {
        payload = JSON.parse(raw) as typeof payload;
      } catch {
        if (id !== requestId.current) {
          return;
        }
        setPhase("error");
        setErrorMessage(messageForUnreadableAnalyzeBody(response.status));
        return;
      }
      if (id !== requestId.current) {
        return;
      }
      if (!payload.ok) {
        setPhase("error");
        setErrorMessage(payload.error?.message ?? publicErrorMessage.unavailable);
        return;
      }
      setReport(payload.report);
      setPhase("idle");
    } catch (error) {
      if (id !== requestId.current) {
        return;
      }
      if (error instanceof DOMException && error.name === "AbortError") {
        setPhase("error");
        setErrorMessage(publicErrorMessage.cancelled);
        return;
      }
      setPhase("error");
      setErrorMessage("La connexion a échoué. Tu peux réessayer.");
    }
  }

  function cancel() {
    abortRef.current?.abort();
  }

  return (
    <div className="min-h-full bg-zinc-100 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5">
          <h1 className="text-2xl font-semibold tracking-tight">Screenshot Debugger</h1>
          <p className="max-w-3xl text-sm text-zinc-700 dark:text-zinc-300">
            Pour les étudiants en JavaScript, TypeScript et React : la capture part vers Gemma 4. La
            correction est proposée, jamais exécutée.
          </p>
        </div>
      </header>
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-2">
        <section className="flex min-w-0 flex-col gap-5 rounded-md border border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">Capture et contexte</h2>
          <ScreenshotInput
            previewUrl={previewUrl}
            fileError={fileError}
            onSelect={(file) => {
              void selectFile(file);
            }}
            onRemove={removeImage}
          />
          <ContextForm
            framework={framework}
            context={context}
            code={code}
            language={language}
            showDemoToken={showDemoToken}
            demoToken={demoToken}
            onFramework={setFramework}
            onContext={setContext}
            onCode={setCode}
            onLanguage={setLanguage}
            onDemoToken={setDemoToken}
          />
          <div className="flex flex-wrap gap-2">
            {DEMO_EXAMPLES.map((example) => (
              <button
                key={example.id}
                type="button"
                className="min-h-11 rounded-md border border-zinc-300 px-3 text-sm dark:border-zinc-700"
                onClick={() => {
                  void loadDemoExample(example);
                }}
              >
                {example.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="min-h-11 rounded-md bg-blue-700 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
              disabled={!canAnalyze}
              onClick={() => {
                void analyze();
              }}
            >
              Analyser
            </button>
            <button
              type="button"
              className="min-h-11 rounded-md border border-zinc-300 px-4 text-sm disabled:opacity-50 dark:border-zinc-700"
              disabled={phase !== "analyzing"}
              onClick={cancel}
            >
              Annuler
            </button>
            {phase === "error" ? (
              <button
                type="button"
                className="min-h-11 rounded-md border border-zinc-300 px-4 text-sm dark:border-zinc-700"
                onClick={() => {
                  void analyze();
                }}
              >
                Réessayer
              </button>
            ) : null}
            <button type="button" className="min-h-11 rounded-md border border-zinc-300 px-4 text-sm dark:border-zinc-700" onClick={clearSession}>
              Effacer
            </button>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">PNG ou JPEG, 2 Mio maximum.</p>
        </section>
        <AnalysisReportView
          report={report}
          analyzing={phase === "analyzing"}
          elapsedSeconds={elapsedSeconds}
          errorMessage={errorMessage}
        />
      </main>
    </div>
  );
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}
