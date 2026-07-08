import { describe, expect, it } from "vitest";
import { buildAssessmentQuestions } from "@/features/assessment/questions";
import { resolveResultLevel, scoreAssessment } from "@/features/assessment/scoring";

describe("resolveResultLevel", () => {
  it("maps scores to conservative foundation levels", () => {
    expect(resolveResultLevel(10)).toBe("zero");
    expect(resolveResultLevel(30)).toBe("beginner");
    expect(resolveResultLevel(60)).toBe("intermediate");
    expect(resolveResultLevel(90)).toBe("advanced");
  });
});

describe("scoreAssessment", () => {
  it("returns advanced for consistently strong answers", () => {
    const questions = buildAssessmentQuestions("AI 产品经理");
    const answers = Object.fromEntries(questions.map((question) => [question.id, "3"]));

    expect(scoreAssessment(questions, answers, "advanced").resultLevel).toBe("advanced");
  });

  it("returns zero for weak answers and zero self level", () => {
    const questions = buildAssessmentQuestions("AI 产品经理");
    const answers = Object.fromEntries(questions.map((question) => [question.id, "0"]));
    const result = scoreAssessment(questions, answers, "zero");

    expect(result.resultLevel).toBe("zero");
    expect(result.score).toBe(0);
  });

  it("uses self level as a small bonus, not the whole result", () => {
    const questions = buildAssessmentQuestions("AI 产品经理");
    const answers = Object.fromEntries(questions.map((question) => [question.id, "1"]));
    const result = scoreAssessment(questions, answers, "advanced");

    expect(result.resultLevel).toBe("beginner");
  });
});

describe("buildAssessmentQuestions", () => {
  it("uses AI-specific questions for AI learning goals", () => {
    const questions = buildAssessmentQuestions({
      learningDirection: "AI 产品经理",
      specificGoal: "学习 RAG 和 LLM 应用设计",
      goalType: "job_project",
    });
    const prompts = questions.map((question) => question.prompt).join("\n");

    expect(prompts).toContain("LLM");
    expect(prompts).toContain("RAG");
  });

  it("uses a different profile for programming goals", () => {
    const aiQuestions = buildAssessmentQuestions("AI 产品经理");
    const programmingQuestions = buildAssessmentQuestions("TypeScript 前端开发");

    expect(programmingQuestions[0]?.id).not.toBe(aiQuestions[0]?.id);
    expect(programmingQuestions.map((question) => question.prompt).join("\n")).toContain("500");
  });
});
