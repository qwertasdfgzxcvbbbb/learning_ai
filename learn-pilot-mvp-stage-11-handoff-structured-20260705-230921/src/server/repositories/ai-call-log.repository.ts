import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

export class AiCallLogRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  create(data: Prisma.AiCallLogCreateInput) {
    return this.db.aiCallLog.create({ data });
  }
}
