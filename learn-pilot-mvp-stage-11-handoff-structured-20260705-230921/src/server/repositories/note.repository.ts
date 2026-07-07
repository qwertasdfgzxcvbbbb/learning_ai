import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

export class NoteRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  create(data: Prisma.NoteCreateInput) {
    return this.db.note.create({ data });
  }

  listByPlan(planId: string) {
    return this.db.note.findMany({
      where: { planId },
      include: {
        task: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
