import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createReview: vi.fn(),
  updateTask: vi.fn(),
  createNote: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("@/server/services/review.service", () => ({ createWeeklyReview: mocks.createReview }));
vi.mock("@/server/services/daily-task.service", () => ({
  updateDailyTaskStatus: mocks.updateTask,
}));
vi.mock("@/server/services/note.service", () => ({ createPlainTextNote: mocks.createNote }));

import { createReviewAction } from "@/features/review/actions";
import { updateTaskStatusAction } from "@/features/daily-tasks/actions";
import { createNoteAction } from "@/features/notes/actions";

describe("review actions", () => {
  beforeEach(() => vi.resetAllMocks());

  it("returns a recoverable error when saving fails without invalidating pages", async () => {
    mocks.createReview.mockRejectedValue(new Error("database unavailable"));
    const form = new FormData();
    form.set("planId", "plan-1");
    form.set("satisfactionScore", "4");
    const result = await createReviewAction({ status: "idle" }, form);
    expect(result.status).toBe("error");
    expect(result.message).toContain("请稍后重试");
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });

  it("refreshes the review after a task changes", async () => {
    mocks.updateTask.mockResolvedValue({ status: "updated", planId: "plan-1" });
    const form = new FormData();
    form.set("taskId", "task-1");
    form.set("nextStatus", "done");
    await updateTaskStatusAction(form);
    expect(mocks.revalidate).toHaveBeenCalledWith("/plans/plan-1/review");
  });

  it("refreshes the review notes after saving original text", async () => {
    mocks.createNote.mockResolvedValue({ status: "created", planId: "plan-1" });
    const form = new FormData();
    form.set("planId", "plan-1");
    form.set("content", "  原文笔记  ");
    await createNoteAction({ status: "idle" }, form);
    expect(mocks.createNote).toHaveBeenCalledWith({
      planId: "plan-1",
      taskId: undefined,
      content: "  原文笔记  ",
    });
    expect(mocks.revalidate).toHaveBeenCalledWith("/plans/plan-1/review");
  });

  it("does not refresh another user's review when the task is inaccessible", async () => {
    mocks.updateTask.mockResolvedValue({ status: "not-found" });
    const form = new FormData();
    form.set("taskId", "other-task");
    form.set("nextStatus", "done");
    await updateTaskStatusAction(form);
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });
});
