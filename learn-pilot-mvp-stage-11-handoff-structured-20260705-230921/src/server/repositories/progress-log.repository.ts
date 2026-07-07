import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

export class ProgressLogRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  create(data: Prisma.ProgressLogCreateInput) {
    return this.db.progressLog.create({ data });
  }

  findByTaskAndType(taskId: string, type: Prisma.ProgressLogWhereInput["type"]) {
    return this.db.progressLog.findFirst({
      where: {
        taskId,
        type,
      },
    });
  }

  listByPlan(planId: string) {
    return this.db.progressLog.findMany({
      where: { planId },
      orderBy: { loggedFor: "desc" },
    });
  }
}
