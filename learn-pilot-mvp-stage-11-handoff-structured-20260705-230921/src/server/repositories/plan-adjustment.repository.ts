import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

export class PlanAdjustmentRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  create(data: Prisma.PlanAdjustmentCreateInput) {
    return this.db.planAdjustment.create({ data });
  }

  findByReview(reviewId: string) {
    return this.db.planAdjustment.findFirst({
      where: { reviewId },
      orderBy: { createdAt: "desc" },
    });
  }

  listByPlan(planId: string) {
    return this.db.planAdjustment.findMany({
      where: { planId },
      include: { review: true },
      orderBy: { createdAt: "desc" },
    });
  }

  findById(id: string) {
    return this.db.planAdjustment.findUnique({
      where: { id },
      include: {
        plan: {
          include: {
            planVersions: { orderBy: { version: "desc" }, take: 1 },
          },
        },
      },
    });
  }

  async applyToPlan({
    adjustmentId,
    planId,
    planUpdate,
    planVersion,
    afterSnapshot,
  }: {
    adjustmentId: string;
    planId: string;
    planUpdate: Prisma.LearningPlanUpdateInput;
    planVersion: Prisma.PlanVersionCreateWithoutPlanInput;
    afterSnapshot: Prisma.InputJsonValue;
  }) {
    return this.db.$transaction(async (tx) => {
      const plan = await tx.learningPlan.update({
        where: { id: planId },
        data: {
          ...planUpdate,
          planVersions: {
            create: planVersion,
          },
        },
      });

      const adjustment = await tx.planAdjustment.update({
        where: { id: adjustmentId },
        data: {
          status: "applied",
          confirmedAt: new Date(),
          appliedAt: new Date(),
          afterSnapshot,
        },
      });

      return { plan, adjustment };
    });
  }
}
