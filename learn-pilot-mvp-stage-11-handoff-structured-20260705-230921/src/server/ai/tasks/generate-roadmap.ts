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
  assessment: Pick<
    Assessment,
    "status" | "score" | "resultLevel" | "strengths" | "weaknesses"
  > | null;
};

export type GenerateRoadmapResult = {
  promptVersion: string;
  output: RoadmapOutput;
};

const planningInputReferences = [
  {
    title: "当前计划输入",
    note: "使用学习方向、具体目标、周期、每日可用时间和偏好资源约束路线。",
  },
  {
    title: "最近一次基础测评",
    note: "使用测评分数、基础等级、优势和薄弱点决定阶段难度与先后顺序。",
  },
];

const aiSourceReferences = {
  prompt: [
    {
      title: "OpenAI Text generation guide",
      url: "https://developers.openai.com/api/docs/guides/text-generation",
      note: "用于核验 LLM 输入输出、提示词和模型能力边界。",
    },
    {
      title: "OpenAI Structured Outputs guide",
      url: "https://developers.openai.com/api/docs/guides/structured-outputs",
      note: "用于核验为什么早期要学习结构化输出和输出约束。",
    },
  ],
  rag: [
    {
      title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
      url: "https://arxiv.org/abs/2005.11401",
      note: "用于核验 RAG 的核心思想：先检索相关资料，再辅助生成回答。",
    },
    {
      title: "OpenAI Embeddings guide",
      url: "https://developers.openai.com/api/docs/guides/embeddings",
      note: "用于核验 Embedding、语义相似度和向量检索的基础作用。",
    },
  ],
  evaluation: [
    {
      title: "OpenAI Evals guide",
      url: "https://developers.openai.com/api/docs/guides/evals",
      note: "用于核验为什么 AI 产品需要测试集、评价标准和持续评估。",
    },
    {
      title: "NIST AI Risk Management Framework",
      url: "https://www.nist.gov/itl/ai-risk-management-framework",
      note: "用于核验风险、可靠性、安全和治理维度。",
    },
  ],
  prd: [
    {
      title: "OpenAI Evals guide",
      url: "https://developers.openai.com/api/docs/guides/evals",
      note: "用于把 PRD 的验收标准落到可测试的样例和指标上。",
    },
    {
      title: "NIST AI Risk Management Framework",
      url: "https://www.nist.gov/itl/ai-risk-management-framework",
      note: "用于把风险、失败兜底和上线前检查写进产品方案。",
    },
  ],
};

export function generateMockRoadmap(input: GenerateRoadmapInput): GenerateRoadmapResult {
  if (isAiPlan(input.plan)) {
    return generateAiRoadmap(input);
  }

  const level = input.assessment?.resultLevel ?? "beginner";
  const isConservative = level === "zero" || level === "beginner";
  const direction = input.plan.learningDirection;
  const dailyMinutes = input.plan.dailyMinutes;
  const genericPreferences = [
    getPreference(input.plan.preferredResources, 0, "文章"),
    getPreference(input.plan.preferredResources, 1, "案例"),
    getPreference(input.plan.preferredResources, 2, "项目实践"),
  ];

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
        sequenceRationale: "先建立术语和概念地图，后续案例练习和作品输出才有判断标准。",
        sourceReferences: planningInputReferences,
        durationDays: Math.max(3, Math.min(7, Math.ceil(input.plan.durationDays * 0.25))),
      },
      {
        title: `${direction} 方法与案例练习`,
        sequence: 2,
        goal: "把基础概念放进真实案例中理解，形成可复用的方法框架。",
        contentOutline: "案例分析、流程拆解、需求判断、常见风险。",
        expectedOutcome: "完成一份结构化案例分析表。",
        acceptanceCriteria: "能说明一个案例的目标用户、关键流程、输入输出和风险点。",
        sequenceRationale:
          "在理解概念后进入案例，把抽象知识放入真实流程里验证，避免直接做作品时只靠猜测。",
        sourceReferences: planningInputReferences,
        durationDays: Math.max(4, Math.min(10, Math.ceil(input.plan.durationDays * 0.35))),
      },
      {
        title: `${direction} 小作品输出`,
        sequence: 3,
        goal: "完成一个能展示学习成果的小作品或方案草稿。",
        contentOutline: "选题、结构化输出、检查清单、复盘改进。",
        expectedOutcome: input.plan.targetOutcome ?? "完成一份可展示的学习作品。",
        acceptanceCriteria: "产出完整草稿，并根据检查清单完成一次自查。",
        sequenceRationale: "最后安排作品输出，是因为它需要复用前面建立的概念、案例拆解和自查标准。",
        sourceReferences: planningInputReferences,
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
        resourceType: preferenceToResourceType(genericPreferences[0]),
        url: `https://zh.wikipedia.org/w/index.php?search=${encodeURIComponent(direction)}`,
        sourceName: "维基百科检索入口",
        difficulty: "easy",
        estimatedMinutes: 30,
        recommendationReason: `匹配你的“${genericPreferences[0]}”偏好，适合快速建立概念地图。`,
        verificationNote: "请从检索结果中选择有引用来源的条目，并核对更新时间。",
        matchedPreferences: [genericPreferences[0]],
      },
      {
        stageSequence: 2,
        title: `${direction} 真实案例分析`,
        resourceType: preferenceToResourceType(genericPreferences[1]),
        url: `https://scholar.google.com/scholar?q=${encodeURIComponent(`${direction} case study`)}`,
        sourceName: "Google Scholar 检索入口",
        difficulty: "medium",
        estimatedMinutes: 45,
        recommendationReason: `匹配你的“${genericPreferences[1]}”偏好，适合把概念放到具体场景里理解。`,
        verificationNote: "请自行确认作者、机构和引用信息，不要把单一案例当成通用结论。",
        matchedPreferences: [genericPreferences[1]],
      },
      {
        stageSequence: 3,
        title: `${direction} 输出模板或检查清单`,
        resourceType: preferenceToResourceType(genericPreferences[2]),
        url: `https://github.com/search?q=${encodeURIComponent(`${direction} template`)}&type=repositories`,
        sourceName: "GitHub 项目检索入口",
        difficulty: "medium",
        estimatedMinutes: 30,
        recommendationReason: `匹配你的“${genericPreferences[2]}”偏好，适合辅助完成最终作品草稿。`,
        verificationNote: "请检查项目更新时间、许可证和维护情况，再根据自己的目标调整模板。",
        matchedPreferences: [genericPreferences[2]],
      },
    ],
  };

  const parsed = roadmapOutputSchema.parse(rawOutput);

  return {
    promptVersion: ROADMAP_PROMPT_VERSION,
    output: parsed,
  };
}

function generateAiRoadmap(input: GenerateRoadmapInput): GenerateRoadmapResult {
  const level = input.assessment?.resultLevel ?? "beginner";
  const isConservative = level === "zero" || level === "beginner";
  const [stage1Days, stage2Days, stage3Days, stage4Days] = splitStageDurations(
    input.plan.durationDays,
    [0.22, 0.3, 0.23, 0.25],
  );
  const outputTarget = input.plan.targetOutcome ?? "一份 AI App PRD 草稿";

  const rawOutput: RoadmapOutput = {
    overview: `围绕「${input.plan.learningDirection}」生成 ${input.plan.durationDays} 天 AI 路线图：先补 LLM 和 Prompt 判断力，再做 RAG 方案拆解，最后输出可评审的 AI 产品 PRD。`,
    stages: [
      {
        title: "LLM 与 Prompt 基础判断",
        sequence: 1,
        goal: "建立 AI 产品经理必须会用的 LLM、Token、上下文窗口、幻觉、结构化输出等基础判断。",
        contentOutline:
          "LLM 工作方式、Prompt 结构、系统提示词与用户提示词、温度参数、结构化输出、幻觉与可控边界。",
        expectedOutcome: "完成一张 LLM / Prompt / Token / 上下文窗口 / 幻觉的概念对照表。",
        acceptanceCriteria:
          "能判断一个需求是否适合直接调用 LLM，并能写出包含角色、任务、约束和输出格式的 Prompt。",
        sequenceRationale:
          "先学 LLM 与 Prompt，是因为它们是理解所有 AI 应用输入输出、能力边界和后续 RAG/评估设计的共同基础。",
        sourceReferences: aiSourceReferences.prompt,
        durationDays: stage1Days,
      },
      {
        title: "RAG 知识库问答流程",
        sequence: 2,
        goal: "理解真实 AI 应用里最常见的知识库问答路线，知道 RAG 不是简单把文档塞给模型。",
        contentOutline:
          "文档清洗、Chunk 切片、Embedding、向量检索、Top K、重排、引用来源、拒答策略和更新机制。",
        expectedOutcome: "画出一个知识库问答产品的 RAG 流程图，并标注每一步的输入、输出和风险。",
        acceptanceCriteria:
          "能解释 Embedding 与向量检索的作用，并能说明为什么需要引用来源、召回评估和拒答规则。",
        sequenceRationale:
          "RAG 需要先理解模型输入输出和 Prompt 约束，再学习检索、Embedding、引用来源和拒答策略。",
        sourceReferences: aiSourceReferences.rag,
        durationDays: stage2Days,
      },
      {
        title: "AI 产品方案与评估指标",
        sequence: 3,
        goal: "把模型能力翻译成产品方案，明确用户场景、MVP 边界、成本、风险和评估指标。",
        contentOutline:
          "用户场景拆解、AI 交互流程、模型输入输出、准确率/召回率/满意度指标、成本估算、隐私与安全风险。",
        expectedOutcome: "完成一份 AI 功能方案表，包含目标用户、核心流程、指标、风险和验收方式。",
        acceptanceCriteria:
          "能说明一个 AI 功能上线前要验证哪些指标，并能区分体验问题、数据问题和模型能力问题。",
        sequenceRationale:
          "在掌握 LLM 与 RAG 流程后再定义产品方案和评估指标，才能把模型能力、数据质量、用户体验和风险放到同一个验收框架里。",
        sourceReferences: aiSourceReferences.evaluation,
        durationDays: stage3Days,
      },
      {
        title: "AI App PRD 与作品打磨",
        sequence: 4,
        goal: `把前面学到的概念、流程和评估方法落到作品里，形成 ${outputTarget}。`,
        contentOutline:
          "PRD 结构、核心用户故事、Prompt/RAG 方案、异常状态、埋点指标、灰度上线、评审清单和复盘改进。",
        expectedOutcome: outputTarget,
        acceptanceCriteria:
          "PRD 至少包含用户问题、核心流程、AI 能力边界、数据来源、评估指标、失败兜底和下一版迭代计划。",
        sequenceRationale:
          "最后写 PRD，是因为完整方案需要依赖前面形成的概念判断、RAG 链路、评估指标和风险清单。",
        sourceReferences: aiSourceReferences.prd,
        durationDays: stage4Days,
      },
    ],
    tasks: [
      {
        stageSequence: 1,
        dayOffset: 0,
        title: "区分 LLM、Prompt、Token 和上下文窗口",
        description: "用产品经理能理解的语言写出四个概念的差异，不只抄定义。",
        taskType: "output",
        difficulty: isConservative ? "easy" : "medium",
        estimatedMinutes: boundedMinutes(input.plan.dailyMinutes, 45),
        completionCriteria: "完成一张 4 列概念对照表，并各写 1 个产品场景例子。",
        isCore: true,
      },
      {
        stageSequence: 1,
        dayOffset: 1,
        title: "改写一个结构化输出 Prompt",
        description: "把一句宽泛需求改成包含角色、任务、约束、示例和 JSON 输出格式的 Prompt。",
        taskType: "practice",
        difficulty: "medium",
        estimatedMinutes: boundedMinutes(input.plan.dailyMinutes, 50),
        completionCriteria: "提交原始 Prompt、改写后 Prompt，以及你设置每个约束的理由。",
        isCore: true,
      },
      {
        stageSequence: 2,
        dayOffset: 3,
        title: "画出 RAG 问答链路",
        description: "拆解从上传文档到模型回答的完整链路，标出检索和生成之间的数据流。",
        taskType: "output",
        difficulty: "medium",
        estimatedMinutes: boundedMinutes(input.plan.dailyMinutes, 60),
        completionCriteria: "流程图至少包含切片、Embedding、向量库、检索、重排、生成和引用来源。",
        isCore: true,
      },
      {
        stageSequence: 2,
        dayOffset: 5,
        title: "设计 RAG 失败兜底规则",
        description: "针对检索不到、召回错误、模型编造和资料过期四类问题设计产品策略。",
        taskType: "practice",
        difficulty: "challenging",
        estimatedMinutes: boundedMinutes(input.plan.dailyMinutes, 60),
        completionCriteria: "写出 4 类失败场景、用户提示文案和后台监控指标。",
        isCore: true,
      },
      {
        stageSequence: 3,
        dayOffset: 7,
        title: "拆解一个 AI App 的核心指标",
        description: "选择一个 AI 学习助手、客服助手或写作助手，拆出产品指标和模型指标。",
        taskType: "output",
        difficulty: "medium",
        estimatedMinutes: boundedMinutes(input.plan.dailyMinutes, 50),
        completionCriteria: "至少列出 3 个产品指标、3 个 AI 质量指标和 2 个成本/风险指标。",
        isCore: true,
      },
      {
        stageSequence: 3,
        dayOffset: 9,
        title: "写 AI 功能验收用例",
        description: "用考试题一样的方式准备可判分样例，覆盖正确回答、拒答和边界条件。",
        taskType: "test",
        difficulty: "challenging",
        estimatedMinutes: boundedMinutes(input.plan.dailyMinutes, 60),
        completionCriteria: "输出至少 8 条测试用例，包含输入、期望输出、判分标准和失败处理。",
        isCore: true,
      },
      {
        stageSequence: 4,
        dayOffset: 11,
        title: "搭建 AI App PRD 大纲",
        description: "把用户问题、核心流程、AI 能力边界、数据来源和验收指标放入同一份 PRD。",
        taskType: "project",
        difficulty: "challenging",
        estimatedMinutes: boundedMinutes(input.plan.dailyMinutes, 90),
        completionCriteria: "PRD 大纲不少于 6 个章节，并包含一张核心流程图。",
        isCore: true,
      },
      {
        stageSequence: 4,
        dayOffset: 13,
        title: "完成 PRD 自评和下一版计划",
        description: "按产品价值、AI 可行性、数据风险和交互完整度复查作品。",
        taskType: "review",
        difficulty: "medium",
        estimatedMinutes: boundedMinutes(input.plan.dailyMinutes, 45),
        completionCriteria: "写出 3 个必须修改的问题、3 个可延后问题和下一版迭代顺序。",
        isCore: true,
      },
    ],
    resources: selectResourcesByPreference(
      [
        {
          stageSequence: 1,
          title: "OpenAI Prompt Engineering 指南",
          resourceType: "official_doc",
          url: "https://developers.openai.com/api/docs/guides/prompt-engineering",
          sourceName: "OpenAI Developers",
          difficulty: "medium",
          estimatedMinutes: 45,
          recommendationReason: "适合理解 Prompt 结构、指令优先级和模型能力边界。",
          verificationNote: "请确认文档更新时间，并对照你实际使用的模型验证示例。",
          preferenceTags: ["官方文档", "文章"],
        },
        {
          stageSequence: 1,
          title: "ChatGPT Prompt Engineering for Developers",
          resourceType: "video_course",
          url: "https://www.deeplearning.ai/alpha/short-courses/chatgpt-prompt-engineering-for-developers",
          sourceName: "DeepLearning.AI × OpenAI",
          difficulty: "easy",
          estimatedMinutes: 90,
          recommendationReason: "用短视频和代码示例建立 Prompt 迭代的直观认识。",
          verificationNote: "请留意课程使用的模型版本，并把方法迁移到当前模型重新测试。",
          preferenceTags: ["视频课", "案例"],
        },
        {
          stageSequence: 1,
          title: "Structured Outputs 实践案例",
          resourceType: "exercise",
          url: "https://developers.openai.com/cookbook/examples/structured_outputs_intro",
          sourceName: "OpenAI Cookbook",
          difficulty: "medium",
          estimatedMinutes: 60,
          recommendationReason: "通过可运行示例理解结构化输出及其产品验收价值。",
          verificationNote: "请实际修改 Schema 和输入进行测试，不要只阅读示例结果。",
          preferenceTags: ["项目实践", "案例"],
        },
        {
          stageSequence: 2,
          title: "OpenAI Retrieval 指南",
          resourceType: "official_doc",
          url: "https://developers.openai.com/api/docs/guides/retrieval",
          sourceName: "OpenAI Developers",
          difficulty: "medium",
          estimatedMinutes: 50,
          recommendationReason: "适合建立向量存储、语义检索和检索参数的完整概念。",
          verificationNote: "请把产品流程概念与具体 API 参数分开记录，避免绑定单一实现。",
          preferenceTags: ["官方文档", "文章"],
        },
        {
          stageSequence: 2,
          title: "用 File Search 完成 PDF RAG",
          resourceType: "exercise",
          url: "https://developers.openai.com/cookbook/examples/file_search_responses",
          sourceName: "OpenAI Cookbook",
          difficulty: "medium",
          estimatedMinutes: 75,
          recommendationReason: "用完整案例观察上传、检索、回答和引用来源的链路。",
          verificationNote: "请重点记录失败场景、引用质量和资料更新策略，而不只看成功结果。",
          preferenceTags: ["项目实践", "案例"],
        },
        {
          stageSequence: 2,
          title: "RAG 原始论文",
          resourceType: "paper",
          url: "https://arxiv.org/abs/2005.11401",
          sourceName: "arXiv",
          difficulty: "challenging",
          estimatedMinutes: 90,
          recommendationReason: "用于核验 RAG 的原始问题定义、方法和实验依据。",
          verificationNote:
            "请结合更新的工程资料阅读，不要把 2020 年论文实现直接当作当前最佳实践。",
          preferenceTags: ["文章", "书籍"],
        },
        {
          stageSequence: 3,
          title: "OpenAI Evals 指南",
          resourceType: "official_doc",
          url: "https://developers.openai.com/api/docs/guides/evals",
          sourceName: "OpenAI Developers",
          difficulty: "medium",
          estimatedMinutes: 55,
          recommendationReason: "适合把模糊的“回答质量”拆成测试集、评分规则和持续评估。",
          verificationNote: "请根据你的产品场景重新定义样本和评分标准，不要照搬示例指标。",
          preferenceTags: ["官方文档", "文章"],
        },
        {
          stageSequence: 3,
          title: "OpenAI Evals 入门实践",
          resourceType: "exercise",
          url: "https://developers.openai.com/cookbook/examples/evaluation/getting_started_with_openai_evals",
          sourceName: "OpenAI Cookbook",
          difficulty: "challenging",
          estimatedMinutes: 75,
          recommendationReason: "通过可运行案例练习数据集、评分器和评估结果分析。",
          verificationNote: "请加入你自己的边界样例，并检查评分器是否与人工判断一致。",
          preferenceTags: ["项目实践", "案例"],
        },
        {
          stageSequence: 3,
          title: "NIST AI 风险管理框架",
          resourceType: "article",
          url: "https://www.nist.gov/itl/ai-risk-management-framework",
          sourceName: "NIST",
          difficulty: "challenging",
          estimatedMinutes: 60,
          recommendationReason: "补充可靠性、安全、治理和持续风险管理维度。",
          verificationNote: "请确认当前框架版本，并只选择与你的产品场景相关的风险项。",
          preferenceTags: ["文章", "案例"],
        },
        {
          stageSequence: 4,
          title: "Atlassian 产品需求文档模板",
          resourceType: "tool_guide",
          url: "https://www.atlassian.com/software/confluence/templates/product-requirements",
          sourceName: "Atlassian",
          difficulty: "easy",
          estimatedMinutes: 35,
          recommendationReason: "提供可直接改写的需求背景、目标、假设和验收结构。",
          verificationNote: "请加入 AI 能力边界、数据来源、评估集和失败兜底，不要原样套用模板。",
          preferenceTags: ["项目实践", "案例"],
        },
        {
          stageSequence: 4,
          title: "NIST AI RMF Playbook",
          resourceType: "tool_guide",
          url: "https://www.nist.gov/itl/ai-risk-management-framework/nist-ai-rmf-playbook",
          sourceName: "NIST",
          difficulty: "challenging",
          estimatedMinutes: 60,
          recommendationReason: "用于把风险识别、度量和处置动作补进 AI App PRD。",
          verificationNote: "请按产品风险等级选用条目，框架不是固定验收清单。",
          preferenceTags: ["文章", "官方文档"],
        },
        {
          stageSequence: 4,
          title: "用 Evals 样例完善 PRD 验收标准",
          resourceType: "case_study",
          url: "https://developers.openai.com/cookbook/examples/evaluation/getting_started_with_openai_evals",
          sourceName: "OpenAI Cookbook",
          difficulty: "medium",
          estimatedMinutes: 50,
          recommendationReason: "把 PRD 里的验收描述转换成输入、期望输出和判分规则。",
          verificationNote: "请使用你自己的用户任务和失败样例验证验收标准。",
          preferenceTags: ["项目实践", "案例"],
        },
      ],
      input.plan.preferredResources,
    ),
  };

  const parsed = roadmapOutputSchema.parse(rawOutput);

  return {
    promptVersion: ROADMAP_PROMPT_VERSION,
    output: parsed,
  };
}

type RoadmapResource = RoadmapOutput["resources"][number];
type ResourceCandidate = Omit<RoadmapResource, "matchedPreferences"> & {
  preferenceTags: string[];
};

function selectResourcesByPreference(
  candidates: ResourceCandidate[],
  preferredResources: string[],
): RoadmapResource[] {
  const preferenceSet = new Set(preferredResources);
  const stageSequences = [...new Set(candidates.map((candidate) => candidate.stageSequence))].sort(
    (left, right) => left - right,
  );

  return stageSequences.flatMap((stageSequence) =>
    candidates
      .filter((candidate) => candidate.stageSequence === stageSequence)
      .map((candidate, originalIndex) => ({
        candidate,
        originalIndex,
        matches: candidate.preferenceTags.filter((tag) => preferenceSet.has(tag)),
      }))
      .sort(
        (left, right) =>
          right.matches.length - left.matches.length || left.originalIndex - right.originalIndex,
      )
      .slice(0, 2)
      .map(({ candidate }) => {
        const { preferenceTags, ...resource } = candidate;
        const matches = preferenceTags.filter((tag) => preferenceSet.has(tag));
        const preferenceReason =
          matches.length > 0 ? `匹配你的“${matches.join("、")}”偏好` : "作为这个阶段的核心参考资料";

        return {
          ...resource,
          recommendationReason: `${preferenceReason}；${resource.recommendationReason}`,
          matchedPreferences: matches,
        };
      }),
  );
}

function getPreference(preferences: string[], index: number, fallback: string) {
  return preferences[index] ?? preferences[0] ?? fallback;
}

function preferenceToResourceType(preference: string): RoadmapResource["resourceType"] {
  const resourceTypeByPreference: Record<string, RoadmapResource["resourceType"]> = {
    文章: "article",
    书籍: "book",
    视频课: "video_course",
    案例: "case_study",
    项目实践: "exercise",
    官方文档: "official_doc",
  };

  return resourceTypeByPreference[preference] ?? "article";
}

function isAiPlan(plan: GenerateRoadmapInput["plan"]) {
  const signal = `${plan.title} ${plan.learningDirection} ${plan.specificGoal}`.toLowerCase();
  return ["ai", "人工智能", "大模型", "llm", "rag", "prompt", "智能体"].some((keyword) =>
    signal.includes(keyword),
  );
}

function splitStageDurations(totalDays: number, weights: number[]) {
  const safeTotal = Math.max(weights.length, totalDays);
  const durations = weights.map((weight) => Math.max(1, Math.round(safeTotal * weight)));
  let delta = safeTotal - durations.reduce((sum, days) => sum + days, 0);
  let index = 0;

  while (delta !== 0) {
    const currentIndex = index % durations.length;

    if (delta > 0) {
      durations[currentIndex] += 1;
      delta -= 1;
    } else if (durations[currentIndex] > 1) {
      durations[currentIndex] -= 1;
      delta += 1;
    }

    index += 1;
  }

  return durations.map((days) => Math.min(30, days));
}

function boundedMinutes(dailyMinutes: number, cap: number) {
  return Math.max(10, Math.min(dailyMinutes, cap));
}
