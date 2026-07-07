"use server";

import { redirect } from "next/navigation";
import { assessmentSubmissionSchema } from "@/features/assessment/schema";
import type { AssessmentActionState } from "@/features/assessment/types";
import { completeAssessment, skipAssessment } from "@/server/services/assessment.service";

export async function submitAssessmentAction(
  _previousState: AssessmentActionState,
  formData: FormData,
): Promise<AssessmentActionState> {
  const planId = String(formData.get("planId") ?? "");
  const answers = Object.fromEntries(
    Array.from(formData.entries())
      .filter(([key]) => key.startsWith("question:"))
      .map(([key, value]) => [key.replace("question:", ""), String(value)]),
  );

  const parsed = assessmentSubmissionSchema.safeParse({
    planId,
    selfLevel: formData.get("selfLevel"),
    answers,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "请完成自评等级和全部题目后再提交。",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await completeAssessment(parsed.data);
  } catch {
    return {
      status: "error",
      message: "测评暂时保存失败，请确认本地 PostgreSQL 已启动。",
    };
  }

  redirect(`/plans/${planId}`);
}

export async function skipAssessmentAction(formData: FormData) {
  const planId = String(formData.get("planId") ?? "");

  if (!planId) {
    redirect("/plans");
  }

  await skipAssessment(planId);
  redirect(`/plans/${planId}`);
}
