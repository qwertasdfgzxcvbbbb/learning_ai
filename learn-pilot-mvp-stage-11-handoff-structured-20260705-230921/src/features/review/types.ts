export type WeeklyReviewStatsView = {
  periodStart: Date;
  periodEnd: Date;
  periodLabel: string;
  completionRate: number;
  completionRatePercent: number;
  completedTasks: number;
  totalTasks: number;
  delayedTaskCount: number;
  skippedTaskCount: number;
  progressLogCount: number;
};

export type ReviewNoteView = {
  id: string;
  content: string;
  createdAt: string;
  taskTitle: string | null;
};

export type ReviewRecordView = {
  id: string;
  periodLabel: string;
  completionRatePercent: number;
  delayedTaskCount: number;
  skippedTaskCount: number;
  blockers: string | null;
  satisfactionScore: number | null;
  nextGoal: string | null;
  createdAt: string;
};

export type ReviewAdjustmentView = {
  id: string;
  title: string;
  reason: string;
  impactScope: string;
  status: string;
  statusLabel: string;
  planNote: string;
  dailyMinutesDelta: number;
  taskStrategy: string;
  nextReviewFocus: string[];
  reviewPeriodLabel: string | null;
  createdAt: string;
};
