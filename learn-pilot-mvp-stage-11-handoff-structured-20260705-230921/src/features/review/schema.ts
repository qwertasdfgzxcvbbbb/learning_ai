import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : undefined));

export const createReviewSchema = z.object({
  planId: z.string().min(1, "缺少学习计划。"),
  blockers: optionalText(1000),
  satisfactionScore: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      return Number(value);
    },
    z
      .number({
        required_error: "请选择本周满意度。",
        invalid_type_error: "请选择本周满意度。",
      })
      .int()
      .min(1, "满意度最低为 1 分。")
      .max(5, "满意度最高为 5 分。"),
  ),
  nextGoal: optionalText(500),
});

export type CreateReviewInput = z.input<typeof createReviewSchema>;
export type ParsedCreateReviewInput = z.infer<typeof createReviewSchema>;
