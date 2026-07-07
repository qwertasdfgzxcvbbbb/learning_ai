import { createNoteSchema, type CreateNoteInput } from "@/features/notes/schema";
import { DEMO_USER_ID } from "@/lib/constants";
import { NoteRepository } from "@/server/repositories/note.repository";
import { PlanRepository } from "@/server/repositories/plan.repository";
import { TaskRepository } from "@/server/repositories/task.repository";

type NoteCreateRepository = {
  create(data: Parameters<NoteRepository["create"]>[0]): Promise<unknown>;
};

type PlanLookupRepository = {
  findById(id: string): Promise<{ id: string; userId: string } | null>;
};

type TaskLookupRepository = {
  findById(id: string): Promise<{ id: string; planId: string } | null>;
};

export type CreateNoteResult =
  | { status: "created"; planId: string }
  | { status: "invalid"; fieldErrors: Record<string, string[]> }
  | { status: "not-found" };

const noteRepository = new NoteRepository();
const planRepository = new PlanRepository();
const taskRepository = new TaskRepository();

export async function createPlainTextNote(
  input: CreateNoteInput,
  repositories: {
    notes?: NoteCreateRepository;
    plans?: PlanLookupRepository;
    tasks?: TaskLookupRepository;
  } = {},
): Promise<CreateNoteResult> {
  const parsed = createNoteSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "invalid",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const planRepo = repositories.plans ?? planRepository;
  const noteRepo = repositories.notes ?? noteRepository;
  const taskRepo = repositories.tasks ?? taskRepository;
  const plan = await planRepo.findById(parsed.data.planId);

  if (!plan || plan.userId !== DEMO_USER_ID) {
    return { status: "not-found" };
  }

  if (parsed.data.taskId) {
    const task = await taskRepo.findById(parsed.data.taskId);

    if (!task || task.planId !== parsed.data.planId) {
      return { status: "not-found" };
    }
  }

  await noteRepo.create({
    plan: { connect: { id: parsed.data.planId } },
    task: parsed.data.taskId ? { connect: { id: parsed.data.taskId } } : undefined,
    content: parsed.data.content,
  });

  return { status: "created", planId: parsed.data.planId };
}
