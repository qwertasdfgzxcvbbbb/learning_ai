import type { DailyTask, Note, ProgressLog, Review, TaskStatus } from "@prisma/client";
import { createReviewSchema, type CreateReviewInput } from "@/features/review/schema";
import type {
  ReviewAdjustmentView,
  ReviewNoteView,
  ReviewRecordView,
  WeeklyReviewStatsView,
} from "@/features/review/types";
import { DEMO_USER_ID } from "@/lib/constants";
import { formatBeijingDate, getBeijingWeekRange } from "@/lib/dates";
import { PlanAdjustmentRepository } from "@/server/repositories/plan-adjustment.repository";
import { PlanRepository } from "@/server/repositories/plan.repository";
import { ReviewRepository } from "@/server/repositories/review.repository";
import { toReviewAdjustmentView } from "@/server/services/review-adjustment.service";

type ReviewTask = Pick<DailyTask, "id" | "status" | "scheduledFor">;
type ReviewProgressLog = Pick<ProgressLog, "taskId" | "type" | "loggedFor">;
type ReviewNote = Note & {
  task: Pick<DailyTask, "title"> | null;
};

type ReviewPlan = {
  id: string;
  userId: string;
  title: string;
  specificGoal: string;
  dailyTasks: ReviewTask[];
  progressLogs: ReviewProgressLog[];
  notesRecords: ReviewNote[];
};

type PlanLookupRepository = {
  findById(id: string): Promise<ReviewPlan | null>;
};

type ReviewDataRepository = {
  create(data: Parameters<ReviewRepository["create"]>[0]): Promise<unknown>;
  listByPlan(planId: string): Promise<Review[]>;
};

export type ReviewPageData =
  | {
      status: "ready";
      plan: {
        id: string;
        title: string;
        goal: string;
      };
      currentStats: WeeklyReviewStatsView;
      notes: ReviewNoteView[];
      reviews: ReviewRecordView[];
      adjustments: ReviewAdjustmentView[];
    }
  | { status: "not-found" }
  | { status: "unavailable" };

export type CreateWeeklyReviewResult =
  | { status: "created"; planId: string; periodLabel: string }
  | { status: "invalid"; fieldErrors: Record<string, string[]> }
  | { status: "not-found" };

const planRepository = new PlanRepository();
const reviewRepository = new ReviewRepository();
const adjustmentRepository = new PlanAdjustmentRepository();

export async function getReviewPageData(planId: string): Promise<ReviewPageData> {
  try {
    const plan = await planRepository.findById(planId);

    if (!plan || plan.userId !== DEMO_USER_ID) {
      return { status: "not-found" };
    }

    const reviews = await reviewRepository.listByPlan(plan.id);
    const adjustments = await adjustmentRepository.listByPlan(plan.id);

    return {
      status: "ready",
      plan: {
        id: plan.id,
        title: plan.title,
        goal: plan.specificGoal,
      },
      currentStats: calculateWeeklyReviewStats({
        tasks: plan.dailyTasks,
        progressLogs: plan.progressLogs,
      }),
      notes: plan.notesRecords.slice(0, 3).map(toReviewNoteView),
      reviews: reviews.map(toReviewRecordView),
      adjustments: adjustments.map(toReviewAdjustmentView),
    };
  } catch {
    return { status: "unavailable" };
  }
}

export async function createWeeklyReview(
  input: CreateReviewInput,
  repositories: {
    plans?: PlanLookupRepository;
    reviews?: ReviewDataRepository;
  } = {},
): Promise<CreateWeeklyReviewResult> {
  const parsed = createReviewSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "invalid",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const planRepo = repositories.plans ?? planRepository;
  const reviewRepo = repositories.reviews ?? reviewRepository;
  const plan = await planRepo.findById(parsed.data.planId);

  if (!plan || plan.userId !== DEMO_USER_ID) {
    return { status: "not-found" };
  }

  const stats = calculateWeeklyReviewStats({
    tasks: plan.dailyTasks,
    progressLogs: plan.progressLogs,
  });

  await reviewRepo.create({
    plan: { connect: { id: plan.id } },
    reviewType: "weekly",
    periodStart: stats.periodStart,
    periodEnd: stats.periodEnd,
    completionRate: stats.completionRate,
    delayedTaskCount: stats.delayedTaskCount,
    skippedTaskCount: stats.skippedTaskCount,
    blockers: parsed.data.blockers,
    satisfactionScore: parsed.data.satisfactionScore,
    nextGoal: parsed.data.nextGoal,
  });

  return {
    status: "created",
    planId: plan.id,
    periodLabel: stats.periodLabel,
  };
}

export function calculateWeeklyReviewStats({
  tasks,
  progressLogs,
  today = new Date(),
}: {
  tasks: ReviewTask[];
  progressLogs: ReviewProgressLog[];
  today?: Date;
}): WeeklyReviewStatsView {
  const { start, end } = getBeijingWeekRange(today);
  const tasksInPeriod = tasks.filter((task) => isInRange(task.scheduledFor, start, end));
  const logsInPeriod = progressLogs.filter((log) => isInRange(log.loggedFor, start, end));
  const countableTasks = tasksInPeriod.filter((task) => task.status !== "skipped");
  const completedTasks = countableTasks.filter((task) => task.status === "done").length;
  const totalTasks = countableTasks.length;
  const delayedTaskCount = countTasksByStatusOrLog(tasksInPeriod, logsInPeriod, "delayed");
  const skippedTaskCount = countTasksByStatusOrLog(tasksInPeriod, logsInPeriod, "skipped");
  const completionRate = totalTasks === 0 ? 0 : completedTasks / totalTasks;

  return {
    periodStart: start,
    periodEnd: end,
    periodLabel: formatPeriodLabel(start, end),
    completionRate,
    completionRatePercent: Math.round(completionRate * 100),
    completedTasks,
    totalTasks,
    delayedTaskCount,
    skippedTaskCount,
    progressLogCount: logsInPeriod.length,
  };
}

function countTasksByStatusOrLog(
  tasks: ReviewTask[],
  logs: ReviewProgressLog[],
  status: Extract<TaskStatus, "delayed" | "skipped">,
) {
  const type = status === "delayed" ? "task_delayed" : "task_skipped";
  const taskIds = new Set(tasks.filter((task) => task.status === status).map((task) => task.id));

  logs
    .filter((log) => log.type === type && log.taskId)
    .forEach((log) => taskIds.add(log.taskId as string));

  return taskIds.size;
}

function toReviewNoteView(note: ReviewNote): ReviewNoteView {
  return {
    id: note.id,
    content: note.content,
    createdAt: formatBeijingDate(note.createdAt),
    taskTitle: note.task?.title ?? null,
  };
}

function toReviewRecordView(review: Review): ReviewRecordView {
  return {
    id: review.id,
    periodLabel: formatPeriodLabel(review.periodStart, review.periodEnd),
    completionRatePercent: Math.round(review.completionRate * 100),
    delayedTaskCount: review.delayedTaskCount,
    skippedTaskCount: review.skippedTaskCount,
    blockers: review.blockers,
    satisfactionScore: review.satisfactionScore,
    nextGoal: review.nextGoal,
    createdAt: formatBeijingDate(review.createdAt),
  };
}

function formatPeriodLabel(start: Date, endExclusive: Date) {
  const end = new Date(endExclusive);
  end.setUTCDate(end.getUTCDate() - 1);

  return `${formatBeijingDate(start)} - ${formatBeijingDate(end)}`;
}

function isInRange(date: Date, start: Date, end: Date) {
  return date >= start && date < end;
}
