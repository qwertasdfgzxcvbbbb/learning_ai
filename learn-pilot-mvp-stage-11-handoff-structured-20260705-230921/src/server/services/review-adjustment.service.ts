import { Prisma, type AdjustmentStatus, type LearningPlan, type PlanAdjustment, type Review } from "@prisma/client";
import { z } from "zod";
import type { ReviewAdjustmentView } from "@/features/review/types";
import { DEMO_USER_ID } from "@/lib/constants";
import { formatBeijingDate } from "@/lib/dates";
import { generateMockReviewAdjustment } from "@/server/ai/tasks/generate-review-adjustment";
import {
  reviewAdjustmentChangesSchema,
  type ReviewAdjustmentChanges,
  type ReviewAdjustmentOutput,
} from "@/server/ai/schemas/review-adjustment-output.schema";
import { AiCallLogRepository } from "@/server/repositories/ai-call-log.repository";
import { PlanAdjustmentRepository } from "@/server/repositories/plan-adjustment.repository";
import { PlanRepository } from "@/server/repositories/plan.repository";
import { ReviewRepository } from "@/server/repositories/review.repository";

type AdjustmentPlan = Pick<
  LearningPlan,
  | "id"
  | "userId"
  | "title"
  | "learningDirection"
  | "specificGoal"
  | "dailyMinutes"
  | "weeklyStudyDays"
  | "durationDays"
  | "notes"
  | "targetOutcome"
  | "preferredResources"
>;

type AdjustmentWithReview = PlanAdjustment & {
  review: Review | null;
};

type AdjustmentWithPlan = PlanAdjustment & {
  plan: AdjustmentPlan & {
    planVersions: { version: number }[];
  };
};

type PlanLookupRepository = {
  findById(id: string): Promise<AdjustmentPlan | null>;
};

type ReviewLookupRepository = {
  listByPlan(planId: string): Promise<Review[]>;
};

type AdjustmentRepository = {
  create(data: Parameters<PlanAdjustmentRepository["create"]>[0]): Promise<PlanAdjustment>;
  findByReview(reviewId: string): Promise<PlanAdjustment | null>;
  listByPlan(planId: string): Promise<AdjustmentWithReview[]>;
  findById(id: string): Promise<AdjustmentWithPlan | null>;
  applyToPlan(input: Parameters<PlanAdjustmentRepository["applyToPlan"]>[0]): Promise<unknown>;
};

type AiLogRepository = {
  create(data: Parameters<AiCallLogRepository["create"]>[0]): Promise<unknown>;
};

export type GenerateReviewAdjustmentResult =
  | { status: "generated"; planId: string; adjustmentId: string }
  | { status: "already-exists"; planId: string; adjustmentId: string }
  | { status: "review-required"; planId: string }
  | { status: "ai-schema-failed"; planId: string }
  | { status: "not-found" };

export type ApplyReviewAdjustmentResult =
  | { status: "applied"; planId: string; adjustmentId: string }
  | { status: "already-applied"; planId: string; adjustmentId: string }
  | { status: "not-pending"; planId: string; adjustmentId: string }
  | { status: "invalid"; planId: string; adjustmentId: string }
  | { status: "not-found" };

const planRepository = new PlanRepository();
const reviewRepository = new ReviewRepository();
const adjustmentRepository = new PlanAdjustmentRepository();
const aiCallLogRepository = new AiCallLogRepository();

export async function generateReviewAdjustmentForPlan(
  planId: string,
  repositories: {
    plans?: PlanLookupRepository;
    reviews?: ReviewLookupRepository;
    adjustments?: AdjustmentRepository;
    aiLogs?: AiLogRepository;
    generator?: typeof generateMockReviewAdjustment;
  } = {},
): Promise<GenerateReviewAdjustmentResult> {
  const planRepo = repositories.plans ?? planRepository;
  const reviewRepo = repositories.reviews ?? reviewRepository;
  const adjustmentRepo = repositories.adjustments ?? adjustmentRepository;
  const aiLogRepo = repositories.aiLogs ?? aiCallLogRepository;
  const generator = repositories.generator ?? generateMockReviewAdjustment;

  const plan = await planRepo.findById(planId);

  if (!plan || plan.userId !== DEMO_USER_ID) {
    return { status: "not-found" };
  }

  const reviews = await reviewRepo.listByPlan(plan.id);
  const latestReview = reviews[0] ?? null;

  if (!latestReview) {
    return { status: "review-required", planId: plan.id };
  }

  const existing = await adjustmentRepo.findByReview(latestReview.id);

  if (existing) {
    return { status: "already-exists", planId: plan.id, adjustmentId: existing.id };
  }

  try {
    const generated = generator({ plan, review: latestReview });
    const beforeSnapshot = createPlanSnapshot(plan);
    const afterSnapshot = createPreviewSnapshot(plan, generated.output.proposedChanges);

    const adjustment = await adjustmentRepo.create({
      plan: { connect: { id: plan.id } },
      review: { connect: { id: latestReview.id } },
      status: "pending",
      title: generated.output.title,
      reason: generated.output.reason,
      impactScope: generated.output.impactScope,
      proposedChanges: toJson(generated.output.proposedChanges),
      beforeSnapshot: toJson(beforeSnapshot),
      afterSnapshot: toJson(afterSnapshot),
      aiGenerated: true,
    });

    await aiLogRepo.create({
      user: { connect: { id: DEMO_USER_ID } },
      plan: { connect: { id: plan.id } },
      taskType: "generate_review_adjustment",
      status: "mocked",
      provider: "mock",
      model: "mock",
      promptVersion: generated.promptVersion,
      input: toJson({ plan: beforeSnapshot, review: toReviewSnapshot(latestReview) }),
      output: toJson(generated.output),
    });

    return { status: "generated", planId: plan.id, adjustmentId: adjustment.id };
  } catch (error) {
    await aiLogRepo.create({
      user: { connect: { id: DEMO_USER_ID } },
      plan: { connect: { id: plan.id } },
      taskType: "generate_review_adjustment",
      status: error instanceof z.ZodError ? "schema_failed" : "error",
      provider: "mock",
      model: "mock",
      promptVersion: "mock-review-adjustment-v1",
      input: toJson({ plan: createPlanSnapshot(plan), review: toReviewSnapshot(latestReview) }),
      errorMessage: error instanceof Error ? error.message : "Unknown adjustment generation error.",
    });

    return { status: "ai-schema-failed", planId: plan.id };
  }
}

export async function applyReviewAdjustment(
  adjustmentId: string,
  repositories: {
    adjustments?: AdjustmentRepository;
  } = {},
): Promise<ApplyReviewAdjustmentResult> {
  const adjustmentRepo = repositories.adjustments ?? adjustmentRepository;
  const adjustment = await adjustmentRepo.findById(adjustmentId);

  if (!adjustment || adjustment.plan.userId !== DEMO_USER_ID) {
    return { status: "not-found" };
  }

  if (adjustment.status === "applied") {
    return { status: "already-applied", planId: adjustment.planId, adjustmentId: adjustment.id };
  }

  if (adjustment.status !== "pending") {
    return { status: "not-pending", planId: adjustment.planId, adjustmentId: adjustment.id };
  }

  const parsedChanges = reviewAdjustmentChangesSchema.safeParse(adjustment.proposedChanges);

  if (!parsedChanges.success) {
    return { status: "invalid", planId: adjustment.planId, adjustmentId: adjustment.id };
  }

  const planUpdate = createPlanUpdate(adjustment.plan, parsedChanges.data);
  const afterSnapshot = createAppliedSnapshot(adjustment.plan, parsedChanges.data, planUpdate);
  const nextVersion = (adjustment.plan.planVersions[0]?.version ?? 0) + 1;

  await adjustmentRepo.applyToPlan({
    adjustmentId: adjustment.id,
    planId: adjustment.planId,
    planUpdate: {
      notes: planUpdate.notes,
      dailyMinutes: planUpdate.dailyMinutes,
    },
    planVersion: {
      version: nextVersion,
      source: "ai_adjustment",
      title: adjustment.title,
      description: adjustment.reason,
      snapshot: toJson(afterSnapshot),
    },
    afterSnapshot: toJson(afterSnapshot),
  });

  return { status: "applied", planId: adjustment.planId, adjustmentId: adjustment.id };
}

export function toReviewAdjustmentView(adjustment: AdjustmentWithReview): ReviewAdjustmentView {
  const parsed = reviewAdjustmentChangesSchema.safeParse(adjustment.proposedChanges);
  const changes = parsed.success ? parsed.data : null;

  return {
    id: adjustment.id,
    title: adjustment.title,
    reason: adjustment.reason,
    impactScope: adjustment.impactScope,
    status: adjustment.status,
    statusLabel: adjustmentStatusLabels[adjustment.status],
    planNote: changes?.planNote ?? "建议内容无法解析，请重新生成。",
    dailyMinutesDelta: changes?.dailyMinutesDelta ?? 0,
    taskStrategy: changes?.taskStrategy ?? "建议内容无法解析，请重新生成。",
    nextReviewFocus: changes?.nextReviewFocus ?? [],
    reviewPeriodLabel: adjustment.review
      ? formatPeriodLabel(adjustment.review.periodStart, adjustment.review.periodEnd)
      : null,
    createdAt: formatBeijingDate(adjustment.createdAt),
  };
}

function createPlanUpdate(plan: AdjustmentPlan, changes: ReviewAdjustmentChanges) {
  return {
    notes: appendAdjustmentNote(plan.notes, changes.planNote),
    dailyMinutes: clamp(plan.dailyMinutes + changes.dailyMinutesDelta, 10, 480),
  };
}

function appendAdjustmentNote(existingNotes: string | null, planNote: string) {
  const note = `AI 调整建议已应用：${planNote}`;
  const trimmed = existingNotes?.trim();

  return trimmed ? `${trimmed}\n\n${note}` : note;
}

function createPlanSnapshot(plan: AdjustmentPlan) {
  return {
    title: plan.title,
    learningDirection: plan.learningDirection,
    specificGoal: plan.specificGoal,
    dailyMinutes: plan.dailyMinutes,
    weeklyStudyDays: plan.weeklyStudyDays,
    durationDays: plan.durationDays,
    preferredResources: plan.preferredResources,
    targetOutcome: plan.targetOutcome,
    notes: plan.notes,
  };
}

function createPreviewSnapshot(plan: AdjustmentPlan, changes: ReviewAdjustmentOutput["proposedChanges"]) {
  const planUpdate = createPlanUpdate(plan, changes);
  return createAppliedSnapshot(plan, changes, planUpdate);
}

function createAppliedSnapshot(
  plan: AdjustmentPlan,
  changes: ReviewAdjustmentChanges,
  planUpdate: ReturnType<typeof createPlanUpdate>,
) {
  return {
    ...createPlanSnapshot(plan),
    notes: planUpdate.notes,
    dailyMinutes: planUpdate.dailyMinutes,
    appliedAdjustment: {
      planNote: changes.planNote,
      dailyMinutesDelta: changes.dailyMinutesDelta,
      taskStrategy: changes.taskStrategy,
      nextReviewFocus: changes.nextReviewFocus,
    },
  };
}

function toReviewSnapshot(review: Review) {
  return {
    id: review.id,
    completionRate: review.completionRate,
    delayedTaskCount: review.delayedTaskCount,
    skippedTaskCount: review.skippedTaskCount,
    blockers: review.blockers,
    satisfactionScore: review.satisfactionScore,
    nextGoal: review.nextGoal,
  };
}

function formatPeriodLabel(start: Date, endExclusive: Date) {
  const end = new Date(endExclusive);
  end.setUTCDate(end.getUTCDate() - 1);

  return `${formatBeijingDate(start)} - ${formatBeijingDate(end)}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

const adjustmentStatusLabels: Record<AdjustmentStatus, string> = {
  pending: "待确认",
  accepted: "已接受",
  rejected: "已拒绝",
  applied: "已应用",
};
