import { z } from "zod";

export const assessmentOptionOutputSchema = z.object({
  value: z.enum(["0", "1", "2", "3"]),
  label: z.string().min(2),
  score: z.number().int().min(0).max(3),
});

export const assessmentQuestionOutputSchema = z.object({
  id: z.string().min(2),
  prompt: z.string().min(8),
  options: z.array(assessmentOptionOutputSchema).min(4).max(4),
});

export const assessmentOutputSchema = z.object({
  questions: z.array(assessmentQuestionOutputSchema).min(6).max(6),
});

export type AssessmentOutput = z.infer<typeof assessmentOutputSchema>;

export const assessmentOutputJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["questions"],
  properties: {
    questions: {
      type: "array",
      minItems: 6,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "prompt", "options"],
        properties: {
          id: { type: "string" },
          prompt: { type: "string" },
          options: {
            type: "array",
            minItems: 4,
            maxItems: 4,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["value", "label", "score"],
              properties: {
                value: { type: "string", enum: ["0", "1", "2", "3"] },
                label: { type: "string" },
                score: { type: "number", enum: [0, 1, 2, 3] },
              },
            },
          },
        },
      },
    },
  },
} as const;
