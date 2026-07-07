export type DailyTaskStatus = "todo" | "in_progress" | "done" | "skipped" | "delayed";
export type DailyTaskProgressLogType = "task_completed" | "task_delayed" | "task_skipped";

const allowedTransitions: Record<DailyTaskStatus, DailyTaskStatus[]> = {
  todo: ["in_progress", "done", "skipped", "delayed"],
  in_progress: ["done", "skipped", "delayed"],
  done: [],
  skipped: [],
  delayed: ["todo", "in_progress", "done", "skipped"],
};

export function canTransitionTaskStatus(from: DailyTaskStatus, to: DailyTaskStatus) {
  if (from === to) {
    return true;
  }

  return allowedTransitions[from].includes(to);
}

export function assertTaskStatusTransition(from: DailyTaskStatus, to: DailyTaskStatus) {
  if (!canTransitionTaskStatus(from, to)) {
    throw new Error(`Cannot transition task status from ${from} to ${to}.`);
  }
}

export function getProgressLogTypeForTaskStatus(
  status: DailyTaskStatus,
): DailyTaskProgressLogType | null {
  if (status === "done") return "task_completed";
  if (status === "delayed") return "task_delayed";
  if (status === "skipped") return "task_skipped";
  return null;
}
