import type { Prisma, PrismaClient, TaskStatus } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

export class TaskRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  createMany(data: Prisma.DailyTaskCreateManyInput[]) {
    return this.db.dailyTask.createMany({ data });
  }

  findById(id: string) {
    return this.db.dailyTask.findUnique({
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

  listByPlanAndDate(planId: string, scheduledFor: Date) {
    const start = new Date(scheduledFor);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return this.db.dailyTask.findMany({
      where: {
        planId,
        scheduledFor: {
          gte: start,
          lt: end,
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  listByPlanInRange(planId: string, start: Date, end: Date) {
    return this.db.dailyTask.findMany({
      where: {
        planId,
        scheduledFor: {
          gte: start,
          lt: end,
        },
      },
      orderBy: [{ scheduledFor: "asc" }, { createdAt: "asc" }],
    });
  }

  updateStatus(id: string, status: TaskStatus, completedAt?: Date | null) {
    return this.db.dailyTask.update({
      where: { id },
      data: { status, completedAt },
    });
  }
}
