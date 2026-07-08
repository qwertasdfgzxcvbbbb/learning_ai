import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

export class PlanRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  create(data: Prisma.LearningPlanCreateInput) {
    return this.db.learningPlan.create({ data });
  }

  findById(id: string) {
    return this.db.learningPlan.findUnique({
      where: { id },
      include: {
        roadmapStages: { orderBy: { sequence: "asc" } },
        dailyTasks: {
          include: {
            stage: {
              select: {
                sequence: true,
                title: true,
              },
            },
          },
          orderBy: { scheduledFor: "asc" },
        },
        resourceRecommendations: {
          include: {
            stage: {
              select: {
                sequence: true,
                title: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        progressLogs: { orderBy: { loggedFor: "desc" } },
        notesRecords: {
          include: {
            task: {
              select: {
                title: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        assessments: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
  }

  listByUser(userId: string) {
    return this.db.learningPlan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}
