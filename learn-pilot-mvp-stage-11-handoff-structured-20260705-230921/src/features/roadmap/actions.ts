"use server";

import { redirect } from "next/navigation";
import { generateRoadmapForPlan } from "@/server/services/roadmap-generation.service";

export async function generateRoadmapAction(formData: FormData) {
  const planId = String(formData.get("planId") ?? "");
  const mode = String(formData.get("mode") ?? "");

  if (!planId) {
    redirect("/plans");
  }

  const result = await generateRoadmapForPlan(planId, { force: mode === "regenerate" });

  if (result.status === "not-found") {
    redirect("/plans");
  }

  redirect(`/plans/${planId}?roadmap=${result.status}`);
}
