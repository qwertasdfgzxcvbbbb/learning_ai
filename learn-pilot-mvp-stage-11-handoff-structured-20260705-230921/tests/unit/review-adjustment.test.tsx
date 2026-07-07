import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AiAdjustmentPanel } from "@/features/review/review-summary";
import { DEMO_USER_ID } from "@/lib/constants";
import { reviewAdjustmentOutputSchema } from "@/server/ai/schemas/review-adjustment-output.schema";
import { generateMockReviewAdjustment } from "@/server/ai/tasks/generate-review-adjustment";
import {
  applyReviewAdjustment,
  generateReviewAdjustmentForPlan,
} from "@/server/services/review-adjustment.service";

const plan = {
  id: "plan-1",
  userId: DEMO_USER_ID,
  title: "30 天学习 AI 产品经理",
  learningDirection: "AI 产品经理",
  specificGoal: "完成一份 AI App PRD 草稿",
  dailyMinutes: 60,
  weeklyStudyDays: 5,
  durationDays: 30,
  notes: "原计划说明",
  targetOutcome: "PRD 草稿",
  preferredResources: ["文章", "案例"],
};

const review = {
  id: "review-1",
  planId: "plan-1",
  reviewType: "weekly" as const,
  periodStart: new Date("2026-07-06T00:00:00+08:00"),
  periodEnd: new Date("2026-07-13T00:00:00+08:00"),
  completionRate: 0.4,
  delayedTaskCount: 1,
  skippedTaskCount: 1,
  blockers: "任务太大，执行时容易拖延。",
  satisfactionScore: 2,
  nextGoal: "下周先完成一个小案例。",
  createdAt: new Date("2026-07-06T12:00:00+08:00"),
  updatedAt: new Date("2026-07-06T12:00:00+08:00"),
};

describe("reviewAdjustmentOutputSchema", () => {
  it("requires pending status, reason, and impact scope", () => {
    expect(
      reviewAdjustmentOutputSchema.safeParse({
        title: "降低任务颗粒度",
        proposedChanges: {
          planNote: "下周先缩小任务范围。",
          dailyMinutesDelta: -10,
          taskStrategy: "先完成最小输出。",
          nextReviewFocus: ["延期是否减少"],
        },
      }).success,
    ).toBe(false);
  });
});

describe("generateMockReviewAdjustment", () => {
  it("returns a validated pending adjustment for a risky weekly review", () => {
    const result = generateMockReviewAdjustment({ plan, review });

    expect(result.promptVersion).toBe("mock-review-adjustment-v1");
    expect(result.output.status).toBe("pending");
    expect(result.output.reason).toContain("40%");
    expect(result.output.impactScope).toContain("计划说明");
    expect(result.output.proposedChanges.dailyMinutesDelta).toBeLessThan(0);
  });
});

describe("generateReviewAdjustmentForPlan", () => {
  it("creates a pending PlanAdjustment without applying plan changes", async () => {
    const repositories = {
      plans: {
        findById: vi.fn().mockResolvedValue(plan),
      },
      reviews: {
        listByPlan: vi.fn().mockResolvedValue([review]),
      },
      adjustments: {
        findByReview: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "adjustment-1" }),
        listByPlan: vi.fn(),
        findById: vi.fn(),
        applyToPlan: vi.fn(),
      },
      aiLogs: {
        create: vi.fn().mockResolvedValue({}),
      },
    };

    await expect(generateReviewAdjustmentForPlan("plan-1", repositories)).resolves.toEqual({
      status: "generated",
      planId: "plan-1",
      adjustmentId: "adjustment-1",
    });

    expect(repositories.adjustments.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "pending",
        aiGenerated: true,
      }),
    );
    expect(repositories.adjustments.applyToPlan).not.toHaveBeenCalled();
  });

  it("logs schema failures and does not create an adjustment", async () => {
    const repositories = {
      plans: {
        findById: vi.fn().mockResolvedValue(plan),
      },
      reviews: {
        listByPlan: vi.fn().mockResolvedValue([review]),
      },
      adjustments: {
        findByReview: vi.fn().mockResolvedValue(null),
        create: vi.fn(),
        listByPlan: vi.fn(),
        findById: vi.fn(),
        applyToPlan: vi.fn(),
      },
      aiLogs: {
        create: vi.fn().mockResolvedValue({}),
      },
      generator: vi.fn(() => ({
        promptVersion: "mock-review-adjustment-v1",
        output: reviewAdjustmentOutputSchema.parse({
          status: "pending",
          title: "缺少字段的建议",
          proposedChanges: {
            planNote: "这条建议缺少原因和影响范围。",
            dailyMinutesDelta: 0,
            taskStrategy: "保持当前节奏。",
            nextReviewFocus: ["输出质量"],
          },
        }),
      })),
    };

    await expect(generateReviewAdjustmentForPlan("plan-1", repositories)).resolves.toEqual({
      status: "ai-schema-failed",
      planId: "plan-1",
    });
    expect(repositories.adjustments.create).not.toHaveBeenCalled();
    expect(repositories.aiLogs.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: "schema_failed" }),
    );
  });
});

describe("applyReviewAdjustment", () => {
  it("applies a pending adjustment and creates a plan version", async () => {
    const repositories = {
      adjustments: {
        findById: vi.fn().mockResolvedValue({
          id: "adjustment-1",
          planId: "plan-1",
          reviewId: "review-1",
          status: "pending",
          title: "降低任务颗粒度",
          reason: "完成率偏低，需要小幅调整。",
          impactScope: "计划说明与每日学习时长",
          proposedChanges: {
            planNote: "下周先把任务拆小，优先完成一个小案例。",
            dailyMinutesDelta: -10,
            taskStrategy: "核心任务控制在 25 分钟以内。",
            nextReviewFocus: ["延期是否减少"],
          },
          beforeSnapshot: {},
          afterSnapshot: null,
          aiGenerated: true,
          createdAt: new Date(),
          confirmedAt: null,
          appliedAt: null,
          plan: {
            ...plan,
            planVersions: [{ version: 1 }],
          },
        }),
        create: vi.fn(),
        findByReview: vi.fn(),
        listByPlan: vi.fn(),
        applyToPlan: vi.fn().mockResolvedValue({}),
      },
    };

    await expect(applyReviewAdjustment("adjustment-1", repositories)).resolves.toEqual({
      status: "applied",
      planId: "plan-1",
      adjustmentId: "adjustment-1",
    });

    expect(repositories.adjustments.applyToPlan).toHaveBeenCalledWith(
      expect.objectContaining({
        planUpdate: expect.objectContaining({
          dailyMinutes: 50,
          notes: expect.stringContaining("AI 调整建议已应用"),
        }),
        planVersion: expect.objectContaining({
          version: 2,
          source: "ai_adjustment",
        }),
      }),
    );
  });

  it("does not apply an already applied adjustment again", async () => {
    const repositories = {
      adjustments: {
        findById: vi.fn().mockResolvedValue({
          id: "adjustment-1",
          planId: "plan-1",
          status: "applied",
          plan: {
            ...plan,
            planVersions: [{ version: 2 }],
          },
        }),
        create: vi.fn(),
        findByReview: vi.fn(),
        listByPlan: vi.fn(),
        applyToPlan: vi.fn(),
      },
    };

    await expect(applyReviewAdjustment("adjustment-1", repositories)).resolves.toEqual({
      status: "already-applied",
      planId: "plan-1",
      adjustmentId: "adjustment-1",
    });
    expect(repositories.adjustments.applyToPlan).not.toHaveBeenCalled();
  });
});

describe("AiAdjustmentPanel", () => {
  it("shows pending adjustment details and confirmation entry", () => {
    render(
      <AiAdjustmentPanel
        planId="plan-1"
        canGenerate
        adjustments={[
          {
            id: "adjustment-1",
            title: "降低任务颗粒度",
            reason: "本周完成率偏低。",
            impactScope: "计划说明与每日学习时长",
            status: "pending",
            statusLabel: "待确认",
            planNote: "下周先完成一个小案例。",
            dailyMinutesDelta: -10,
            taskStrategy: "把核心任务拆到 25 分钟以内。",
            nextReviewFocus: ["延期是否减少"],
            reviewPeriodLabel: "2026/07/06 - 2026/07/12",
            createdAt: "2026/07/06",
          },
        ]}
      />,
    );

    expect(screen.getByRole("button", { name: "生成调整建议" })).toBeInTheDocument();
    expect(screen.getByText("待确认")).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.textContent === "学习时长：减少 10 分钟/天")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "确认应用" })).toBeInTheDocument();
  });
});
