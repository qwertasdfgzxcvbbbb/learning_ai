import { DEMO_USER_ID } from "@/lib/constants";
import { getBeijingDayRange } from "@/lib/dates";
import type { PlanCreationInput } from "@/features/plan-creation/schema";
import { PlanRepository } from "@/server/repositories/plan.repository";

const planRepository = new PlanRepository();

export async function createDraftPlan(input: PlanCreationInput) {
  const startsOn = getBeijingDayRange().start;
  const endsOn = new Date(startsOn);
  endsOn.setUTCDate(endsOn.getUTCDate() + input.durationDays - 1);

  const title = `${input.durationDays} 天学习 ${input.learningDirection}`;
  const targetOutcome = input.targetOutcome?.trim() || `完成与「${input.learningDirection}」相关的阶段性学习成果。`;

  return planRepository.create({
    user: { connect: { id: DEMO_USER_ID } },
    title,
    learningDirection: input.learningDirection,
    specificGoal: input.specificGoal,
    goalType: input.goalType,
    status: "draft",
    foundationLevel: input.foundationLevel,
    durationDays: input.durationDays,
    dailyMinutes: input.dailyMinutes,
    weeklyStudyDays: input.weeklyStudyDays,
    preferredResources: input.preferredResources,
    targetOutcome,
    startsOn,
    endsOn,
    reminderHour: 20,
    aiGenerated: false,
    notes: "用户创建的计划草稿，等待基础测评和路线图生成。",
    planVersions: {
      create: {
        version: 1,
        source: "initial",
        title: "用户创建的初始草稿",
        description: "阶段 4 表单保存的初始计划草稿。",
        snapshot: {
          title,
          learningDirection: input.learningDirection,
          specificGoal: input.specificGoal,
          goalType: input.goalType,
          foundationLevel: input.foundationLevel,
          durationDays: input.durationDays,
          dailyMinutes: input.dailyMinutes,
          weeklyStudyDays: input.weeklyStudyDays,
          preferredResources: input.preferredResources,
          targetOutcome,
        },
      },
    },
  });
}
