import { z } from "zod";

export const assessmentSubmissionSchema = z.object({
  planId: z.string().min(1, "缺少计划 ID。"),
  selfLevel: z.enum(["zero", "beginner", "intermediate", "advanced"]),
  answers: z.record(z.string().min(1), z.string().min(1)),
});

export type AssessmentSubmissionInput = z.infer<typeof assessmentSubmissionSchema>;
