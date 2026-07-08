import type { AssessmentQuestion } from "@/features/assessment/types";

export type AssessmentQuestionInput = {
  learningDirection: string;
  specificGoal?: string;
  goalType?: string;
};

export function buildAssessmentQuestions(
  inputOrDirection: AssessmentQuestionInput | string,
): AssessmentQuestion[] {
  const input =
    typeof inputOrDirection === "string"
      ? { learningDirection: inputOrDirection }
      : inputOrDirection;
  const profile = resolveAssessmentProfile(input);

  if (profile === "ai") {
    return normalizeLocalScores(buildAiAssessmentQuestions(input.learningDirection));
  }

  if (profile === "programming") {
    return normalizeLocalScores(buildProgrammingAssessmentQuestions(input.learningDirection));
  }

  if (profile === "language") {
    return normalizeLocalScores(buildLanguageAssessmentQuestions(input.learningDirection));
  }

  if (profile === "exam") {
    return normalizeLocalScores(buildExamAssessmentQuestions(input.learningDirection));
  }

  return normalizeLocalScores(buildGeneralAssessmentQuestions(input.learningDirection));
}

export function parseAssessmentQuestions(value: unknown): AssessmentQuestion[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const questions = value.filter(isAssessmentQuestion);

  return questions.length === value.length && questions.length > 0 ? questions : null;
}

function resolveAssessmentProfile(input: AssessmentQuestionInput) {
  const text = `${input.learningDirection} ${input.specificGoal ?? ""} ${
    input.goalType ?? ""
  }`.toLowerCase();

  if (
    /ai|人工智能|大模型|llm|rag|prompt|提示词|机器学习|深度学习|agent|智能体/.test(text)
  ) {
    return "ai";
  }

  if (
    /编程|代码|开发|前端|后端|全栈|javascript|typescript|python|java|react|next|数据库|sql/.test(
      text,
    )
  ) {
    return "programming";
  }

  if (/英语|日语|语言|口语|听力|托福|雅思|ielts|toefl|language/.test(text)) {
    return "language";
  }

  if (/考试|考研|高考|中考|证书|认证|公务员|exam|test|certification|exam_prep/.test(text)) {
    return "exam";
  }

  return "general";
}

function buildAiAssessmentQuestions(learningDirection: string): AssessmentQuestion[] {
  return [
    {
      id: "ai-llm-definition",
      prompt: `【${learningDirection}】面试题：把“LLM 是一个会聊天的搜索引擎”作为产品方案前提，主要问题在哪里？`,
      options: [
        { value: "2", label: "它能解释部分问答体验，但忽略了生成、推理和上下文建模能力。", score: 2 },
        { value: "0", label: "这个说法没有问题，LLM 的输出本质上就是搜索结果排序。", score: 0 },
        { value: "3", label: "它混淆了检索系统和生成模型，容易误判知识来源、幻觉和可控性风险。", score: 3 },
        { value: "1", label: "主要问题是搜索引擎不能联网，而 LLM 默认都能实时联网。", score: 1 },
      ],
    },
    {
      id: "ai-rag-purpose",
      prompt: "场景题：企业知识库问答经常回答过期政策。引入 RAG 后，最关键的设计点是什么？",
      options: [
        { value: "1", label: "把政策文档批量复制进系统提示词，减少检索链路复杂度。", score: 1 },
        { value: "3", label: "建立可更新的知识切片、检索排序和引用约束，让回答绑定到当前证据。", score: 3 },
        { value: "0", label: "提高模型 temperature，让它在政策冲突时生成更完整的解释。", score: 0 },
        { value: "2", label: "只要接入向量库即可，切片方式和召回质量对答案影响不大。", score: 2 },
      ],
    },
    {
      id: "ai-embedding-search",
      prompt: "考试题：用户问“怎么报销差旅”，文档标题是“员工出行费用管理办法”。为什么向量检索可能比关键词检索更容易召回？",
      options: [
        { value: "3", label: "Embedding 能把语义相近但字面不同的文本映射到相近向量空间。", score: 3 },
        { value: "1", label: "向量检索会自动理解公司制度的最新版本，不需要额外更新索引。", score: 1 },
        { value: "2", label: "它能缓解同义表达问题，但仍依赖切片质量、模型和重排策略。", score: 2 },
        { value: "0", label: "因为向量检索会逐字匹配所有标题，比倒排索引更精确。", score: 0 },
      ],
    },
    {
      id: "ai-hallucination-control",
      prompt: "排障题：RAG 系统能召回相关文档，但回答仍会编造不存在的条款编号。优先改哪一项？",
      options: [
        { value: "2", label: "降低 temperature 并要求引用来源，能减少但不一定消除无证据内容。", score: 2 },
        { value: "0", label: "去掉引用展示，避免用户发现条款编号不一致。", score: 0 },
        { value: "3", label: "把生成约束为仅基于片段作答，要求逐条引用；证据不足时拒答或标注不确定。", score: 3 },
        { value: "1", label: "扩大 topK，让模型看到更多片段，通常就不需要其他约束。", score: 1 },
      ],
    },
    {
      id: "ai-prompt-structured-output",
      prompt: "产品题：你要把模型生成的学习计划直接写入数据库。为什么要优先要求结构化输出？",
      options: [
        { value: "1", label: "主要是让回答看起来更像技术文档，提升用户信任。", score: 1 },
        { value: "3", label: "字段、类型和必填项可校验，能降低解析失败和脏数据入库风险。", score: 3 },
        { value: "0", label: "结构化输出会让模型自动知道业务规则，不再需要后端校验。", score: 0 },
        { value: "2", label: "它能提升工程稳定性，但仍需要 schema 校验和错误兜底。", score: 2 },
      ],
    },
    {
      id: "ai-agent-tool-use",
      prompt: "方案评审题：什么时候更有理由使用 Agent，而不是一次普通 LLM 调用？",
      options: [
        { value: "0", label: "只要用户问题里出现 AI，就应该默认用 Agent。", score: 0 },
        { value: "2", label: "任务需要多步处理时可以考虑，但如果流程固定，普通工作流可能更稳。", score: 2 },
        { value: "3", label: "任务目标明确但路径不固定，需要规划、调用工具、观察结果并迭代。", score: 3 },
        { value: "1", label: "当只需要把一段文本改写成另一种语气时，Agent 通常最合适。", score: 1 },
      ],
    },
  ];
}

function buildProgrammingAssessmentQuestions(learningDirection: string): AssessmentQuestion[] {
  return [
    {
      id: "code-debugging",
      prompt: `【${learningDirection}】线上接口突然 500，但本地无法复现。你最应该先收集哪组信息？`,
      options: [
        { value: "2", label: "用户操作路径、请求参数、发布时间和最近改动，这些能缩小范围。", score: 2 },
        { value: "0", label: "先把页面样式回滚，因为 500 通常由 CSS 编译触发。", score: 0 },
        { value: "3", label: "服务端堆栈、请求 ID、环境变量、依赖版本和最近部署差异。", score: 3 },
        { value: "1", label: "先让用户重试，如果重试成功就不用再查日志。", score: 1 },
      ],
    },
    {
      id: "code-api-contract",
      prompt: "接口联调题：后端把 `dueDate` 从字符串改成时间戳，前端多处报错。更根本的改进是什么？",
      options: [
        { value: "1", label: "前端在每个页面都同时兼容字符串和时间戳，先不改接口。", score: 1 },
        { value: "3", label: "把请求/响应契约版本化，并用类型或 schema 在边界处校验。", score: 3 },
        { value: "0", label: "让前端以后不要依赖接口字段类型，只展示原始值。", score: 0 },
        { value: "2", label: "短期可做兼容层，但仍需要明确契约和迁移窗口。", score: 2 },
      ],
    },
    {
      id: "code-database-index",
      prompt: "数据库题：`WHERE userId = ? ORDER BY createdAt DESC LIMIT 20` 随数据量增长变慢，优先判断什么？",
      options: [
        { value: "3", label: "执行计划是否走了匹配过滤和排序的复合索引，如 `(userId, createdAt)`。", score: 3 },
        { value: "0", label: "把 `createdAt` 改成字符串，排序时就能减少数据库计算。", score: 0 },
        { value: "2", label: "先确认是否缺索引和是否扫描过多行，再考虑缓存或分页策略。", score: 2 },
        { value: "1", label: "只要加单列 `userId` 索引，排序成本通常就可以忽略。", score: 1 },
      ],
    },
    {
      id: "code-git-revert",
      prompt: "Git 题：主分支已经推送，一个提交引入 bug，但团队希望保留公开历史。应优先怎么处理？",
      options: [
        { value: "2", label: "如果分支未共享，可以考虑重写历史；但主分支已公开时风险较高。", score: 2 },
        { value: "3", label: "使用 revert 生成反向提交，再通过正常流程合入。", score: 3 },
        { value: "0", label: "删除本地 `.git` 后重新初始化仓库。", score: 0 },
        { value: "1", label: "强推到远程覆盖主分支，之后让其他人重新 clone。", score: 1 },
      ],
    },
    {
      id: "code-testing",
      prompt: "测试题：你改了核心表单的服务端 action。哪组测试最能覆盖真实风险？",
      options: [
        { value: "1", label: "只测按钮能点击，因为提交后由框架保证一定正确。", score: 1 },
        { value: "3", label: "覆盖成功提交、字段校验失败、权限/不存在资源和服务端异常路径。", score: 3 },
        { value: "0", label: "只截一张页面图，确认表单看起来没有变形。", score: 0 },
        { value: "2", label: "先手测主流程，再补关键分支测试，能覆盖一部分风险。", score: 2 },
      ],
    },
    {
      id: "code-self-efficacy",
      prompt: "能力自评：遇到陌生构建报错，你通常能做到哪一步？",
      options: [
        { value: "2", label: "能根据堆栈、最近改动和文档定位到可疑模块。", score: 2 },
        { value: "0", label: "主要等待别人看，自己不太知道从哪开始。", score: 0 },
        { value: "3", label: "能最小复现、二分缩小范围、验证假设并沉淀修复记录。", score: 3 },
        { value: "1", label: "能搜索报错，但常常难以判断哪个答案适合当前项目。", score: 1 },
      ],
    },
  ];
}

function buildLanguageAssessmentQuestions(learningDirection: string): AssessmentQuestion[] {
  return [
    {
      id: "language-main-idea",
      prompt: `【${learningDirection}】阅读题：文章先承认远程办公提高灵活性，随后强调协作成本上升。作者态度最可能是？`,
      options: [
        { value: "1", label: "完全支持，因为第一句话提到了灵活性。", score: 1 },
        { value: "3", label: "审慎或平衡，认可优点但把重点转向代价。", score: 3 },
        { value: "0", label: "完全反对，因为文章出现了成本这个负面词。", score: 0 },
        { value: "2", label: "可能是转折后的保留态度，但还需要看结论句确认。", score: 2 },
      ],
    },
    {
      id: "language-vocabulary-context",
      prompt: "词义推断题：句子是 “The proposal is feasible, albeit costly.” 这里 `albeit` 的作用更接近？",
      options: [
        { value: "2", label: "表示让步，说明可行但有成本问题。", score: 2 },
        { value: "0", label: "表示因果，说明成本高所以方案可行。", score: 0 },
        { value: "3", label: "表示让步/转折，相当于 although，引出限制条件。", score: 3 },
        { value: "1", label: "表示并列，相当于 and，连接两个同向优点。", score: 1 },
      ],
    },
    {
      id: "language-listening",
      prompt: "听力复盘题：你听懂了单词但总漏掉答案，最可能优先训练什么？",
      options: [
        { value: "1", label: "继续扩大词汇量，因为漏答案只可能是单词不认识。", score: 1 },
        { value: "3", label: "训练定位信号词、转折/否定和题干关键词的同步匹配。", score: 3 },
        { value: "0", label: "只把原文读熟，不需要再听音频。", score: 0 },
        { value: "2", label: "复听错题片段并标记信号词，能改善一部分问题。", score: 2 },
      ],
    },
    {
      id: "language-writing",
      prompt: "写作题：题目问“是否同意科技让人更孤独”。哪种开头最稳？",
      options: [
        { value: "3", label: "明确立场，界定“科技”和“孤独”，并预告两条论证线。", score: 3 },
        { value: "1", label: "先写一大段科技发展历史，再慢慢引到题目。", score: 1 },
        { value: "2", label: "明确立场但不界定关键词，后文容易出现论证漂移。", score: 2 },
        { value: "0", label: "尽量堆叠高级词汇，立场可以放到结尾再说。", score: 0 },
      ],
    },
    {
      id: "language-speaking",
      prompt: "口语题：回答流利但经常跑题，最有效的下一步练习是什么？",
      options: [
        { value: "2", label: "用模板改善结构，但仍要检查是否正面回答题干。", score: 2 },
        { value: "0", label: "只练语速，让回答听起来更自然即可。", score: 0 },
        { value: "3", label: "先做题干拆解和 10 秒提纲，再录音检查每句话是否服务观点。", score: 3 },
        { value: "1", label: "背更多高级表达，内容是否切题可以后面再练。", score: 1 },
      ],
    },
    {
      id: "language-study-plan",
      prompt: "计划题：两周内要提升考试阅读，哪种安排最有诊断价值？",
      options: [
        { value: "1", label: "每天背随机单词，阅读题等考前再集中做。", score: 1 },
        { value: "2", label: "按题型练习并记录错题，但复盘维度还不够固定。", score: 2 },
        { value: "0", label: "只看双语文章，不计时也不做题。", score: 0 },
        { value: "3", label: "限时练习、错因分类、复读证据句，并每 3 天回看错题模式。", score: 3 },
      ],
    },
  ];
}

function buildExamAssessmentQuestions(learningDirection: string): AssessmentQuestion[] {
  return [
    {
      id: "exam-syllabus",
      prompt: `【${learningDirection}】你只剩 30 天备考，资料很多但时间有限。第一轮规划最应该基于什么？`,
      options: [
        { value: "2", label: "先按高频题型和薄弱模块排优先级，再决定资料取舍。", score: 2 },
        { value: "0", label: "先把所有热门资料都买齐，避免遗漏知识点。", score: 0 },
        { value: "3", label: "用大纲、题型分值、近年考法和个人诊断结果确定投入比例。", score: 3 },
        { value: "1", label: "优先跟随经验帖推荐顺序，别人成功过说明适合自己。", score: 1 },
      ],
    },
    {
      id: "exam-error-review",
      prompt: "错题题：同一类题反复错，但你每次看解析都觉得懂了。更有效的复盘记录是什么？",
      options: [
        { value: "1", label: "把解析抄完整，复习时多读几遍。", score: 1 },
        { value: "3", label: "记录错因、误判信号、正确触发条件，并安排间隔复做。", score: 3 },
        { value: "0", label: "只标记题目很难，后面遇到再说。", score: 0 },
        { value: "2", label: "补上知识点和正确步骤，但如果不复做仍可能迁移失败。", score: 2 },
      ],
    },
    {
      id: "exam-time-management",
      prompt: "模拟题：你不限时做题正确率 80%，限时只剩 55%。优先说明什么问题？",
      options: [
        { value: "3", label: "知识掌握、题型识别速度和取舍策略至少有一项没有达标。", score: 3 },
        { value: "1", label: "说明知识完全没掌握，不需要再做限时训练。", score: 1 },
        { value: "2", label: "可能是时间分配问题，但也要结合错因判断是否基础不稳。", score: 2 },
        { value: "0", label: "说明限时测试没有参考价值，只看不限时正确率即可。", score: 0 },
      ],
    },
    {
      id: "exam-knowledge-transfer",
      prompt: "迁移题：原题会做，换成新材料就不会做。最可能缺的是哪种能力？",
      options: [
        { value: "1", label: "主要是答案背得还不够多，继续记原题即可。", score: 1 },
        { value: "3", label: "识别题型、抽象条件和调用底层知识点的能力。", score: 3 },
        { value: "0", label: "说明这类题不可训练，只能靠临场发挥。", score: 0 },
        { value: "2", label: "可能缺总结，但如果不抽象共性，仍会停留在记题。", score: 2 },
      ],
    },
    {
      id: "exam-resource-filter",
      prompt: "资料题：两个课程都很热门，一个覆盖旧大纲但讲得细，一个按新大纲但练习少。你怎么选？",
      options: [
        { value: "2", label: "优先新大纲，再用其他材料补练习和薄弱模块。", score: 2 },
        { value: "1", label: "选讲得细的旧大纲课程，因为内容越多越稳。", score: 1 },
        { value: "3", label: "以最新大纲和题型为主线，组合补齐练习、解析和薄弱点。", score: 3 },
        { value: "0", label: "选更热门的，热度说明它一定覆盖当前考法。", score: 0 },
      ],
    },
    {
      id: "exam-consistency",
      prompt: "执行题：你每天只有 45 分钟，最能提升分数稳定性的安排是哪一种？",
      options: [
        { value: "0", label: "每天随便看一点资料，保持接触感即可。", score: 0 },
        { value: "2", label: "固定刷题和对答案，但复盘深度还需要加强。", score: 2 },
        { value: "1", label: "优先看视频课，做题等周末集中处理。", score: 1 },
        { value: "3", label: "限时小测、错因记录、间隔复做三件事稳定循环。", score: 3 },
      ],
    },
  ];
}

function buildGeneralAssessmentQuestions(learningDirection: string): AssessmentQuestion[] {
  return [
    {
      id: "concept",
      prompt: `【${learningDirection}】如果要向别人解释这个领域的 3 个核心概念，你目前最接近哪种状态？`,
      options: [
        { value: "1", label: "能说出几个词，但解释时主要依赖印象和例子。", score: 1 },
        { value: "3", label: "能给出定义、边界、例子，并说明它们之间的关系。", score: 3 },
        { value: "0", label: "基本还不能区分哪些概念是核心。", score: 0 },
        { value: "2", label: "能解释常见概念，但对边界和反例还不稳定。", score: 2 },
      ],
    },
    {
      id: "practice",
      prompt: "如果今天要做一个 2 小时的小练习，你最可能做到哪一步？",
      options: [
        { value: "2", label: "能完成一个小任务，但遇到开放问题时需要参考示例。", score: 2 },
        { value: "0", label: "还不知道如何把学习内容转成练习任务。", score: 0 },
        { value: "3", label: "能拆任务、设验收标准、完成输出并复盘不足。", score: 3 },
        { value: "1", label: "能跟着教程做一部分，但离开步骤容易卡住。", score: 1 },
      ],
    },
    {
      id: "resource",
      prompt: "遇到两个互相矛盾的资料观点时，你通常怎么判断？",
      options: [
        { value: "3", label: "看来源、时间、适用条件和证据链，再用第三方资料交叉验证。", score: 3 },
        { value: "1", label: "倾向选择更容易理解或点赞更多的那一个。", score: 1 },
        { value: "2", label: "会看作者和发布时间，但不一定能判断适用场景。", score: 2 },
        { value: "0", label: "通常不知道该相信哪一个。", score: 0 },
      ],
    },
    {
      id: "output",
      prompt: "学完一节内容后，哪种输出最接近你的当前水平？",
      options: [
        { value: "0", label: "只能保存资料链接，较少整理自己的理解。", score: 0 },
        { value: "2", label: "能写结构化总结，但还缺案例、反例或应用场景。", score: 2 },
        { value: "1", label: "能写要点笔记，但重点和层级不够稳定。", score: 1 },
        { value: "3", label: "能产出别人可读的说明、案例拆解或可展示作品。", score: 3 },
      ],
    },
    {
      id: "consistency",
      prompt: "接下来两周，如果某天只剩 20 分钟，你最可能怎么处理？",
      options: [
        { value: "2", label: "会缩小任务，至少完成一个可检查的小输出。", score: 2 },
        { value: "0", label: "大概率直接跳过，等有完整时间再学。", score: 0 },
        { value: "3", label: "会按预设的最小任务执行，并记录延期原因和下一步。", score: 3 },
        { value: "1", label: "可能看一点资料，但不一定留下结果。", score: 1 },
      ],
    },
    {
      id: "confidence",
      prompt: "当学习内容突然变难、看不懂资料时，你通常能做到哪一步？",
      options: [
        { value: "1", label: "需要别人告诉我先看哪一段、做哪一步。", score: 1 },
        { value: "3", label: "能拆成概念缺口、资料缺口和练习缺口，并逐个验证。", score: 3 },
        { value: "0", label: "容易停下来，不确定问题具体出在哪里。", score: 0 },
        { value: "2", label: "能搜索和补资料，但有时会陷入资料越看越多。", score: 2 },
      ],
    },
  ];
}

function isAssessmentQuestion(value: unknown): value is AssessmentQuestion {
  if (!value || typeof value !== "object") {
    return false;
  }

  const question = value as AssessmentQuestion;

  return (
    typeof question.id === "string" &&
    typeof question.prompt === "string" &&
    Array.isArray(question.options) &&
    question.options.length >= 2 &&
    question.options.every((option) => {
      return (
        typeof option.value === "string" &&
        typeof option.label === "string" &&
        typeof option.score === "number" &&
        option.score >= 0 &&
        option.score <= 3
      );
    })
  );
}

function normalizeLocalScores(questions: AssessmentQuestion[]): AssessmentQuestion[] {
  return questions.map((question) => ({
    ...question,
    options: question.options.map((option) => ({
      ...option,
      score: Number(option.value),
    })),
  }));
}
