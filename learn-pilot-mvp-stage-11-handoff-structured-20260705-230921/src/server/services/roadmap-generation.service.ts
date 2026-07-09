import { Prisma } from "@prisma/client";
import { DEMO_USER_ID } from "@/lib/constants";
import { generateMockRoadmap } from "@/server/ai/tasks/generate-roadmap";
import { prisma } from "@/server/db/prisma";
import { PlanRepository } from "@/server/repositories/plan.repository";

const planRepository = new PlanRepository();

export type RoadmapGenerationResult =
  | { status: "generated"; planId: string }
  | { status: "regenerated"; planId: string }
  | { status: "already-exists"; planId: string }
  | { status: "assessment-required"; planId: string }
  | { status: "not-found" };

type GenerateRoadmapOptions = {
  force?: boolean;
};

export async function generateRoadmapForPlan(
  planId: string,
  options: GenerateRoadmapOptions = {},
): Promise<RoadmapGenerationResult> {
  const plan = await planRepository.findById(planId);

  if (!plan || plan.userId !== DEMO_USER_ID) {
    return { status: "not-found" };
  }

  if (plan.roadmapStages.length > 0 && !options.force) {
    return { status: "already-exists", planId: plan.id };
  }

  const latestAssessment = plan.assessments[0] ?? null;

  if (!latestAssessment) {
    return { status: "assessment-required", planId: plan.id };
  }

  const generated = generateMockRoadmap({
    plan,
    assessment: latestAssessment,
  });

  await prisma.$transaction(async (tx) => {
    if (options.force) {
      await tx.resourceRecommendation.deleteMany({ where: { planId: plan.id } });
      await tx.dailyTask.deleteMany({ where: { planId: plan.id } });
      await tx.roadmapStage.deleteMany({ where: { planId: plan.id } });
    }

    const createdStages = await Promise.all(
      generated.output.stages.map((stage) => {
        const startsOn = addDays(
          plan.startsOn ?? new Date(),
          getStageStartOffset(generated.output.stages, stage.sequence),
        );
        const endsOn = addDays(startsOn, stage.durationDays - 1);

        return tx.roadmapStage.create({
          data: {
            planId: plan.id,
            title: stage.title,
            sequence: stage.sequence,
            status: stage.sequence === 1 ? "active" : "planned",
            startsOn,
            endsOn,
            goal: stage.goal,
            contentOutline: stage.contentOutline,
            expectedOutcome: stage.expectedOutcome,
            acceptanceCriteria: stage.acceptanceCriteria,
            sequenceRationale: stage.sequenceRationale,
            sourceReferences: toJson(stage.sourceReferences),
            aiGenerated: true,
            sourcePromptVersion: generated.promptVersion,
          },
        });
      }),
    );

    const stageIdBySequence = new Map(createdStages.map((stage) => [stage.sequence, stage.id]));

    await tx.dailyTask.createMany({
      data: generated.output.tasks.map((task) => ({
        planId: plan.id,
        stageId: stageIdBySequence.get(task.stageSequence),
        title: task.title,
        description: task.description,
        taskType: task.taskType,
        status: "todo",
        difficulty: task.difficulty,
        scheduledFor: addDays(plan.startsOn ?? new Date(), task.dayOffset),
        estimatedMinutes: task.estimatedMinutes,
        completionCriteria: task.completionCriteria,
        isCore: task.isCore,
      })),
    });

    await tx.resourceRecommendation.createMany({
      data: generated.output.resources.map((resource) => ({
        planId: plan.id,
        stageId: stageIdBySequence.get(resource.stageSequence),
        title: resource.title,
        resourceType: resource.resourceType,
        url: resource.url,
        sourceName: resource.sourceName,
        difficulty: resource.difficulty,
        estimatedMinutes: resource.estimatedMinutes,
        recommendationReason: resource.recommendationReason,
        verificationNote: resource.verificationNote,
        matchedPreferences: resource.matchedPreferences,
        requiresVerification: true,
        aiGenerated: true,
      })),
    });

    await tx.aiCallLog.create({
      data: {
        userId: DEMO_USER_ID,
        planId: plan.id,
        taskType: "generate_roadmap",
        status: "mocked",
        provider: "mock",
        model: "mock",
        promptVersion: generated.promptVersion,
        input: toJson({
          plan: {
            title: plan.title,
            learningDirection: plan.learningDirection,
            specificGoal: plan.specificGoal,
            durationDays: plan.durationDays,
            dailyMinutes: plan.dailyMinutes,
          },
          assessment: {
            status: latestAssessment.status,
            score: latestAssessment.score,
            resultLevel: latestAssessment.resultLevel,
          },
        }),
        output: toJson(generated.output),
      },
    });

    await tx.learningPlan.update({
      where: { id: plan.id },
      data: {
        status: "active",
        aiGenerated: true,
        sourcePromptVersion: generated.promptVersion,
      },
    });
  });

  return { status: options.force ? "regenerated" : "generated", planId: plan.id };
}

function getStageStartOffset(
  stages: { sequence: number; durationDays: number }[],
  sequence: number,
) {
  return stages
    .filter((stage) => stage.sequence < sequence)
    .reduce((sum, stage) => sum + stage.durationDays, 0);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
