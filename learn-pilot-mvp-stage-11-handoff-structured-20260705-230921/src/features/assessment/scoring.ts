import type { AssessmentQuestion } from "@/features/assessment/types";

export type AssessmentFoundationLevel = "zero" | "beginner" | "intermediate" | "advanced";

export type AssessmentScoreResult = {
  score: number;
  resultLevel: AssessmentFoundationLevel;
  strengths: string[];
  weaknesses: string[];
  confidenceNote: string;
};

export function scoreAssessment(
  questions: AssessmentQuestion[],
  answers: Record<string, string>,
  selfLevel: AssessmentFoundationLevel,
): AssessmentScoreResult {
  const maxScore = questions.reduce((sum, question) => {
    return sum + Math.max(...question.options.map((option) => option.score));
  }, 0);
  const rawScore = questions.reduce((sum, question) => {
    const selected = question.options.find((option) => option.value === answers[question.id]);
    return sum + (selected?.score ?? 0);
  }, 0);
  const selfLevelBonus = selfLevelScore[selfLevel];
  const score = Math.round(((rawScore + selfLevelBonus) / (maxScore + 3)) * 100);
  const resultLevel = resolveResultLevel(score);

  return {
    score,
    resultLevel,
    strengths: buildStrengths(score),
    weaknesses: buildWeaknesses(score),
    confidenceNote: buildConfidenceNote(resultLevel),
  };
}

export function resolveResultLevel(score: number): AssessmentFoundationLevel {
  if (score >= 78) return "advanced";
  if (score >= 52) return "intermediate";
  if (score >= 24) return "beginner";
  return "zero";
}

const selfLevelScore: Record<AssessmentFoundationLevel, number> = {
  zero: 0,
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

function buildStrengths(score: number) {
  if (score >= 78) return ["已有较强基础", "具备主动拆解问题的能力"];
  if (score >= 52) return ["有一定概念基础", "可以开始做结构化输出"];
  if (score >= 24) return ["具备入门意愿", "适合从小任务开始积累信心"];
  return ["适合从低压力任务开始", "需要更清晰的步骤和示例"];
}

function buildWeaknesses(score: number) {
  if (score >= 78) return ["需要避免目标过散", "需要持续产出作品"];
  if (score >= 52) return ["实践经验可能不足", "需要建立稳定学习节奏"];
  if (score >= 24) return ["概念理解还不稳定", "需要更多示例和练习"];
  return ["基础概念较薄弱", "需要先建立学习路径和资料筛选能力"];
}

function buildConfidenceNote(level: AssessmentFoundationLevel) {
  const notes: Record<AssessmentFoundationLevel, string> = {
    zero: "建议按零基础节奏开始，先降低挫败感。",
    beginner: "建议从保守入门路线开始，逐步增加实践任务。",
    intermediate: "可以安排更多输出和项目练习。",
    advanced: "可以跳过部分基础内容，把重点放在作品和复盘。",
  };

  return notes[level];
}
