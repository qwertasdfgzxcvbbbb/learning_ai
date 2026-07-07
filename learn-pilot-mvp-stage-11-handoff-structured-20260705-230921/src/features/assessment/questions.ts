import type { AssessmentQuestion } from "@/features/assessment/types";

export function buildAssessmentQuestions(learningDirection: string): AssessmentQuestion[] {
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
