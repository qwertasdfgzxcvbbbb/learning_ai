import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RoadmapList } from "@/features/roadmap/roadmap-list";
import type { StageView } from "@/server/services/dashboard.service";

const stages: StageView[] = [
  {
    id: "stage-1",
    title: "基础认知",
    sequence: 1,
    statusLabel: "进行中",
    startsOn: "2026/07/05",
    endsOn: "2026/07/09",
    goal: "理解核心概念和能力边界。",
    contentOutline: "核心概念、典型案例、资料筛选方法。",
    expectedOutcome: "一份基础概念卡片。",
    acceptanceCriteria: "能解释 5 个核心概念。",
    sequenceRationale: "先建立概念地图，再进入案例练习。",
    sourceReferences: [
      {
        title: "当前计划输入",
        note: "使用目标、周期和每日时长约束路线。",
      },
    ],
    aiGenerated: true,
    sourcePromptVersion: "mock-roadmap-v1",
  },
  {
    id: "stage-2",
    title: "案例练习",
    sequence: 2,
    statusLabel: "未开始",
    startsOn: "2026/07/10",
    endsOn: "2026/07/15",
    goal: "把概念放入案例里理解。",
    contentOutline: "案例分析、流程拆解、风险识别。",
    expectedOutcome: "一份案例分析表。",
    acceptanceCriteria: "能说明案例的输入输出。",
    sequenceRationale: "掌握基础概念后再拆解案例。",
    sourceReferences: [
      {
        title: "OpenAI Evals guide",
        url: "https://platform.openai.com/docs/guides/evals",
        note: "用于核验评估方式。",
      },
    ],
    aiGenerated: true,
    sourcePromptVersion: "mock-roadmap-v1",
  },
];

describe("RoadmapList", () => {
  it("shows a clear empty state", () => {
    render(<RoadmapList stages={[]} />);

    expect(screen.getByText("路线图还没生成")).toBeInTheDocument();
  });

  it("renders stages and expands details", () => {
    render(<RoadmapList stages={stages} />);

    expect(screen.getByText("AI 路线图详情")).toBeInTheDocument();
    expect(screen.getByText("1. 基础认知")).toBeInTheDocument();
    expect(screen.getByText("2. 案例练习")).toBeInTheDocument();
    expect(screen.getAllByText("内容提纲")).toHaveLength(2);
    expect(screen.getAllByText("排序依据")).toHaveLength(2);
    expect(screen.getAllByText("可核验来源")).toHaveLength(2);
    expect(screen.getByText("OpenAI Evals guide")).toBeInTheDocument();
    expect(screen.getByText("案例分析、流程拆解、风险识别。")).toBeInTheDocument();

    fireEvent.click(screen.getAllByLabelText("收起阶段")[1]);

    expect(screen.queryByText("案例分析、流程拆解、风险识别。")).not.toBeInTheDocument();
  });
});
