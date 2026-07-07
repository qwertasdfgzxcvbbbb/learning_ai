import { describe, expect, it } from "vitest";
import {
  assertTaskStatusTransition,
  canTransitionTaskStatus,
  getProgressLogTypeForTaskStatus,
} from "@/features/daily-tasks/status";

describe("canTransitionTaskStatus", () => {
  it("allows a todo task to move into execution states", () => {
    expect(canTransitionTaskStatus("todo", "in_progress")).toBe(true);
    expect(canTransitionTaskStatus("todo", "done")).toBe(true);
    expect(canTransitionTaskStatus("todo", "skipped")).toBe(true);
    expect(canTransitionTaskStatus("todo", "delayed")).toBe(true);
  });

  it("does not allow completed tasks to be changed by default", () => {
    expect(canTransitionTaskStatus("done", "todo")).toBe(false);
    expect(() => assertTaskStatusTransition("done", "delayed")).toThrow();
  });

  it("allows delayed tasks to be rescheduled into active flow", () => {
    expect(canTransitionTaskStatus("delayed", "todo")).toBe(true);
    expect(canTransitionTaskStatus("delayed", "done")).toBe(true);
  });
});

describe("getProgressLogTypeForTaskStatus", () => {
  it("maps terminal task states to progress log types", () => {
    expect(getProgressLogTypeForTaskStatus("done")).toBe("task_completed");
    expect(getProgressLogTypeForTaskStatus("delayed")).toBe("task_delayed");
    expect(getProgressLogTypeForTaskStatus("skipped")).toBe("task_skipped");
  });

  it("does not create progress logs for preparation states", () => {
    expect(getProgressLogTypeForTaskStatus("todo")).toBeNull();
    expect(getProgressLogTypeForTaskStatus("in_progress")).toBeNull();
  });
});
