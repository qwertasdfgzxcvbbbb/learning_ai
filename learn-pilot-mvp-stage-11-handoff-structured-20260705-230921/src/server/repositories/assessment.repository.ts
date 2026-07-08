import type { AssessmentStatus, FoundationLevel, Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

export class AssessmentRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  create(data: Prisma.AssessmentCreateInput) {
    return this.db.assessment.create({ data });
  }

  findLatestByPlan(planId: string) {
    return this.db.assessment.findFirst({
      where: { planId },
      orderBy: { createdAt: "desc" },
    });
  }

  findLatestGeneratedByPlan(planId: string) {
    return this.db.assessment.findFirst({
      where: { planId, status: "generated" },
      orderBy: { createdAt: "desc" },
    });
  }

  createGenerated({
    planId,
    generatedQuestions,
  }: {
    planId: string;
    generatedQuestions: Prisma.InputJsonValue;
  }) {
    return this.create({
      plan: { connect: { id: planId } },
      status: "generated" satisfies AssessmentStatus,
      generatedQuestions,
      strengths: [],
      weaknesses: [],
    });
  }

  completeGenerated({
    assessmentId,
    selfLevel,
    answers,
    score,
    resultLevel,
    strengths,
    weaknesses,
    confidenceNote,
  }: {
    assessmentId: string;
    selfLevel: FoundationLevel;
    answers: Prisma.InputJsonValue;
    score: number;
    resultLevel: FoundationLevel;
    strengths: string[];
    weaknesses: string[];
    confidenceNote: string;
  }) {
    return this.db.assessment.update({
      where: { id: assessmentId },
      data: {
        status: "completed" satisfies AssessmentStatus,
        selfLevel,
        answers,
        score,
        resultLevel,
        strengths,
        weaknesses,
        confidenceNote,
        completedAt: new Date(),
      },
    });
  }

  createCompleted({
    planId,
    selfLevel,
    generatedQuestions,
    answers,
    score,
    resultLevel,
    strengths,
    weaknesses,
    confidenceNote,
  }: {
    planId: string;
    selfLevel: FoundationLevel;
    generatedQuestions: Prisma.InputJsonValue;
    answers: Prisma.InputJsonValue;
    score: number;
    resultLevel: FoundationLevel;
    strengths: string[];
    weaknesses: string[];
    confidenceNote: string;
  }) {
    return this.create({
      plan: { connect: { id: planId } },
      status: "completed",
      selfLevel,
      generatedQuestions,
      answers,
      score,
      resultLevel,
      strengths,
      weaknesses,
      confidenceNote,
      completedAt: new Date(),
    });
  }

  createSkipped({
    planId,
    generatedQuestions,
    resultLevel = "beginner",
  }: {
    planId: string;
    generatedQuestions: Prisma.InputJsonValue;
    resultLevel?: FoundationLevel;
  }) {
    return this.create({
      plan: { connect: { id: planId } },
      status: "skipped" satisfies AssessmentStatus,
      selfLevel: resultLevel,
      generatedQuestions,
      answers: { skipped: true },
      score: 24,
      resultLevel,
      strengths: ["先按保守入门节奏开始"],
      weaknesses: ["缺少测评答案，后续计划需要留出更多基础巩固时间"],
      confidenceNote: "用户跳过测评，MVP 默认按初级偏保守处理。",
      completedAt: new Date(),
    });
  }
}
