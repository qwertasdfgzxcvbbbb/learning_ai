import type { Prisma, PrismaClient, ResourceStatus } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

export class ResourceRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  createMany(data: Prisma.ResourceRecommendationCreateManyInput[]) {
    return this.db.resourceRecommendation.createMany({ data });
  }

  listByPlan(planId: string) {
    return this.db.resourceRecommendation.findMany({
      where: { planId },
      include: {
        stage: {
          select: {
            sequence: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  findById(id: string) {
    return this.db.resourceRecommendation.findUnique({
      where: { id },
      include: {
        plan: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });
  }

  updateStatus(id: string, status: ResourceStatus) {
    return this.db.resourceRecommendation.update({
      where: { id },
      data: { status },
    });
  }
}
