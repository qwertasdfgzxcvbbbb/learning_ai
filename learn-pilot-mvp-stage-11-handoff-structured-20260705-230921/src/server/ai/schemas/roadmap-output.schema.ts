import { z } from "zod";

export const roadmapStageOutputSchema = z.object({
  title: z.string().min(2),
  sequence: z.number().int().min(1),
  goal: z.string().min(8),
  contentOutline: z.string().min(8),
  expectedOutcome: z.string().min(4),
  acceptanceCriteria: z.string().min(4),
  durationDays: z.number().int().min(1).max(30),
});

export const roadmapTaskOutputSchema = z.object({
  stageSequence: z.number().int().min(1),
  dayOffset: z.number().int().min(0).max(14),
  title: z.string().min(2),
  description: z.string().min(4),
  taskType: z.enum([
    "reading",
    "watching",
    "practice",
    "output",
    "test",
    "review",
    "resource_organization",
    "project",
  ]),
  difficulty: z.enum(["easy", "medium", "challenging"]),
  estimatedMinutes: z.number().int().min(10).max(240),
  completionCriteria: z.string().min(4),
  isCore: z.boolean(),
});

export const roadmapResourceOutputSchema = z.object({
  stageSequence: z.number().int().min(1),
  title: z.string().min(2),
  resourceType: z.enum([
    "video_course",
    "book",
    "article",
    "paper",
    "case_study",
    "official_doc",
    "open_source",
    "exercise",
    "tool_guide",
    "website",
  ]),
  url: z.string().url().optional(),
  sourceName: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "challenging"]),
  estimatedMinutes: z.number().int().min(5).max(600).optional(),
  recommendationReason: z.string().min(6),
  verificationNote: z.string().min(6),
});

export const roadmapOutputSchema = z.object({
  overview: z.string().min(10),
  stages: z.array(roadmapStageOutputSchema).min(2).max(4),
  tasks: z.array(roadmapTaskOutputSchema).min(2).max(12),
  resources: z.array(roadmapResourceOutputSchema).min(2).max(6),
});

export type RoadmapOutput = z.infer<typeof roadmapOutputSchema>;
