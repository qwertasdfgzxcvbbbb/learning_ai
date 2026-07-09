import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ResourceList } from "@/features/resources/resource-list";
import {
  assertLearningResourceStatus,
  isLearningResourceStatus,
} from "@/features/resources/status";
import { calculateTaskCompletionRate } from "@/features/progress/calculations";
import { DEMO_USER_ID } from "@/lib/constants";
import { updateResourceStatus } from "@/server/services/resource.service";
import type { ResourceView } from "@/server/services/dashboard.service";

const resources: ResourceView[] = [
  {
    id: "resource-1",
    title: "官方文档入门章节",
    status: "want_to_learn",
    statusLabel: "想学",
    typeLabel: "官方文档",
    difficultyLabel: "适中",
    stageLabel: "阶段 1：基础认知",
    url: "https://example.com/docs",
    sourceName: "官方文档",
    estimatedMinutes: 45,
    recommendationReason: "适合先建立稳定概念，再进入案例练习。",
    verificationNote: "请以官方更新时间和版本说明为准。",
    matchedPreferences: ["官方文档"],
  },
];

describe("resource status rules", () => {
  it("only exposes MVP resource statuses", () => {
    expect(isLearningResourceStatus("want_to_learn")).toBe(true);
    expect(isLearningResourceStatus("learned")).toBe(true);
    expect(isLearningResourceStatus("unsuitable")).toBe(true);
    expect(isLearningResourceStatus("invalid")).toBe(false);
    expect(() => assertLearningResourceStatus("invalid")).toThrow();
  });
});

describe("ResourceList", () => {
  it("shows resource metadata, verification note, and status actions", () => {
    render(<ResourceList resources={resources} />);

    expect(screen.getByText("官方文档入门章节")).toBeInTheDocument();
    expect(screen.getByText("官方文档 · 官方文档")).toBeInTheDocument();
    expect(screen.getAllByText("想学")).toHaveLength(2);
    expect(screen.getByText("适中")).toBeInTheDocument();
    expect(screen.getByText("45 分钟")).toBeInTheDocument();
    expect(screen.getByText("适用阶段：阶段 1：基础认知")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /官方文档入门章节/ })).toHaveAttribute(
      "href",
      "https://example.com/docs",
    );
    expect(screen.getByText("匹配偏好：官方文档")).toBeInTheDocument();
    expect(screen.getByText("请自行核验：请以官方更新时间和版本说明为准。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "已学" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "不适合" })).toBeInTheDocument();
  });
});

describe("updateResourceStatus", () => {
  it("updates demo user resources", async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue({
        id: "resource-1",
        planId: "plan-1",
        status: "want_to_learn",
        plan: { userId: DEMO_USER_ID },
      }),
      updateStatus: vi.fn().mockResolvedValue({}),
    };

    await expect(updateResourceStatus("resource-1", "learned", repository)).resolves.toEqual({
      status: "updated",
      planId: "plan-1",
    });
    expect(repository.updateStatus).toHaveBeenCalledWith("resource-1", "learned");
  });

  it("does not rewrite unchanged statuses", async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue({
        id: "resource-1",
        planId: "plan-1",
        status: "learned",
        plan: { userId: DEMO_USER_ID },
      }),
      updateStatus: vi.fn().mockResolvedValue({}),
    };

    await expect(updateResourceStatus("resource-1", "learned", repository)).resolves.toEqual({
      status: "unchanged",
      planId: "plan-1",
    });
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });

  it("refuses resources outside the demo user", async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue({
        id: "resource-1",
        planId: "plan-1",
        status: "want_to_learn",
        plan: { userId: "other-user" },
      }),
      updateStatus: vi.fn().mockResolvedValue({}),
    };

    await expect(updateResourceStatus("resource-1", "learned", repository)).resolves.toEqual({
      status: "not-found",
    });
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });

  it("keeps resource status separate from task completion progress", async () => {
    const before = calculateTaskCompletionRate([{ status: "todo" }, { status: "done" }]);
    const after = calculateTaskCompletionRate([{ status: "todo" }, { status: "done" }]);

    expect(before).toEqual({ completed: 1, total: 2, rate: 0.5 });
    expect(after).toEqual(before);
  });
});
