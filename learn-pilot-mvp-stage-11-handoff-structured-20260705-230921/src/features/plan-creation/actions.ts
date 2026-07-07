"use server";

import { redirect } from "next/navigation";
import { planCreationSchema } from "@/features/plan-creation/schema";
import type { PlanCreationActionState } from "@/features/plan-creation/types";
import { createDraftPlan } from "@/server/services/plan-creation.service";

export async function createPlanAction(
  _previousState: PlanCreationActionState,
  formData: FormData,
): Promise<PlanCreationActionState> {
  const parsed = planCreationSchema.safeParse({
    learningDirection: formData.get("learningDirection"),
    specificGoal: formData.get("specificGoal"),
    goalType: formData.get("goalType"),
    foundationLevel: formData.get("foundationLevel"),
    durationDays: formData.get("durationDays"),
    dailyMinutes: formData.get("dailyMinutes"),
    weeklyStudyDays: formData.get("weeklyStudyDays"),
    preferredResources: formData.getAll("preferredResources"),
    targetOutcome: formData.get("targetOutcome") ?? undefined,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "请检查表单里标出的内容。",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let planId: string;

  try {
    const plan = await createDraftPlan(parsed.data);
    planId = plan.id;
  } catch {
    return {
      status: "error",
      message: "计划暂时保存失败，请确认本地 PostgreSQL 已启动。",
    };
  }

  redirect(`/plans/${planId}`);
}
