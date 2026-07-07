export type ProgressTaskStatus = "todo" | "in_progress" | "done" | "skipped" | "delayed";

export type ProgressTask = {
  status: ProgressTaskStatus;
  isCore?: boolean;
};

export type ProgressLogType = "task_completed" | "task_delayed" | "task_skipped" | "manual_time" | "check_in";

export type ProgressLogEntry = {
  type: ProgressLogType;
  loggedFor: Date | string;
};

export type CompletionRate = {
  completed: number;
  total: number;
  rate: number;
};

export type ProgressOverview = {
  today: CompletionRate;
  overall: CompletionRate;
  streakDays: number;
  canCheckIn: boolean;
};

export function calculateTaskCompletionRate(tasks: ProgressTask[]): CompletionRate {
  const countableTasks = tasks.filter((task) => task.status !== "skipped");
  const completed = countableTasks.filter((task) => task.status === "done").length;
  const total = countableTasks.length;

  return {
    completed,
    total,
    rate: total === 0 ? 0 : completed / total,
  };
}

export function hasValidCheckIn(tasks: ProgressTask[]) {
  return tasks.some((task) => task.isCore !== false && task.status === "done");
}

export function calculateCurrentStreakDays(
  logs: ProgressLogEntry[],
  referenceDate = new Date(),
  timeZone = "Asia/Shanghai",
) {
  const loggedDateKeys = new Set(
    logs
      .filter((log) => log.type === "task_completed" || log.type === "check_in")
      .map((log) => toDateKey(log.loggedFor, timeZone)),
  );

  let streakDays = 0;
  const cursor = new Date(referenceDate);

  while (loggedDateKeys.has(toDateKey(cursor, timeZone))) {
    streakDays += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streakDays;
}

export function calculateProgressOverview({
  todayTasks,
  allTasks,
  progressLogs,
  today = new Date(),
}: {
  todayTasks: ProgressTask[];
  allTasks: ProgressTask[];
  progressLogs: ProgressLogEntry[];
  today?: Date;
}): ProgressOverview {
  return {
    today: calculateTaskCompletionRate(todayTasks),
    overall: calculateTaskCompletionRate(allTasks),
    streakDays: calculateCurrentStreakDays(progressLogs, today),
    canCheckIn: hasValidCheckIn(todayTasks),
  };
}

function toDateKey(dateLike: Date | string, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(dateLike));
}
