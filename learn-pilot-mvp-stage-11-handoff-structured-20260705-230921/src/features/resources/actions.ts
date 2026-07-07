"use server";

import { revalidatePath } from "next/cache";
import { isLearningResourceStatus } from "@/features/resources/status";
import { updateResourceStatus } from "@/server/services/resource.service";

export async function updateResourceStatusAction(formData: FormData) {
  const resourceId = String(formData.get("resourceId") ?? "");
  const nextStatus = String(formData.get("nextStatus") ?? "");

  if (!resourceId || !isLearningResourceStatus(nextStatus)) {
    return;
  }

  const result = await updateResourceStatus(resourceId, nextStatus);

  if (result.status === "not-found") {
    return;
  }

  revalidatePath("/");
  revalidatePath("/plans");
  revalidatePath(`/plans/${result.planId}`);
}
