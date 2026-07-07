import { z } from "zod";

export const createNoteSchema = z.object({
  planId: z.string().min(1, "缺少计划 ID。"),
  taskId: z.string().optional(),
  content: z
    .string()
    .trim()
    .min(1, "笔记不能为空。")
    .max(2000, "MVP 阶段单条笔记最多 2000 字。"),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
