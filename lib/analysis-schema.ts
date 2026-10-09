import { z } from "zod";
import { LIMITS } from "@/lib/limits";

const requiredText = (max: number) => z.string().trim().min(1).max(max);

const optionalText = (max: number) =>
  z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return null;
    }
    return value;
  }, z.string().trim().max(max).nullable());

const optionalCode = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") {
    return null;
  }
  return value;
}, z.string().max(LIMITS.maxSectionChars).nullable());

export const analysisStatusSchema = z.enum([
  "diagnosed",
  "needs_context",
  "unreadable",
  "no_error_detected",
]);

export const hypothesisSchema = z.object({
  cause: requiredText(500),
  justification: requiredText(800),
  toVerify: requiredText(500),
});

export const verificationStepSchema = z.object({
  action: requiredText(500),
  expectedResult: requiredText(500),
});

export const investigationQuestionSchema = z.object({
  prompt: requiredText(300),
  why: requiredText(300),
});

export const learnBlockSchema = z.object({
  question: requiredText(300),
  hint: requiredText(300),
  explanation: requiredText(500),
});

export const modelOutputSchema = z
  .object({
    status: analysisStatusSchema,
    observedError: optionalText(1000),
    evidence: z.array(requiredText(500)).max(8),
    hypotheses: z.array(hypothesisSchema).max(5),
    explanation: requiredText(2000),
    proposedFix: optionalText(1500),
    suggestedCode: optionalCode,
    verificationSteps: z.array(verificationStepSchema).max(6),
    missingContext: z.array(requiredText(400)).max(6),
    limitations: z.array(requiredText(400)).max(6),
    investigationQuestion: investigationQuestionSchema.nullable().default(null),
    learn: learnBlockSchema.nullable().default(null),
    learnedPrinciple: optionalText(400).default(null),
    prevention: z.array(requiredText(200)).max(2).default([]),
    changeNotes: z.array(requiredText(200)).max(2).default([]),
  })
  .superRefine((value, context) => {
    if (value.status === "diagnosed" && !value.observedError) {
      context.addIssue({
        code: "custom",
        path: ["observedError"],
        message: "diagnosed_requires_error",
      });
    }
    if (value.status === "needs_context" && value.missingContext.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["missingContext"],
        message: "needs_context_requires_gap",
      });
    }
  });

export const reportMetadataSchema = z.object({
  model: z.string().trim().min(1).max(120),
  mode: z.enum(["live", "recorded"]),
  promptVersion: z.string().trim().min(1).max(40),
  durationMs: z.number().int().nonnegative().max(10 * 60 * 1000),
});

export const analysisReportSchema = modelOutputSchema.and(
  z.object({ metadata: reportMetadataSchema }),
);

export const analyzeInputSchema = z
  .object({
    imageBase64: z.string().min(1).max(LIMITS.maxBase64Chars),
    framework: z.enum(["auto", "react", "typescript", "javascript"]),
    context: z.string().max(LIMITS.maxTextChars),
    code: z.string().max(LIMITS.maxTextChars),
    language: z.enum(["fr", "en"]),
  })
  .superRefine((value, context) => {
    if (value.context.length + value.code.length > LIMITS.maxTextChars) {
      context.addIssue({
        code: "custom",
        path: ["context"],
        message: "text_too_long",
      });
    }
  });

export const investigateInputSchema = z
  .object({
    userAnswer: z.string().trim().min(1).max(LIMITS.maxTextChars),
    framework: z.enum(["auto", "react", "typescript", "javascript"]),
    context: z.string().max(LIMITS.maxTextChars),
    code: z.string().max(LIMITS.maxTextChars),
    language: z.enum(["fr", "en"]),
    round: z.union([z.literal(1), z.literal(2)]),
    priorReport: z.object({
      status: analysisStatusSchema,
      observedError: z.string().max(1000).nullable(),
      evidence: z.array(z.string().max(500)).max(8),
      hypotheses: z.array(hypothesisSchema).max(5),
      explanation: z.string().max(2000),
      proposedFix: z.string().max(1500).nullable(),
      suggestedCode: z.string().max(LIMITS.maxSectionChars).nullable(),
      verificationSteps: z.array(verificationStepSchema).max(6),
      missingContext: z.array(z.string().max(400)).max(6),
      limitations: z.array(z.string().max(400)).max(6),
      investigationQuestion: investigationQuestionSchema.nullable(),
      learn: learnBlockSchema.nullable(),
      learnedPrinciple: z.string().max(400).nullable(),
      prevention: z.array(z.string().max(200)).max(2),
      changeNotes: z.array(z.string().max(200)).max(2),
    }),
  })
  .superRefine((value, context) => {
    if (value.context.length + value.code.length + value.userAnswer.length > LIMITS.maxTextChars) {
      context.addIssue({
        code: "custom",
        path: ["userAnswer"],
        message: "text_too_long",
      });
    }
  });

export type AnalysisStatus = z.infer<typeof analysisStatusSchema>;
export type ModelOutput = z.infer<typeof modelOutputSchema>;
export type ReportMetadata = z.infer<typeof reportMetadataSchema>;
export type AnalysisReport = z.infer<typeof analysisReportSchema>;
export type AnalyzeInput = z.infer<typeof analyzeInputSchema>;
export type InvestigateInput = z.infer<typeof investigateInputSchema>;

export class ModelOutputError extends Error {
  constructor(readonly reason: "empty" | "invalid_json" | "nonconforming") {
    super(reason);
    this.name = "ModelOutputError";
  }
}

export function parseModelOutput(text: string): ModelOutput {
  if (!text.trim()) {
    throw new ModelOutputError("empty");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripJsonFence(text));
  } catch {
    throw new ModelOutputError("invalid_json");
  }

  if (parsed && typeof parsed === "object" && "metadata" in parsed) {
    delete (parsed as { metadata?: unknown }).metadata;
  }

  const result = modelOutputSchema.safeParse(parsed);
  if (!result.success) {
    throw new ModelOutputError("nonconforming");
  }
  return result.data;
}

function stripJsonFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : trimmed;
}

export function decodeImageBase64(value: string): Uint8Array | null {
  const payload = value
    .replace(/^data:image\/[a-z0-9.+-]+;base64,/i, "")
    .replace(/\s/g, "");
  if (!payload || !/^[A-Za-z0-9+/]+={0,2}$/.test(payload) || payload.length % 4 !== 0) {
    return null;
  }
  const decoded = Buffer.from(payload, "base64");
  if (decoded.length === 0) {
    return null;
  }
  return new Uint8Array(decoded);
}
