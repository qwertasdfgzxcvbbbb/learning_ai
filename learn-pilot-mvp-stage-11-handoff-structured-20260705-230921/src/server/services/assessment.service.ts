import type { FoundationLevel } from "@prisma/client";
import { DEMO_USER_ID } from "@/lib/constants";
import { buildAssessmentQuestions } from "@/features/assessment/questions";
import { scoreAssessment } from "@/features/assessment/scoring";
import type { AssessmentQuestion } from "@/features/assessment/types";
import { AssessmentRepository } from "@/server/repositories/assessment.repository";
import { PlanRepository } from "@/server/repositories/plan.repository";

export type AssessmentPageResult =
  | {
      status: "ready";
      plan: {
        id: string;
        title: string;
        learningDirection: string;
        specificGoal: string;
      };
      questions: AssessmentQuestion[];
      latestAssessment:
        | {
            status: string;
            score: number | null;
            resultLevel: FoundationLevel | null;
          }
        | null;
    }
  | { status: "not-found" }
  | { status: "unavailable" };

const planRepository = new PlanRepository();
const assessmentRepository = new AssessmentRepository();

export async function getAssessmentPage(planId: string): Promise<AssessmentPageResult> {
  try {
    const plan = await planRepository.findById(planId);

    if (!plan || plan.userId !== DEMO_USER_ID) {
      return { status: "not-found" };
    }

    const latestAssessment = await assessmentRepository.findLatestByPlan(plan.id);

    return {
      status: "ready",
      plan: {
        id: plan.id,
        title: plan.title,
        learningDirection: plan.learningDirection,
        specificGoal: plan.specificGoal,
      },
      questions: buildAssessmentQuestions(plan.learningDirection),
      latestAssessment: latestAssessment
        ? {
            status: latestAssessment.status,
            score: latestAssessment.score,
            resultLevel: latestAssessment.resultLevel,
          }
        : null,
    };
  } catch {
    return { status: "unavailable" };
  }
}

export async function completeAssessment({
  planId,
  selfLevel,
  answers,
}: {
  planId: string;
  selfLevel: FoundationLevel;
  answers: Record<string, string>;
}) {
  const plan = await planRepository.findById(planId);

  if (!plan || plan.userId !== DEMO_USER_ID) {
    throw new Error("Plan not found.");
  }

  const questions = buildAssessmentQuestions(plan.learningDirection);
  const missingQuestion = questions.find((question) => !answers[question.id]);

  if (missingQuestion) {
    throw new Error("Assessment answers are incomplete.");
  }

  const result = scoreAssessment(questions, answers, selfLevel);

  return assessmentRepository.createCompleted({
    planId: plan.id,
    selfLevel,
    generatedQuestions: questions,
    answers: { selfLevel, answers },
    score: result.score,
    resultLevel: result.resultLevel,
    strengths: result.strengths,
    weaknesses: result.weaknesses,
    confidenceNote: result.confidenceNote,
  });
}

export async function skipAssessment(planId: string) {
  const plan = await planRepository.findById(planId);

  if (!plan || plan.userId !== DEMO_USER_ID) {
    throw new Error("Plan not found.");
  }

  return assessmentRepository.createSkipped({
    planId: plan.id,
    generatedQuestions: buildAssessmentQuestions(plan.learningDirection),
  });
}
