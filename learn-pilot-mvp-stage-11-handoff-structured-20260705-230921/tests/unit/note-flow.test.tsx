import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NotePanel } from "@/features/notes/note-panel";
import { createNoteSchema } from "@/features/notes/schema";
import { DEMO_USER_ID } from "@/lib/constants";
import { createPlainTextNote } from "@/server/services/note.service";
import type { NoteView, TaskView } from "@/server/services/dashboard.service";

const tasks: TaskView[] = [
  {
    id: "task-1",
    title: "阅读官方文档",
    description: null,
    status: "todo",
    statusLabel: "待办",
    taskTypeLabel: "阅读",
    estimatedMinutes: 30,
    completionCriteria: "能复述核心概念。",
    isCore: true,
  },
];

const notes: NoteView[] = [
  {
    id: "note-1",
    content: "今天先记下一个原始问题：这个概念和实际案例怎么连接？",
    createdAt: "2026/07/05",
    taskTitle: "阅读官方文档",
  },
];

describe("createNoteSchema", () => {
  it("rejects empty notes and keeps plain text content", () => {
    expect(createNoteSchema.safeParse({ planId: "plan-1", content: "   " }).success).toBe(false);
    expect(
      createNoteSchema.parse({
        planId: "plan-1",
        content: "  保留用户原文，不做摘要。  ",
      }),
    ).toEqual({
      planId: "plan-1",
      content: "保留用户原文，不做摘要。",
    });
  });
});

describe("createPlainTextNote", () => {
  it("creates a plan-level note for the demo user", async () => {
    const repositories = {
      plans: {
        findById: vi.fn().mockResolvedValue({ id: "plan-1", userId: DEMO_USER_ID }),
      },
      tasks: {
        findById: vi.fn(),
      },
      notes: {
        create: vi.fn().mockResolvedValue({}),
      },
    };

    await expect(
      createPlainTextNote(
        {
          planId: "plan-1",
          content: "这是用户输入的原文笔记。",
        },
        repositories,
      ),
    ).resolves.toEqual({ status: "created", planId: "plan-1" });
    expect(repositories.notes.create).toHaveBeenCalledWith({
      plan: { connect: { id: "plan-1" } },
      task: undefined,
      content: "这是用户输入的原文笔记。",
    });
  });

  it("creates a task-linked note only when the task belongs to the same plan", async () => {
    const repositories = {
      plans: {
        findById: vi.fn().mockResolvedValue({ id: "plan-1", userId: DEMO_USER_ID }),
      },
      tasks: {
        findById: vi.fn().mockResolvedValue({ id: "task-1", planId: "plan-1" }),
      },
      notes: {
        create: vi.fn().mockResolvedValue({}),
      },
    };

    await expect(
      createPlainTextNote(
        {
          planId: "plan-1",
          taskId: "task-1",
          content: "这条笔记关联到任务。",
        },
        repositories,
      ),
    ).resolves.toEqual({ status: "created", planId: "plan-1" });
    expect(repositories.notes.create).toHaveBeenCalledWith({
      plan: { connect: { id: "plan-1" } },
      task: { connect: { id: "task-1" } },
      content: "这条笔记关联到任务。",
    });
  });

  it("refuses notes for another user's plan or mismatched tasks", async () => {
    const otherUserRepositories = {
      plans: {
        findById: vi.fn().mockResolvedValue({ id: "plan-1", userId: "other-user" }),
      },
      tasks: {
        findById: vi.fn(),
      },
      notes: {
        create: vi.fn().mockResolvedValue({}),
      },
    };

    await expect(
      createPlainTextNote({ planId: "plan-1", content: "不能保存。" }, otherUserRepositories),
    ).resolves.toEqual({ status: "not-found" });
    expect(otherUserRepositories.notes.create).not.toHaveBeenCalled();

    const mismatchedTaskRepositories = {
      plans: {
        findById: vi.fn().mockResolvedValue({ id: "plan-1", userId: DEMO_USER_ID }),
      },
      tasks: {
        findById: vi.fn().mockResolvedValue({ id: "task-2", planId: "plan-2" }),
      },
      notes: {
        create: vi.fn().mockResolvedValue({}),
      },
    };

    await expect(
      createPlainTextNote(
        { planId: "plan-1", taskId: "task-2", content: "不能挂到别的计划任务。" },
        mismatchedTaskRepositories,
      ),
    ).resolves.toEqual({ status: "not-found" });
    expect(mismatchedTaskRepositories.notes.create).not.toHaveBeenCalled();
  });
});

describe("NotePanel", () => {
  it("shows the plain-text form, task selector, and existing notes", () => {
    render(<NotePanel planId="plan-1" tasks={tasks} notes={notes} />);

    expect(screen.getByText("学习笔记")).toBeInTheDocument();
    expect(screen.getByText("记录原文笔记")).toBeInTheDocument();
    expect(screen.getByLabelText("关联任务")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("写下今天的理解、卡点或待查问题。")).toBeInTheDocument();
    expect(screen.getByText("MVP 只保存你的原文，不做 AI 摘要或改写。")).toBeInTheDocument();
    expect(screen.getByText("关联任务：阅读官方文档")).toBeInTheDocument();
    expect(screen.getByText("今天先记下一个原始问题：这个概念和实际案例怎么连接？")).toBeInTheDocument();
  });

  it("shows an empty state when there are no notes", () => {
    render(<NotePanel planId="plan-1" tasks={[]} notes={[]} />);

    expect(screen.getByText("还没有笔记")).toBeInTheDocument();
  });
});
