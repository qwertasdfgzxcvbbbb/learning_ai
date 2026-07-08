import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DEMO_USER_ID = "demo-user";

async function main() {
  await prisma.user.deleteMany({
    where: { id: DEMO_USER_ID },
  });

  const user = await prisma.user.create({
    data: {
      id: DEMO_USER_ID,
      name: "演示用户",
      email: "demo@example.local",
      isDemo: true,
      timezone: "Asia/Shanghai",
    },
  });

  const plan = await prisma.learningPlan.create({
    data: {
      userId: user.id,
      title: "30 天入门 AI 产品经理",
      learningDirection: "AI 产品经理",
      specificGoal: "30 天内入门，并完成一份 AI App PRD 作品集项目。",
      goalType: "job_project",
      status: "active",
      foundationLevel: "beginner",
      durationDays: 30,
      dailyMinutes: 60,
      weeklyStudyDays: 5,
      preferredResources: ["文章", "案例", "项目实践"],
      targetOutcome: "一份完整 AI App PRD 作品集草稿",
      startsOn: new Date("2026-07-04T00:00:00+08:00"),
      endsOn: new Date("2026-08-02T23:59:59+08:00"),
      reminderHour: 20,
      aiGenerated: true,
      sourcePromptVersion: "mock-roadmap-v1",
      roadmapStages: {
        create: [
          {
            title: "AI 产品基础认知",
            sequence: 1,
            status: "active",
            startsOn: new Date("2026-07-04T00:00:00+08:00"),
            endsOn: new Date("2026-07-08T23:59:59+08:00"),
            goal: "理解 AI 产品经理的工作内容和基础概念。",
            contentOutline: "AI 产品类型、LLM、Prompt、RAG、常见能力边界。",
            expectedOutcome: "一张 AI 产品能力地图。",
            acceptanceCriteria: "完成概念题和一份案例分析。",
            sequenceRationale:
              "先学 LLM、Prompt 和 RAG 基础，是因为后续需求分析和 PRD 都依赖这些能力边界判断。",
            sourceReferences: [
              {
                title: "OpenAI Text generation guide",
                url: "https://platform.openai.com/docs/guides/text-generation",
                note: "用于核验 LLM 输入输出、提示词和模型能力边界。",
              },
              {
                title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
                url: "https://arxiv.org/abs/2005.11401",
                note: "用于核验 RAG 的核心思想。",
              },
            ],
            aiGenerated: true,
            sourcePromptVersion: "mock-roadmap-v1",
          },
          {
            title: "AI 产品需求分析",
            sequence: 2,
            status: "planned",
            startsOn: new Date("2026-07-09T00:00:00+08:00"),
            endsOn: new Date("2026-07-15T23:59:59+08:00"),
            goal: "学会把 AI 能力转成用户需求和功能方案。",
            contentOutline: "用户场景、需求分层、AI 风险、数据输入输出。",
            expectedOutcome: "一份竞品或案例分析表。",
            acceptanceCriteria: "能说明一个 AI App 的用户流程和 AI 输入输出。",
            sequenceRationale:
              "在基础概念之后再做需求分析，可以把模型能力、数据来源和风险一起纳入产品判断。",
            sourceReferences: [
              {
                title: "OpenAI Evals guide",
                url: "https://platform.openai.com/docs/guides/evals",
                note: "用于核验 AI 功能如何设计测试集和评价标准。",
              },
              {
                title: "NIST AI Risk Management Framework",
                url: "https://www.nist.gov/itl/ai-risk-management-framework",
                note: "用于核验风险、可靠性和治理维度。",
              },
            ],
            aiGenerated: true,
            sourcePromptVersion: "mock-roadmap-v1",
          },
        ],
      },
    },
    include: {
      roadmapStages: true,
    },
  });

  const firstStage = plan.roadmapStages.find((stage) => stage.sequence === 1);

  await prisma.dailyTask.createMany({
    data: [
      {
        planId: plan.id,
        stageId: firstStage?.id,
        title: "阅读 1 篇 AI 产品案例",
        description: "记录案例中的用户问题、AI 能力和产品限制。",
        taskType: "reading",
        status: "todo",
        difficulty: "medium",
        scheduledFor: new Date("2026-07-04T20:00:00+08:00"),
        estimatedMinutes: 30,
        completionCriteria: "写下不少于 150 字的案例拆解。",
        isCore: true,
      },
      {
        planId: plan.id,
        stageId: firstStage?.id,
        title: "整理 AI 产品关键词",
        description: "整理 LLM、Prompt、RAG、Agent 的一句话解释。",
        taskType: "output",
        status: "todo",
        difficulty: "easy",
        scheduledFor: new Date("2026-07-04T20:30:00+08:00"),
        estimatedMinutes: 25,
        completionCriteria: "形成一份 4 个关键词的小卡片。",
        isCore: true,
      },
    ],
  });

  await prisma.resourceRecommendation.createMany({
    data: [
      {
        planId: plan.id,
        stageId: firstStage?.id,
        title: "OpenAI 官方文档",
        resourceType: "official_doc",
        url: "https://platform.openai.com/docs",
        sourceName: "OpenAI",
        difficulty: "medium",
        estimatedMinutes: 30,
        recommendationReason: "适合了解 AI 产品能力边界和接口形态。",
        verificationNote: "请以访问时的官方页面为准，注意文档时效性。",
        requiresVerification: true,
        aiGenerated: true,
      },
      {
        planId: plan.id,
        stageId: firstStage?.id,
        title: "AI 产品经理案例文章",
        resourceType: "article",
        sourceName: "需要自行筛选",
        difficulty: "easy",
        estimatedMinutes: 20,
        recommendationReason: "适合快速建立 AI 产品场景感。",
        verificationNote: "具体文章来源需要自行核验，不默认保证质量。",
        requiresVerification: true,
        aiGenerated: true,
      },
    ],
  });

  await prisma.planVersion.create({
    data: {
      planId: plan.id,
      version: 1,
      source: "initial",
      title: "初始演示计划",
      description: "seed 创建的初始计划快照。",
      snapshot: {
        title: plan.title,
        durationDays: plan.durationDays,
        dailyMinutes: plan.dailyMinutes,
        preferredResources: plan.preferredResources,
      },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
