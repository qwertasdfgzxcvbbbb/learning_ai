import type { Assessment, LearningPlan } from "@prisma/client";
import { ROADMAP_PROMPT_VERSION } from "@/server/ai/prompts/generate-roadmap.prompt";
import { roadmapOutputSchema, type RoadmapOutput } from "@/server/ai/schemas/roadmap-output.schema";

export type GenerateRoadmapInput = {
  plan: Pick<
    LearningPlan,
    | "title"
    | "learningDirection"
    | "specificGoal"
    | "durationDays"
    | "dailyMinutes"
    | "preferredResources"
    | "targetOutcome"
  >;
  assessment: Pick<Assessment, "status" | "score" | "resultLevel" | "strengths" | "weaknesses"> | null;
};

export type GenerateRoadmapResult = {
  promptVersion: string;
  output: RoadmapOutput;
};

export function generateMockRoadmap(input: GenerateRoadmapInput): GenerateRoadmapResult {
  const level = input.assessment?.resultLevel ?? "beginner";
  const isConservative = level === "zero" || level === "beginner";
  const direction = input.plan.learningDirection;
  const dailyMinutes = input.plan.dailyMinutes;

  const rawOutput: RoadmapOutput = {
    overview: `围绕「${direction}」生成一条 ${input.plan.durationDays} 天的保守学习路线，先建立认知，再进入实践输出。`,
    stages: [
      {
        title: `${direction} 基础认知`,
        sequence: 1,
        goal: `理解 ${direction} 的核心概念、常见任务和能力边界。`,
        contentOutline: "核心概念、典型案例、常见术语、资料筛选方法。",
        expectedOutcome: "形成一份基础概念卡片和案例拆解笔记。",
        acceptanceCriteria: "能用自己的话解释 5 个核心概念，并完成 1 个案例拆解。",
        durationDays: Math.max(3, Math.min(7, Math.ceil(input.plan.durationDays * 0.25))),
      },
      {
        title: `${direction} 方法与案例练习`,
        sequence: 2,
        goal: "把基础概念放进真实案例中理解，形成可复用的方法框架。",
        contentOutline: "案例分析、流程拆解、需求判断、常见风险。",
        expectedOutcome: "完成一份结构化案例分析表。",
        acceptanceCriteria: "能说明一个案例的目标用户、关键流程、输入输出和风险点。",
        durationDays: Math.max(4, Math.min(10, Math.ceil(input.plan.durationDays * 0.35))),
      },
      {
        title: `${direction} 小作品输出`,
        sequence: 3,
        goal: "完成一个能展示学习成果的小作品或方案草稿。",
        contentOutline: "选题、结构化输出、检查清单、复盘改进。",
        expectedOutcome: input.plan.targetOutcome ?? "完成一份可展示的学习作品。",
        acceptanceCriteria: "产出完整草稿，并根据检查清单完成一次自查。",
        durationDays: Math.max(5, Math.min(14, Math.ceil(input.plan.durationDays * 0.4))),
      },
    ],
    tasks: [
      {
        stageSequence: 1,
        dayOffset: 0,
        title: `整理 ${direction} 的 5 个关键词`,
        description: "先建立最小概念地图，避免后续学习散掉。",
        taskType: "output",
        difficulty: "easy",
        estimatedMinutes: Math.min(dailyMinutes, 30),
        completionCriteria: "写出 5 个关键词和对应的一句话解释。",
        isCore: true,
      },
      {
        stageSequence: 1,
        dayOffset: 1,
        title: `阅读 1 个 ${direction} 入门案例`,
        description: "关注案例中的用户问题、解决方案和边界。",
        taskType: "reading",
        difficulty: isConservative ? "easy" : "medium",
        estimatedMinutes: Math.min(dailyMinutes, 40),
        completionCriteria: "记录不少于 150 字的案例拆解。",
        isCore: true,
      },
      {
        stageSequence: 1,
        dayOffset: 2,
        title: "完成基础理解小测",
        description: "用自己的话复述前两天学到的重点。",
        taskType: "review",
        difficulty: "easy",
        estimatedMinutes: Math.min(dailyMinutes, 25),
        completionCriteria: "写出 3 个仍然不清楚的问题和下一步查证方向。",
        isCore: true,
      },
    ],
    resources: [
      {
        stageSequence: 1,
        title: `${direction} 入门文章或官方文档`,
        resourceType: "article",
        sourceName: "需要自行筛选",
        difficulty: "easy",
        estimatedMinutes: 30,
        recommendationReason: "适合快速建立概念地图。",
        verificationNote: "请核验作者背景、发布时间和是否与当前学习目标匹配。",
      },
      {
        stageSequence: 2,
        title: `${direction} 真实案例分析`,
        resourceType: "case_study",
        sourceName: "需要自行筛选",
        difficulty: "medium",
        estimatedMinutes: 45,
        recommendationReason: "适合把概念放到具体场景里理解。",
        verificationNote: "请自行确认案例来源可靠，不要把单一案例当成通用结论。",
      },
      {
        stageSequence: 3,
        title: `${direction} 输出模板或检查清单`,
        resourceType: "tool_guide",
        sourceName: "需要自行筛选",
        difficulty: "medium",
        estimatedMinutes: 30,
        recommendationReason: "适合辅助完成最终作品草稿。",
        verificationNote: "请根据自己的目标调整模板，不要直接套用未经核验的建议。",
      },
    ],
  };

  const parsed = roadmapOutputSchema.parse(rawOutput);

  return {
    promptVersion: ROADMAP_PROMPT_VERSION,
    output: parsed,
  };
}
