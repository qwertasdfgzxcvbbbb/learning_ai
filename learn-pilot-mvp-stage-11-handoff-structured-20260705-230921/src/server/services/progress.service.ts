import type { DailyTask } from "@prisma/client";
import {
  calculateTaskCompletionRate,
  hasValidCheckIn,
  type ProgressTask,
} from "@/features/progress/calculations";

function toProgressTask(task: Pick<DailyTask, "status" | "isCore">): ProgressTask {
  return {
    status: task.status,
    isCore: task.isCore,
  };
}

export function summarizeTaskProgress(tasks: Pick<DailyTask, "status" | "isCore">[]) {
  const progressTasks = tasks.map(toProgressTask);

  return {
    completion: calculateTaskCompletionRate(progressTasks),
    canCheckIn: hasValidCheckIn(progressTasks),
  };
}
