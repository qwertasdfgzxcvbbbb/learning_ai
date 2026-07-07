# AI Rules

- Early MVP AI calls use mocked responses.
- Real model access must stay behind `src/server/ai/`.
- AI output must be validated before it is persisted.
- AI adjustments stay pending until the user confirms them.
