# Model harness

Screenshot Debugger ships an original Gemma 4 harness. It is not a clone of another open-source harness. The same path serves the web UI and the CLI demo.

## Pipeline

1. `lib/validate-upload.ts` — PNG/JPEG by magic bytes, size and dimensions.
2. `lib/prompts/screenshot-debugger.ts` — system prompt and JSON schema; screenshot text is data, not instructions.
3. `lib/server/gemma.ts` — `gemma-4-26b-a4b-it` via `@google/genai`, Files API then `createPartFromUri`, thinking minimal, short JSON, file deleted after the call.
4. `lib/server/diagnose.ts` — at most two provider calls (schema retry, model fallback, fast transient retry, or JSON repair).
5. `lib/analysis-schema.ts` — Zod parse; drop model-supplied metadata; attach server metadata (`mode: live`).

Entry points:

- `POST /api/analyze` through `lib/server/handle-analyze.ts`
- `npm run harness:demo` through `scripts/run-harness.mjs`

## Limits that belong to the harness

- Max two provider calls per user action.
- No model tools, no shell from the response, no automatic fix execution.
- Fast server errors may retry once if under `LIMITS.fastRetryMs`.
- Gateway timeouts on DigitalOcean are host limits, not harness inventiveness.

## Proof for judges

```bash
npm run harness:demo
```

Expect `mode: live`, model `gemma-4-*`, and an `observedError` matching the fixture. A skipped or mocked unit test is not this proof.
