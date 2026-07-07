"use server";

import { revalidatePath } from "next/cache";
import type { DailyTaskStatus } from "@/features/daily-tasks/status";
import { updateDailyTaskStatus } from "@/server/services/daily-task.service";

const taskStatuses = ["todo", "in_progress", "done", "skipped", "delayed"] as const;

export async function updateTaskStatusAction(formData: FormData) {
  const taskId = String(formData.get("taskId") ?? "");
  const nextStatus = String(formData.get("nextStatus") ?? "");

  if (!taskId || !isTaskStatus(nextStatus)) {
    return;
  }

  const result = await updateDailyTaskStatus(taskId, nextStatus);

  if (result.status === "not-found") {
    return;
  }

  revalidatePath("/");
  revalidatePath("/plans");
  revalidatePath(`/plans/${result.planId}`);
}

function isTaskStatus(status: string): status is DailyTaskStatus {
  return taskStatuses.includes(status as DailyTaskStatus);
}
