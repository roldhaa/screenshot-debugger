import { afterEach, describe, expect, it } from "vitest";
import { handleInvestigate } from "../lib/server/handle-investigate";
import { resetRateLimitForTests } from "../lib/server/rate-limit";

const priorReport = {
  status: "needs_context" as const,
  observedError: "Cannot read properties of undefined (reading 'map')",
  evidence: ["TypeError map"],
  hypotheses: [
    {
      cause: "users peut être undefined.",
      justification: "map est appelé trop tôt.",
      toVerify: "Comment users est initialisé ?",
    },
  ],
  explanation: "map exige un tableau.",
  proposedFix: null,
  suggestedCode: null,
  verificationSteps: [],
  missingContext: ["Valeur initiale de users."],
  limitations: [],
  investigationQuestion: {
    prompt: "Comment users est-il initialisé ?",
    why: "Pour distinguer état initial et réponse API.",
  },
  learn: {
    question: "Que reçoit .map() ?",
    hint: "Un tableau.",
    explanation: "undefined n'a pas de map.",
  },
  learnedPrinciple: null,
  prevention: [],
  changeNotes: [],
};

const updatedJson = JSON.stringify({
  status: "diagnosed",
  observedError: "Cannot read properties of undefined (reading 'map')",
  evidence: ["TypeError map"],
  hypotheses: [
    {
      cause: "État initial undefined.",
      justification: "L'étudiant dit que users démarre à undefined.",
      toVerify: "Tester le premier rendu.",
    },
  ],
  explanation: "Le premier rendu appelle map avant le chargement.",
  proposedFix: "Initialiser users à [].",
  suggestedCode: "const [users, setUsers] = useState([]);",
  verificationSteps: [{ action: "Recharger.", expectedResult: "Pas de TypeError." }],
  missingContext: [],
  limitations: ["Pas d'exécution."],
  investigationQuestion: null,
  learn: {
    question: "Pourquoi le premier rendu casse ?",
    hint: "L'état initial.",
    explanation: "undefined n'est pas un tableau.",
  },
  learnedPrinciple: "Aligner l'état initial sur le rendu.",
  prevention: ["Typer l'état."],
  changeNotes: ["useState([]) au lieu de undefined."],
});

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/investigate", {
    method: "POST",
    headers: {
      origin: "http://localhost",
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("handleInvestigate", () => {
  afterEach(() => {
    resetRateLimitForTests();
    delete process.env.GEMINI_API_KEY;
  });

  it("updates a report from a text-only follow-up without an image", async () => {
    let sawImage = false;
    const response = await handleInvestigate(
      request({
        userAnswer: "users démarre à undefined.",
        framework: "react",
        context: "Premier rendu.",
        code: "users.map((u) => u.name)",
        language: "fr",
        round: 1,
        priorReport,
      }),
      {
        caller: async (call) => {
          if (call.image) {
            sawImage = true;
          }
          expect(call.purpose).toBe("investigate");
          return updatedJson;
        },
      },
    );
    expect(response.status).toBe(200);
    expect(sawImage).toBe(false);
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.report.status).toBe("diagnosed");
    expect(payload.report.learnedPrinciple).toContain("état initial");
    expect(payload.report.metadata.mode).toBe("live");
  });

  it("rejects an empty answer", async () => {
    const response = await handleInvestigate(
      request({
        userAnswer: "   ",
        framework: "react",
        context: "",
        code: "",
        language: "fr",
        round: 1,
        priorReport,
      }),
      { caller: async () => updatedJson },
    );
    expect(response.status).toBe(400);
  });
});
