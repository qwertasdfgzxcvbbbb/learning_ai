"use server";

import { revalidatePath } from "next/cache";
import { createPlainTextNote } from "@/server/services/note.service";

export type NoteActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createNoteAction(
  _previousState: NoteActionState,
  formData: FormData,
): Promise<NoteActionState> {
  const planId = String(formData.get("planId") ?? "");
  const taskIdValue = String(formData.get("taskId") ?? "");
  const content = String(formData.get("content") ?? "");

  const result = await createPlainTextNote({
    planId,
    taskId: taskIdValue || undefined,
    content,
  });

  if (result.status === "invalid") {
    return {
      status: "error",
      message: "笔记还不能保存，请检查内容。",
      fieldErrors: result.fieldErrors,
    };
  }

  if (result.status === "not-found") {
    return {
      status: "error",
      message: "没有找到可记录笔记的计划或任务。",
    };
  }

  revalidatePath(`/plans/${result.planId}`);

  return {
    status: "success",
    message: "笔记已保存。",
  };
}
