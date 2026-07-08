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
      prompt: `【${learningDirection}】下列哪一项最准确描述 LLM（大语言模型）？`,
      options: [
        { value: "0", label: "只用于保存业务数据的关系型数据库", score: 0 },
        { value: "1", label: "只能做图片分类、不能生成文本的视觉模型", score: 0 },
        { value: "2", label: "固定规则引擎，按人工写死的 if/else 回复", score: 1 },
        { value: "3", label: "在大规模语料上训练、能理解和生成文本的模型", score: 3 },
      ],
    },
    {
      id: "ai-rag-purpose",
      prompt: "RAG 在大模型应用里的核心目的是什么？",
      options: [
        { value: "0", label: "让模型完全不需要提示词", score: 0 },
        { value: "1", label: "把所有知识永久训练进模型参数", score: 1 },
        { value: "2", label: "只负责把用户问题翻译成英文", score: 0 },
        { value: "3", label: "检索外部知识并作为上下文交给模型生成答案", score: 3 },
      ],
    },
    {
      id: "ai-embedding-search",
      prompt: "在向量检索中，Embedding 最常用于解决什么问题？",
      options: [
        { value: "0", label: "给数据库表自动添加主键", score: 0 },
        { value: "1", label: "把网页直接部署到服务器", score: 0 },
        { value: "2", label: "压缩图片体积，提高页面加载速度", score: 0 },
        { value: "3", label: "把文本表示成向量，用相似度找语义相关内容", score: 3 },
      ],
    },
    {
      id: "ai-hallucination-control",
      prompt: "一个 RAG 问答系统经常编造不存在的资料来源，优先应该怎么改？",
      options: [
        { value: "0", label: "把回答温度调高，让回答更丰富", score: 0 },
        { value: "1", label: "删除所有引用，避免用户看到来源", score: 0 },
        { value: "2", label: "只要求模型回答得更自信", score: 0 },
        { value: "3", label: "要求答案基于检索片段，缺少证据时明确说明无法确认", score: 3 },
      ],
    },
    {
      id: "ai-prompt-structured-output",
      prompt: "要求模型按固定 JSON 字段输出，主要是为了什么？",
      options: [
        { value: "0", label: "让模型训练速度更快", score: 0 },
        { value: "1", label: "让模型不再需要上下文", score: 0 },
        { value: "2", label: "让所有回答都变得更长", score: 0 },
        { value: "3", label: "方便程序稳定解析结果并渲染到界面", score: 3 },
      ],
    },
    {
      id: "ai-agent-tool-use",
      prompt: "AI Agent 和一次普通 LLM 调用相比，常见区别是什么？",
      options: [
        { value: "0", label: "Agent 只能聊天，不能调用工具", score: 0 },
        { value: "1", label: "Agent 不需要任何任务目标", score: 0 },
        { value: "2", label: "Agent 一定比所有工作流都更便宜", score: 0 },
        { value: "3", label: "Agent 可以围绕目标规划步骤，并按需调用工具或外部系统", score: 3 },
      ],
    },
  ];
}

function buildProgrammingAssessmentQuestions(learningDirection: string): AssessmentQuestion[] {
  return [
    {
      id: "code-debugging",
      prompt: `【${learningDirection}】线上页面突然 500，第一步最应该做什么？`,
      options: [
        { value: "0", label: "立即重写整个项目", score: 0 },
        { value: "1", label: "只刷新浏览器，忽略服务端日志", score: 0 },
        { value: "2", label: "先改样式文件，因为 500 通常是 CSS 问题", score: 0 },
        { value: "3", label: "查看错误日志和最近变更，定位请求、堆栈和环境变量", score: 3 },
      ],
    },
    {
      id: "code-api-contract",
      prompt: "前端调用接口时，最能降低联调风险的做法是什么？",
      options: [
        { value: "0", label: "口头约定字段名，不写任何文档", score: 0 },
        { value: "1", label: "接口返回什么前端就猜什么", score: 0 },
        { value: "2", label: "只在上线当天一起调试", score: 0 },
        { value: "3", label: "定义清晰的请求/响应结构，并用类型或 schema 校验", score: 3 },
      ],
    },
    {
      id: "code-database-index",
      prompt: "数据库查询随数据量变大明显变慢，优先应该检查什么？",
      options: [
        { value: "0", label: "把所有字段都改成字符串", score: 0 },
        { value: "1", label: "删除所有约束", score: 0 },
        { value: "2", label: "只增加前端 loading 动画", score: 0 },
        { value: "3", label: "查询条件、执行计划和相关索引是否合理", score: 3 },
      ],
    },
    {
      id: "code-git-revert",
      prompt: "发现一次提交引入 bug，但还想保留历史记录，常用做法是什么？",
      options: [
        { value: "0", label: "直接删除 .git 文件夹", score: 0 },
        { value: "1", label: "手动改 commit hash", score: 0 },
        { value: "2", label: "把整个仓库重新复制一份", score: 0 },
        { value: "3", label: "用 revert 创建一个反向提交", score: 3 },
      ],
    },
    {
      id: "code-testing",
      prompt: "一个核心表单提交逻辑改动后，最应该补哪类测试？",
      options: [
        { value: "0", label: "只测试按钮颜色", score: 0 },
        { value: "1", label: "只看页面截图，不提交数据", score: 1 },
        { value: "2", label: "只在自己电脑手点一次", score: 1 },
        { value: "3", label: "覆盖成功提交、校验失败和服务端错误路径", score: 3 },
      ],
    },
    {
      id: "code-self-efficacy",
      prompt: "遇到陌生报错时，你最接近哪种处理方式？",
      options: [
        { value: "0", label: "直接停下，不知道下一步", score: 0 },
        { value: "1", label: "复制报错搜索，但很难判断答案", score: 1 },
        { value: "2", label: "能根据堆栈和文档尝试定位", score: 2 },
        { value: "3", label: "能复现、缩小范围、验证假设并记录结论", score: 3 },
      ],
    },
  ];
}

function buildLanguageAssessmentQuestions(learningDirection: string): AssessmentQuestion[] {
  return [
    {
      id: "language-main-idea",
      prompt: `【${learningDirection}】阅读一段短文后，最能证明你真正读懂的是哪项能力？`,
      options: [
        { value: "0", label: "只认识其中几个单词", score: 0 },
        { value: "1", label: "能读出每个词的发音", score: 1 },
        { value: "2", label: "能逐字翻译，但不确定作者意图", score: 2 },
        { value: "3", label: "能概括主旨、判断态度并说明证据句", score: 3 },
      ],
    },
    {
      id: "language-vocabulary-context",
      prompt: "考试阅读中遇到生词，优先应该怎么处理？",
      options: [
        { value: "0", label: "立刻放弃整篇文章", score: 0 },
        { value: "1", label: "只凭单词长短猜意思", score: 0 },
        { value: "2", label: "不看上下文，直接选最熟悉的释义", score: 1 },
        { value: "3", label: "结合上下文、词性和转折关系推断含义", score: 3 },
      ],
    },
    {
      id: "language-listening",
      prompt: "听力训练中，最能提升考试表现的复盘方式是什么？",
      options: [
        { value: "0", label: "只听一遍，对答案后结束", score: 0 },
        { value: "1", label: "只记住自己错了几题", score: 1 },
        { value: "2", label: "只背听力原文里的生词", score: 2 },
        { value: "3", label: "定位没听懂的音、词组和逻辑信号，再跟读复听", score: 3 },
      ],
    },
    {
      id: "language-writing",
      prompt: "写作题要拿到更稳定分数，最关键的不是哪一项？",
      options: [
        { value: "0", label: "审题明确", score: 2 },
        { value: "1", label: "结构清晰", score: 2 },
        { value: "2", label: "例证能支撑观点", score: 2 },
        { value: "3", label: "堆砌生僻词，越复杂越好", score: 3 },
      ],
    },
    {
      id: "language-speaking",
      prompt: "口语练习中，下面哪种反馈最有价值？",
      options: [
        { value: "0", label: "只说“挺好”", score: 0 },
        { value: "1", label: "只指出声音大小", score: 1 },
        { value: "2", label: "只要求背更多模板", score: 1 },
        { value: "3", label: "指出表达是否切题、逻辑是否清楚、发音是否影响理解", score: 3 },
      ],
    },
    {
      id: "language-study-plan",
      prompt: "接下来两周，你更适合哪种语言学习节奏？",
      options: [
        { value: "0", label: "没有固定时间", score: 0 },
        { value: "1", label: "偶尔背单词", score: 1 },
        { value: "2", label: "能按模块练习，但复盘不稳定", score: 2 },
        { value: "3", label: "能固定输入、输出和错题复盘", score: 3 },
      ],
    },
  ];
}

function buildExamAssessmentQuestions(learningDirection: string): AssessmentQuestion[] {
  return [
    {
      id: "exam-syllabus",
      prompt: `【${learningDirection}】备考开始前，最应该先确认什么？`,
      options: [
        { value: "0", label: "先买最多的资料", score: 0 },
        { value: "1", label: "只看经验帖标题", score: 1 },
        { value: "2", label: "直接刷最难题", score: 1 },
        { value: "3", label: "考试大纲、题型分值、时间安排和自己的薄弱模块", score: 3 },
      ],
    },
    {
      id: "exam-error-review",
      prompt: "错题复盘最有效的记录方式是哪一种？",
      options: [
        { value: "0", label: "只把正确答案抄一遍", score: 0 },
        { value: "1", label: "只标记题目难", score: 1 },
        { value: "2", label: "只收藏题目，不再回看", score: 0 },
        { value: "3", label: "记录错因、知识点、解题步骤和下次识别信号", score: 3 },
      ],
    },
    {
      id: "exam-time-management",
      prompt: "模拟考试训练中，最能暴露真实问题的是哪种方式？",
      options: [
        { value: "0", label: "边查答案边做题", score: 0 },
        { value: "1", label: "只做会做的题", score: 1 },
        { value: "2", label: "不限时慢慢做", score: 1 },
        { value: "3", label: "按正式时间完成，并复盘失分和时间分配", score: 3 },
      ],
    },
    {
      id: "exam-knowledge-transfer",
      prompt: "一道题换了表述你就不会做，通常说明什么？",
      options: [
        { value: "0", label: "考试不公平", score: 0 },
        { value: "1", label: "题目一定出错了", score: 0 },
        { value: "2", label: "只需要背更多答案", score: 1 },
        { value: "3", label: "还没有掌握底层知识点和题型识别方法", score: 3 },
      ],
    },
    {
      id: "exam-resource-filter",
      prompt: "选择备考资料时，最可靠的判断标准是什么？",
      options: [
        { value: "0", label: "封面最好看", score: 0 },
        { value: "1", label: "页数最多", score: 0 },
        { value: "2", label: "别人说火就直接买", score: 1 },
        { value: "3", label: "匹配最新大纲、题型和自己的薄弱模块", score: 3 },
      ],
    },
    {
      id: "exam-consistency",
      prompt: "你接下来两周最现实的执行状态是什么？",
      options: [
        { value: "0", label: "很难安排学习时间", score: 0 },
        { value: "1", label: "能零散看资料", score: 1 },
        { value: "2", label: "能按计划刷题，但复盘不足", score: 2 },
        { value: "3", label: "能稳定完成学习、测试和错题复盘", score: 3 },
      ],
    },
  ];
}

function buildGeneralAssessmentQuestions(learningDirection: string): AssessmentQuestion[] {
  return [
    {
      id: "concept",
      prompt: `你对「${learningDirection}」的核心概念熟悉到什么程度？`,
      options: [
        { value: "0", label: "几乎不了解", score: 0 },
        { value: "1", label: "听过一些关键词", score: 1 },
        { value: "2", label: "能解释常见概念", score: 2 },
        { value: "3", label: "能比较系统地讲清楚", score: 3 },
      ],
    },
    {
      id: "practice",
      prompt: "你是否做过相关练习或项目？",
      options: [
        { value: "0", label: "还没有", score: 0 },
        { value: "1", label: "做过零散练习", score: 1 },
        { value: "2", label: "完成过小项目", score: 2 },
        { value: "3", label: "有完整项目经验", score: 3 },
      ],
    },
    {
      id: "resource",
      prompt: "遇到不懂的问题时，你通常能否自己找到合适资料？",
      options: [
        { value: "0", label: "基本不知道去哪找", score: 0 },
        { value: "1", label: "能搜索但筛选困难", score: 1 },
        { value: "2", label: "能找到较可靠资料", score: 2 },
        { value: "3", label: "能高效筛选并交叉验证", score: 3 },
      ],
    },
    {
      id: "output",
      prompt: "你能否把学到的内容整理成清晰输出？",
      options: [
        { value: "0", label: "暂时不太会整理", score: 0 },
        { value: "1", label: "能写简单笔记", score: 1 },
        { value: "2", label: "能输出结构化总结", score: 2 },
        { value: "3", label: "能产出可展示作品", score: 3 },
      ],
    },
    {
      id: "consistency",
      prompt: "接下来两周，你对稳定学习的把握有多大？",
      options: [
        { value: "0", label: "很不确定", score: 0 },
        { value: "1", label: "偶尔能学", score: 1 },
        { value: "2", label: "大多数天可以", score: 2 },
        { value: "3", label: "能稳定执行", score: 3 },
      ],
    },
    {
      id: "confidence",
      prompt: "面对难度上升时，你更接近哪种状态？",
      options: [
        { value: "0", label: "容易停下来", score: 0 },
        { value: "1", label: "需要明确指引", score: 1 },
        { value: "2", label: "能边查边推进", score: 2 },
        { value: "3", label: "能主动拆解问题", score: 3 },
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
