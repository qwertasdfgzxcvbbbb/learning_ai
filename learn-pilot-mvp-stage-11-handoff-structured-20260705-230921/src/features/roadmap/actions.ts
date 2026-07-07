"use server";

import { redirect } from "next/navigation";
import { generateRoadmapForPlan } from "@/server/services/roadmap-generation.service";

export async function generateRoadmapAction(formData: FormData) {
  const planId = String(formData.get("planId") ?? "");

  if (!planId) {
    redirect("/plans");
  }

  const result = await generateRoadmapForPlan(planId);

  if (result.status === "not-found") {
    redirect("/plans");
  }

  redirect(`/plans/${planId}?roadmap=${result.status}`);
}
