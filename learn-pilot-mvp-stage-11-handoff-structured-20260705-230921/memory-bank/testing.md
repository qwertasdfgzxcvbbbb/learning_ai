# Testing Notes

- Type checking, linting, unit tests, and focused E2E tests are the expected quality gates.
- Vitest covers pure functions, schema validation, and services.
- Playwright will cover the core mobile user path once the flow exists.
- `tests/unit/review-flow.test.tsx` covers stage 12 review schema validation, Beijing-week statistics, review creation service behavior, cross-user refusal, and review UI rendering.
- Stage 12 was verified with `npm run typecheck`, `npm run lint`, `npm run test:run`, and `npm run build`.
- `tests/unit/review-adjustment.test.tsx` covers stage 13 adjustment schema validation, mock AI output, schema failure logging, pending-before-apply behavior, confirmed application, and adjustment UI rendering.
- Stage 13 was verified with `npm run typecheck`, `npm run lint`, `npm run test:run`, and `npm run build`.
