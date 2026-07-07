"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createWeeklyReview } from "@/server/services/review.service";
import {
  applyReviewAdjustment,
  generateReviewAdjustmentForPlan,
} from "@/server/services/review-adjustment.service";

export type ReviewActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createReviewAction(
  _previousState: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const planId = String(formData.get("planId") ?? "");
  const blockers = String(formData.get("blockers") ?? "");
  const satisfactionScore = String(formData.get("satisfactionScore") ?? "");
  const nextGoal = String(formData.get("nextGoal") ?? "");

  const result = await createWeeklyReview({
    planId,
    blockers,
    satisfactionScore,
    nextGoal,
  });

  if (result.status === "invalid") {
    return {
      status: "error",
      message: "复盘还不能保存，请检查表单。",
      fieldErrors: result.fieldErrors,
    };
  }

  if (result.status === "not-found") {
    return {
      status: "error",
      message: "没有找到可复盘的学习计划。",
    };
  }

  revalidatePath(`/plans/${result.planId}/review`);
  revalidatePath(`/plans/${result.planId}`);
  revalidatePath("/review");

  return {
    status: "success",
    message: `已保存 ${result.periodLabel} 的复盘。`,
  };
}

export async function generateReviewAdjustmentAction(formData: FormData) {
  const planId = String(formData.get("planId") ?? "");
  const result = await generateReviewAdjustmentForPlan(planId);

  if (result.status === "not-found") {
    redirect("/review");
  }

  revalidatePath(`/plans/${result.planId}/review`);
  revalidatePath(`/plans/${result.planId}`);
  revalidatePath("/review");

  redirect(`/plans/${result.planId}/review`);
}

export async function applyReviewAdjustmentAction(formData: FormData) {
  const adjustmentId = String(formData.get("adjustmentId") ?? "");
  const planId = String(formData.get("planId") ?? "");
  const result = await applyReviewAdjustment(adjustmentId);
  const targetPlanId = result.status === "not-found" ? planId : result.planId;

  if (!targetPlanId) {
    redirect("/review");
  }

  revalidatePath(`/plans/${targetPlanId}/review`);
  revalidatePath(`/plans/${targetPlanId}`);
  revalidatePath("/review");

  redirect(`/plans/${targetPlanId}/review`);
}
