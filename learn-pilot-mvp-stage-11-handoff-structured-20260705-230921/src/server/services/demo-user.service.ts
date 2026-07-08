import { DEMO_USER_ID, DEFAULT_TIME_ZONE } from "@/lib/constants";
import { prisma } from "@/server/db/prisma";

export async function ensureDemoUser() {
  return prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    create: {
      id: DEMO_USER_ID,
      name: "演示用户",
      email: "demo@example.local",
      isDemo: true,
      timezone: DEFAULT_TIME_ZONE,
    },
    update: {
      isDemo: true,
      timezone: DEFAULT_TIME_ZONE,
    },
  });
}
