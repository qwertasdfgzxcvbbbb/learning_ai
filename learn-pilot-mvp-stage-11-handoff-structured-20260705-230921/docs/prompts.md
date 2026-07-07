# Prompts

Prompt files will live under `src/server/ai/prompts/`.

During early MVP development, AI responses are mocked to keep development stable and inexpensive.

Current prompt files:

- `src/server/ai/prompts/generate-roadmap.prompt.ts`
  - Version: `mock-roadmap-v1`
  - Used by `src/server/ai/tasks/generate-roadmap.ts`.
- `src/server/ai/prompts/generate-review-adjustment.prompt.ts`
  - Version: `mock-review-adjustment-v1`
  - Used by `src/server/ai/tasks/generate-review-adjustment.ts`.
  - Adjustment output must stay pending until the user confirms it.
