import { z } from "zod";
import type { PlanCreationHint } from "@/features/plan-creation/types";

const numberFromForm = z.coerce.number({
  invalid_type_error: "请输入数字。",
});

export const planCreationSchema = z.object({
  learningDirection: z
    .string()
    .trim()
    .min(2, "学习方向至少 2 个字。")
    .max(80, "学习方向不要超过 80 个字。"),
  specificGoal: z
    .string()
    .trim()
    .min(8, "具体目标至少写 8 个字。")
    .max(500, "具体目标不要超过 500 个字。"),
  goalType: z.enum([
    "quick_start",
    "systematic",
    "exam_prep",
    "job_project",
    "research",
    "language",
    "skill",
  ]),
  foundationLevel: z.enum(["zero", "beginner", "intermediate", "advanced"]),
  durationDays: numberFromForm.int().min(3, "学习周期至少 3 天。").max(365, "学习周期最多 365 天。"),
  dailyMinutes: numberFromForm.int().min(10, "每天至少安排 10 分钟。").max(480, "每天最多 480 分钟。"),
  weeklyStudyDays: numberFromForm.int().min(1, "每周至少学习 1 天。").max(7, "每周最多 7 天。"),
  preferredResources: z
    .array(z.string().trim().min(1))
    .min(1, "至少选择一种偏好的资源类型。")
    .max(6, "资源类型最多选择 6 种。"),
  targetOutcome: z.string().trim().max(240, "目标产出不要超过 240 个字。").optional(),
});

export type PlanCreationInput = z.infer<typeof planCreationSchema>;

export function getPlanCreationHints(input: Pick<PlanCreationInput, "specificGoal" | "durationDays" | "dailyMinutes">) {
  const hints: PlanCreationHint[] = [];

  if (input.durationDays < 7) {
    hints.push({
      level: "warning",
      message: "周期少于 7 天，建议把目标压缩成一个非常具体的小成果。",
    });
  }

  if (input.dailyMinutes < 30) {
    hints.push({
      level: "warning",
      message: "每天少于 30 分钟时，更适合安排阅读、复盘这类轻任务。",
    });
  }

  if (input.specificGoal.length > 120 && input.durationDays < 14) {
    hints.push({
      level: "warning",
      message: "目标描述较大但周期较短，后续可能需要拆成更小的阶段。",
    });
  }

  if (hints.length === 0) {
    hints.push({
      level: "info",
      message: "这个目标可以先保存为草稿，下一步再进入基础测评和路线生成。",
    });
  }

  return hints;
}
