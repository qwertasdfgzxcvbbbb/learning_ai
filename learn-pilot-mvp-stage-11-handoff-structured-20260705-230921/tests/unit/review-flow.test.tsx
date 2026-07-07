import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createReviewSchema } from "@/features/review/schema";
import { ReviewForm } from "@/features/review/review-form";
import { ReviewNotes, WeeklyReviewSummary } from "@/features/review/review-summary";
import { DEMO_USER_ID } from "@/lib/constants";
import { calculateWeeklyReviewStats, createWeeklyReview } from "@/server/services/review.service";

describe("createReviewSchema", () => {
  it("coerces satisfaction score and trims optional text", () => {
    expect(
      createReviewSchema.parse({
        planId: "plan-1",
        satisfactionScore: "4",
        blockers: "  任务太散，需要集中输出。  ",
        nextGoal: "   ",
      }),
    ).toEqual({
      planId: "plan-1",
      satisfactionScore: 4,
      blockers: "任务太散，需要集中输出。",
      nextGoal: undefined,
    });
    expect(createReviewSchema.safeParse({ planId: "plan-1", satisfactionScore: "" }).success).toBe(
      false,
    );
  });
});

describe("calculateWeeklyReviewStats", () => {
  it("calculates weekly completion, delayed, and skipped counts from tasks and logs", () => {
    const stats = calculateWeeklyReviewStats({
      today: new Date("2026-07-08T04:00:00.000Z"),
      tasks: [
        {
          id: "task-1",
          status: "done",
          scheduledFor: new Date("2026-07-06T02:00:00.000Z"),
        },
        {
          id: "task-2",
          status: "todo",
          scheduledFor: new Date("2026-07-07T02:00:00.000Z"),
        },
        {
          id: "task-3",
          status: "skipped",
          scheduledFor: new Date("2026-07-08T02:00:00.000Z"),
        },
        {
          id: "task-4",
          status: "delayed",
          scheduledFor: new Date("2026-07-09T02:00:00.000Z"),
        },
        {
          id: "task-5",
          status: "done",
          scheduledFor: new Date("2026-06-30T02:00:00.000Z"),
        },
      ],
      progressLogs: [
        {
          taskId: "task-1",
          type: "task_completed",
          loggedFor: new Date("2026-07-06T03:00:00.000Z"),
        },
        {
          taskId: "task-4",
          type: "task_delayed",
          loggedFor: new Date("2026-07-09T03:00:00.000Z"),
        },
        {
          taskId: "task-old",
          type: "task_skipped",
          loggedFor: new Date("2026-06-30T03:00:00.000Z"),
        },
      ],
    });

    expect(stats.completionRatePercent).toBe(33);
    expect(stats.completedTasks).toBe(1);
    expect(stats.totalTasks).toBe(3);
    expect(stats.delayedTaskCount).toBe(1);
    expect(stats.skippedTaskCount).toBe(1);
    expect(stats.progressLogCount).toBe(2);
  });
});

describe("createWeeklyReview", () => {
  it("stores a weekly review for the demo user's plan", async () => {
    const repositories = {
      plans: {
        findById: vi.fn().mockResolvedValue({
          id: "plan-1",
          userId: DEMO_USER_ID,
          title: "AI 产品经理入门",
          specificGoal: "完成一个 PRD 项目",
          dailyTasks: [
            {
              id: "task-1",
              status: "done",
              scheduledFor: new Date(),
            },
          ],
          progressLogs: [
            {
              taskId: "task-1",
              type: "task_completed",
              loggedFor: new Date(),
            },
          ],
          notesRecords: [],
        }),
      },
      reviews: {
        create: vi.fn().mockResolvedValue({}),
        listByPlan: vi.fn(),
      },
    };

    await expect(
      createWeeklyReview(
        {
          planId: "plan-1",
          satisfactionScore: "5",
          blockers: "本周执行顺利。",
          nextGoal: "下周继续输出案例。",
        },
        repositories,
      ),
    ).resolves.toMatchObject({ status: "created", planId: "plan-1" });
    expect(repositories.reviews.create).toHaveBeenCalledWith(
      expect.objectContaining({
        reviewType: "weekly",
        completionRate: 1,
        delayedTaskCount: 0,
        skippedTaskCount: 0,
        blockers: "本周执行顺利。",
        satisfactionScore: 5,
        nextGoal: "下周继续输出案例。",
      }),
    );
  });

  it("refuses reviews for another user's plan", async () => {
    const repositories = {
      plans: {
        findById: vi.fn().mockResolvedValue({
          id: "plan-1",
          userId: "other-user",
          title: "其他计划",
          specificGoal: "不应保存",
          dailyTasks: [],
          progressLogs: [],
          notesRecords: [],
        }),
      },
      reviews: {
        create: vi.fn().mockResolvedValue({}),
        listByPlan: vi.fn(),
      },
    };

    await expect(
      createWeeklyReview({ planId: "plan-1", satisfactionScore: "3" }, repositories),
    ).resolves.toEqual({ status: "not-found" });
    expect(repositories.reviews.create).not.toHaveBeenCalled();
  });
});

describe("review UI", () => {
  it("shows weekly stats, note entry, and the review form", () => {
    render(
      <>
        <WeeklyReviewSummary
          stats={{
            periodStart: new Date("2026-07-06T00:00:00+08:00"),
            periodEnd: new Date("2026-07-13T00:00:00+08:00"),
            periodLabel: "2026/07/06 - 2026/07/12",
            completionRate: 0.5,
            completionRatePercent: 50,
            completedTasks: 1,
            totalTasks: 2,
            delayedTaskCount: 1,
            skippedTaskCount: 0,
            progressLogCount: 2,
          }}
        />
        <ReviewNotes
          planId="plan-1"
          notes={[
            {
              id: "note-1",
              content: "本周最大的卡点是把概念转成案例。",
              createdAt: "2026/07/06",
              taskTitle: "阅读案例",
            },
          ]}
        />
        <ReviewForm planId="plan-1" />
      </>,
    );

    expect(screen.getByText("任务完成率")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("笔记摘要入口")).toBeInTheDocument();
    expect(screen.getByText("本周最大的卡点是把概念转成案例。")).toBeInTheDocument();
    expect(screen.getByLabelText("本周满意度")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存复盘" })).toBeInTheDocument();
  });
});
