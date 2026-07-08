import { describe, expect, it } from "vitest";
import { generateMockRoadmap } from "@/server/ai/tasks/generate-roadmap";

const plan = {
  title: "30 天学习 AI 产品经理",
  learningDirection: "AI 产品经理",
  specificGoal: "30 天内入门，并完成一份 AI App PRD 草稿。",
  durationDays: 30,
  dailyMinutes: 60,
  preferredResources: ["文章", "案例", "项目实践"],
  targetOutcome: "一份完整 AI App PRD 草稿",
};

describe("generateMockRoadmap", () => {
  it("returns validated roadmap content", () => {
    const result = generateMockRoadmap({
      plan,
      assessment: {
        status: "completed",
        score: 60,
        resultLevel: "intermediate",
        strengths: ["有一定概念基础"],
        weaknesses: ["实践经验可能不足"],
      },
    });

    expect(result.promptVersion).toBe("mock-roadmap-v1");
    expect(result.output.stages).toHaveLength(4);
    expect(result.output.stages.map((stage) => stage.title)).toEqual([
      "LLM 与 Prompt 基础判断",
      "RAG 知识库问答流程",
      "AI 产品方案与评估指标",
      "AI App PRD 与作品打磨",
    ]);
    expect(result.output.tasks.length).toBeGreaterThanOrEqual(2);
    expect(result.output.resources.length).toBeGreaterThanOrEqual(2);
  });

  it("keeps resources verifiable instead of promising reliability", () => {
    const result = generateMockRoadmap({
      plan,
      assessment: null,
    });

    expect(
      result.output.resources.every((resource) => resource.verificationNote.includes("请")),
    ).toBe(true);
  });
});
