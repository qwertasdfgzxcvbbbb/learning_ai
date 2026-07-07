import type { LearningPlan, Review } from "@prisma/client";
import { REVIEW_ADJUSTMENT_PROMPT_VERSION } from "@/server/ai/prompts/generate-review-adjustment.prompt";
import {
  reviewAdjustmentOutputSchema,
  type ReviewAdjustmentOutput,
} from "@/server/ai/schemas/review-adjustment-output.schema";

export type GenerateReviewAdjustmentInput = {
  plan: Pick<
    LearningPlan,
    | "title"
    | "learningDirection"
    | "specificGoal"
    | "dailyMinutes"
    | "weeklyStudyDays"
    | "durationDays"
    | "notes"
    | "targetOutcome"
  >;
  review: Pick<
    Review,
    | "completionRate"
    | "delayedTaskCount"
    | "skippedTaskCount"
    | "blockers"
    | "satisfactionScore"
    | "nextGoal"
  >;
};

export type GenerateReviewAdjustmentResult = {
  promptVersion: string;
  output: ReviewAdjustmentOutput;
};

export function generateMockReviewAdjustment(
  input: GenerateReviewAdjustmentInput,
): GenerateReviewAdjustmentResult {
  const completionPercent = Math.round(input.review.completionRate * 100);
  const hasExecutionRisk =
    input.review.completionRate < 0.6 ||
    input.review.delayedTaskCount > 0 ||
    input.review.skippedTaskCount > 0;
  const lowSatisfaction =
    typeof input.review.satisfactionScore === "number" && input.review.satisfactionScore <= 2;

  const dailyMinutesDelta = hasExecutionRisk || lowSatisfaction ? -10 : 0;
  const nextGoal = input.review.nextGoal?.trim();
  const blocker = input.review.blockers?.trim();

  const rawOutput: ReviewAdjustmentOutput = {
    status: "pending",
    title: hasExecutionRisk ? "降低本周任务颗粒度" : "保持节奏并强化输出检查",
    reason: buildReason({
      completionPercent,
      delayedTaskCount: input.review.delayedTaskCount,
      skippedTaskCount: input.review.skippedTaskCount,
      blocker,
    }),
    impactScope: dailyMinutesDelta < 0 ? "计划说明与每日学习时长" : "计划说明与下周复盘重点",
    proposedChanges: {
      planNote: buildPlanNote({
        direction: input.plan.learningDirection,
        nextGoal,
        blocker,
        hasExecutionRisk,
      }),
      dailyMinutesDelta,
      taskStrategy: hasExecutionRisk
        ? "下周优先把核心任务拆成 25 分钟以内的小块，先完成最小输出，再补充阅读或资源整理。"
        : "下周维持当前学习时长，每天保留一个可检查的输出物，避免只阅读不沉淀。",
      nextReviewFocus: hasExecutionRisk
        ? ["核心任务是否变小", "延期任务是否减少", "卡点是否被记录"]
        : ["输出质量", "资源是否匹配", "是否能稳定复盘"],
    },
  };

  return {
    promptVersion: REVIEW_ADJUSTMENT_PROMPT_VERSION,
    output: reviewAdjustmentOutputSchema.parse(rawOutput),
  };
}

function buildReason({
  completionPercent,
  delayedTaskCount,
  skippedTaskCount,
  blocker,
}: {
  completionPercent: number;
  delayedTaskCount: number;
  skippedTaskCount: number;
  blocker?: string;
}) {
  const signals = [`本周任务完成率为 ${completionPercent}%`];

  if (delayedTaskCount > 0) {
    signals.push(`有 ${delayedTaskCount} 个延期任务`);
  }

  if (skippedTaskCount > 0) {
    signals.push(`有 ${skippedTaskCount} 个跳过任务`);
  }

  if (blocker) {
    signals.push(`用户记录的主要阻碍是：${blocker}`);
  }

  return `${signals.join("，")}。建议先做小幅调整，避免直接重写整份计划。`;
}

function buildPlanNote({
  direction,
  nextGoal,
  blocker,
  hasExecutionRisk,
}: {
  direction: string;
  nextGoal?: string;
  blocker?: string;
  hasExecutionRisk: boolean;
}) {
  const base = hasExecutionRisk
    ? `下周学习 ${direction} 时，先降低任务颗粒度，优先完成核心输出。`
    : `下周学习 ${direction} 时，保持当前节奏，并把复盘重点放在输出质量上。`;

  const goalSentence = nextGoal ? `下周目标：${nextGoal}` : "下周目标：延续当前学习方向。";
  const blockerSentence = blocker ? `需要关注的卡点：${blocker}` : "需要关注的卡点：暂无明确阻碍。";

  return `${base}${goalSentence}${blockerSentence}`;
}
