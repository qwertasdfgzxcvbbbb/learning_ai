import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

export class ReviewRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  create(data: Prisma.ReviewCreateInput) {
    return this.db.review.create({ data });
  }

  listByPlan(planId: string) {
    return this.db.review.findMany({
      where: { planId },
      orderBy: [{ periodStart: "desc" }, { createdAt: "desc" }],
    });
  }
}
