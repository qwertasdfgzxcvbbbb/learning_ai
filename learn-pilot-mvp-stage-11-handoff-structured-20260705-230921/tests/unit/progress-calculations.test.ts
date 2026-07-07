import { describe, expect, it } from "vitest";
import {
  calculateCurrentStreakDays,
  calculateProgressOverview,
  calculateTaskCompletionRate,
  hasValidCheckIn,
} from "@/features/progress/calculations";

describe("calculateTaskCompletionRate", () => {
  it("returns 0 when there are no tasks", () => {
    expect(calculateTaskCompletionRate([])).toEqual({ completed: 0, total: 0, rate: 0 });
  });

  it("treats delayed tasks as incomplete", () => {
    expect(
      calculateTaskCompletionRate([
        { status: "done" },
        { status: "delayed" },
      ]),
    ).toEqual({ completed: 1, total: 2, rate: 0.5 });
  });

  it("excludes skipped tasks from the denominator", () => {
    expect(
      calculateTaskCompletionRate([
        { status: "done" },
        { status: "delayed" },
        { status: "skipped" },
      ]),
    ).toEqual({ completed: 1, total: 2, rate: 0.5 });
  });

  it("returns 100% when every countable task is done", () => {
    expect(
      calculateTaskCompletionRate([
        { status: "done" },
        { status: "done" },
      ]),
    ).toEqual({ completed: 2, total: 2, rate: 1 });
  });
});

describe("hasValidCheckIn", () => {
  it("requires at least one completed core task", () => {
    expect(hasValidCheckIn([{ status: "done", isCore: false }])).toBe(false);
    expect(hasValidCheckIn([{ status: "done", isCore: true }])).toBe(true);
  });
});

describe("calculateCurrentStreakDays", () => {
  const today = new Date("2026-07-05T12:00:00+08:00");

  it("counts consecutive days with completed task or check-in logs", () => {
    expect(
      calculateCurrentStreakDays(
        [
          { type: "task_completed", loggedFor: "2026-07-05T08:00:00+08:00" },
          { type: "check_in", loggedFor: "2026-07-04T20:00:00+08:00" },
          { type: "task_completed", loggedFor: "2026-07-02T20:00:00+08:00" },
        ],
        today,
      ),
    ).toBe(2);
  });

  it("returns 0 when today has no completed task or check-in log", () => {
    expect(
      calculateCurrentStreakDays(
        [{ type: "task_completed", loggedFor: "2026-07-04T20:00:00+08:00" }],
        today,
      ),
    ).toBe(0);
  });

  it("does not count delayed or skipped logs toward the streak", () => {
    expect(
      calculateCurrentStreakDays(
        [
          { type: "task_delayed", loggedFor: "2026-07-05T08:00:00+08:00" },
          { type: "task_skipped", loggedFor: "2026-07-05T09:00:00+08:00" },
        ],
        today,
      ),
    ).toBe(0);
  });
});

describe("calculateProgressOverview", () => {
  it("summarizes today, overall, streak, and check-in readiness", () => {
    expect(
      calculateProgressOverview({
        today: new Date("2026-07-05T12:00:00+08:00"),
        todayTasks: [
          { status: "done", isCore: true },
          { status: "delayed", isCore: true },
        ],
        allTasks: [
          { status: "done", isCore: true },
          { status: "done", isCore: true },
          { status: "todo", isCore: true },
        ],
        progressLogs: [{ type: "task_completed", loggedFor: "2026-07-05T08:00:00+08:00" }],
      }),
    ).toEqual({
      today: { completed: 1, total: 2, rate: 0.5 },
      overall: { completed: 2, total: 3, rate: 2 / 3 },
      streakDays: 1,
      canCheckIn: true,
    });
  });

  it("handles plans without tasks", () => {
    expect(
      calculateProgressOverview({
        today: new Date("2026-07-05T12:00:00+08:00"),
        todayTasks: [],
        allTasks: [],
        progressLogs: [],
      }),
    ).toEqual({
      today: { completed: 0, total: 0, rate: 0 },
      overall: { completed: 0, total: 0, rate: 0 },
      streakDays: 0,
      canCheckIn: false,
    });
  });
});
