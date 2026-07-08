import type { FoundationLevel } from "@prisma/client";
import { DEMO_USER_ID } from "@/lib/constants";
import { buildAssessmentQuestions, parseAssessmentQuestions } from "@/features/assessment/questions";
import { scoreAssessment } from "@/features/assessment/scoring";
import type { AssessmentQuestion } from "@/features/assessment/types";
import { generateAssessmentQuestions } from "@/server/ai/tasks/generate-assessment";
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
    const questions = await getOrCreateAssessmentQuestions(plan);

    return {
      status: "ready",
      plan: {
        id: plan.id,
        title: plan.title,
        learningDirection: plan.learningDirection,
        specificGoal: plan.specificGoal,
      },
      questions,
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

  const generatedAssessment = await assessmentRepository.findLatestGeneratedByPlan(plan.id);
  const generatedQuestions = parseAssessmentQuestions(generatedAssessment?.generatedQuestions);
  const canReuseGeneratedQuestions = Boolean(
    generatedAssessment &&
      generatedQuestions &&
      isReusableGeneratedQuestionSet(plan, generatedQuestions),
  );
  const questions =
    canReuseGeneratedQuestions && generatedQuestions
      ? generatedQuestions
      : (await generateAssessmentQuestions({
          plan: {
            title: plan.title,
            learningDirection: plan.learningDirection,
            specificGoal: plan.specificGoal,
            goalType: plan.goalType,
            durationDays: plan.durationDays,
            dailyMinutes: plan.dailyMinutes,
            preferredResources: plan.preferredResources,
            targetOutcome: plan.targetOutcome,
          },
        })).questions;
  const missingQuestion = questions.find((question) => !answers[question.id]);

  if (missingQuestion) {
    throw new Error("Assessment answers are incomplete.");
  }

  const result = scoreAssessment(questions, answers, selfLevel);

  if (canReuseGeneratedQuestions && generatedAssessment) {
    return assessmentRepository.completeGenerated({
      assessmentId: generatedAssessment.id,
      selfLevel,
      answers: { selfLevel, answers },
      score: result.score,
      resultLevel: result.resultLevel,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      confidenceNote: result.confidenceNote,
    });
  }

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

  const generatedAssessment = await assessmentRepository.findLatestGeneratedByPlan(plan.id);
  const generatedQuestions = parseAssessmentQuestions(generatedAssessment?.generatedQuestions);
  const canReuseGeneratedQuestions = Boolean(
    generatedQuestions && isReusableGeneratedQuestionSet(plan, generatedQuestions),
  );
  const questions =
    canReuseGeneratedQuestions && generatedQuestions
      ? generatedQuestions
      : buildAssessmentQuestions({
          learningDirection: plan.learningDirection,
          specificGoal: plan.specificGoal,
          goalType: plan.goalType,
        });

  return assessmentRepository.createSkipped({
    planId: plan.id,
    generatedQuestions: questions,
  });
}

async function getOrCreateAssessmentQuestions(
  plan: NonNullable<Awaited<ReturnType<PlanRepository["findById"]>>>,
) {
  const generatedAssessment = await assessmentRepository.findLatestGeneratedByPlan(plan.id);
  const existingQuestions = parseAssessmentQuestions(generatedAssessment?.generatedQuestions);

  if (existingQuestions && isReusableGeneratedQuestionSet(plan, existingQuestions)) {
    return existingQuestions;
  }

  const result = await generateAssessmentQuestions({
    plan: {
      title: plan.title,
      learningDirection: plan.learningDirection,
      specificGoal: plan.specificGoal,
      goalType: plan.goalType,
      durationDays: plan.durationDays,
      dailyMinutes: plan.dailyMinutes,
      preferredResources: plan.preferredResources,
      targetOutcome: plan.targetOutcome,
    },
  });

  await assessmentRepository.createGenerated({
    planId: plan.id,
    generatedQuestions: result.questions,
  });

  return result.questions;
}

function isReusableGeneratedQuestionSet(
  plan: NonNullable<Awaited<ReturnType<PlanRepository["findById"]>>>,
  questions: AssessmentQuestion[],
) {
  const legacyGenericIds = new Set([
    "concept",
    "practice",
    "resource",
    "output",
    "consistency",
    "confidence",
  ]);
  const isLegacyGeneric = questions.every((question) => legacyGenericIds.has(question.id));

  if (!isLegacyGeneric) {
    return true;
  }

  const currentLocalIds = new Set(
    buildAssessmentQuestions({
      learningDirection: plan.learningDirection,
      specificGoal: plan.specificGoal,
      goalType: plan.goalType,
    }).map((question) => question.id),
  );

  return questions.every((question) => currentLocalIds.has(question.id));
}
