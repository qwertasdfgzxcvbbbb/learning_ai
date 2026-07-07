import type { ProgressLogType, TaskStatus } from "@prisma/client";
import { DEMO_USER_ID } from "@/lib/constants";
import {
  assertTaskStatusTransition,
  getProgressLogTypeForTaskStatus,
} from "@/features/daily-tasks/status";
import { ProgressLogRepository } from "@/server/repositories/progress-log.repository";
import { TaskRepository } from "@/server/repositories/task.repository";

const taskRepository = new TaskRepository();
const progressLogRepository = new ProgressLogRepository();

export type TaskStatusUpdateResult =
  | { status: "updated"; planId: string }
  | { status: "unchanged"; planId: string }
  | { status: "not-found" };

export async function updateDailyTaskStatus(
  taskId: string,
  nextStatus: TaskStatus,
): Promise<TaskStatusUpdateResult> {
  const task = await taskRepository.findById(taskId);

  if (!task || task.plan.userId !== DEMO_USER_ID) {
    return { status: "not-found" };
  }

  if (task.status === nextStatus) {
    return { status: "unchanged", planId: task.planId };
  }

  assertTaskStatusTransition(task.status, nextStatus);

  const completedAt = nextStatus === "done" ? new Date() : null;
  await taskRepository.updateStatus(task.id, nextStatus, completedAt);
  await createProgressLogIfNeeded({
    planId: task.planId,
    taskId: task.id,
    nextStatus,
    loggedFor: completedAt ?? new Date(),
    minutes: nextStatus === "done" ? task.estimatedMinutes : undefined,
  });

  return { status: "updated", planId: task.planId };
}

async function createProgressLogIfNeeded({
  planId,
  taskId,
  nextStatus,
  loggedFor,
  minutes,
}: {
  planId: string;
  taskId: string;
  nextStatus: TaskStatus;
  loggedFor: Date;
  minutes?: number;
}) {
  const type = getProgressLogTypeForTaskStatus(nextStatus);

  if (!type) {
    return;
  }

  const existing = await progressLogRepository.findByTaskAndType(taskId, type);

  if (existing) {
    return;
  }

  await progressLogRepository.create({
    plan: { connect: { id: planId } },
    task: { connect: { id: taskId } },
    type,
    loggedFor,
    minutes,
    note: progressLogNoteByType[type],
  });
}

const progressLogNoteByType: Record<ProgressLogType, string> = {
  task_completed: "任务已完成。",
  task_delayed: "任务已延期。",
  task_skipped: "任务已跳过。",
  manual_time: "手动记录学习时间。",
  check_in: "完成打卡。",
};
