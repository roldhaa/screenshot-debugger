# Report schema

Fields returned by the Screenshot Debugger harness after Gemma 4 responds. Server metadata is added after parsing; never trust model-supplied metadata.

| Field | Type | Notes |
| --- | --- | --- |
| `status` | enum | `diagnosed`, `needs_context`, `unreadable`, `no_error_detected` |
| `observedError` | string or null | Required when status is `diagnosed` |
| `evidence` | string[] | Visible lines or messages only |
| `hypotheses` | `{ cause, justification, toVerify }[]` | Max a few items |
| `explanation` | string | Plain language |
| `proposedFix` | string or null | Not executed by the app |
| `suggestedCode` | string or null | Optional snippet |
| `verificationSteps` | `{ action, expectedResult }[]` | Student checks by hand |
| `missingContext` | string[] | Required when status is `needs_context` |
| `limitations` | string[] | Honest gaps |
| `metadata.model` | string | e.g. `gemma-4-26b-a4b-it` |
| `metadata.mode` | enum | Always `live` from this harness |
| `metadata.promptVersion` | string | Prompt revision |
| `metadata.durationMs` | number | Server-measured duration |

Source of truth: `lib/analysis-schema.ts`.
