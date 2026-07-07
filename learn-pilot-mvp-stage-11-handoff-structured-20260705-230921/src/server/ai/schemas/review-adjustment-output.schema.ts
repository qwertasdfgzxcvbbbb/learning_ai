import { z } from "zod";

export const reviewAdjustmentChangesSchema = z.object({
  planNote: z.string().min(10).max(1000),
  dailyMinutesDelta: z.number().int().min(-30).max(30),
  taskStrategy: z.string().min(10).max(500),
  nextReviewFocus: z.array(z.string().min(2).max(80)).min(1).max(4),
});

export const reviewAdjustmentOutputSchema = z.object({
  status: z.literal("pending"),
  title: z.string().min(4).max(80),
  reason: z.string().min(10).max(500),
  impactScope: z.string().min(4).max(120),
  proposedChanges: reviewAdjustmentChangesSchema,
});

export type ReviewAdjustmentChanges = z.infer<typeof reviewAdjustmentChangesSchema>;
export type ReviewAdjustmentOutput = z.infer<typeof reviewAdjustmentOutputSchema>;
