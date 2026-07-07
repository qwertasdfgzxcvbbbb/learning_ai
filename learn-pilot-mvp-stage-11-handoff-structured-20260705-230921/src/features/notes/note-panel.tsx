"use client";

import { useActionState } from "react";
import { FileText, StickyNote } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createNoteAction, type NoteActionState } from "@/features/notes/actions";
import type { NoteView, TaskView } from "@/server/services/dashboard.service";

type NotePanelProps = {
  planId: string;
  tasks: TaskView[];
  notes: NoteView[];
};

const initialState: NoteActionState = {
  status: "idle",
};

export function NotePanel({ planId, tasks, notes }: NotePanelProps) {
  const [state, formAction, pending] = useActionState(createNoteAction, initialState);

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">学习笔记</h2>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-primary" aria-hidden="true" />
            记录原文笔记
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-3">
            <input type="hidden" name="planId" value={planId} />
            {tasks.length > 0 ? (
              <label className="block space-y-1.5 text-sm font-medium">
                关联任务
                <select
                  name="taskId"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  defaultValue=""
                >
                  <option value="">不关联具体任务</option>
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="block space-y-1.5 text-sm font-medium">
              笔记内容
              <textarea
                name="content"
                rows={4}
                className="min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm leading-6"
                placeholder="写下今天的理解、卡点或待查问题。"
                aria-describedby="note-content-help"
              />
            </label>
            <p id="note-content-help" className="text-xs leading-5 text-muted-foreground">
              MVP 只保存你的原文，不做 AI 摘要或改写。
            </p>
            {state.message ? (
              <p
                className={
                  state.status === "success"
                    ? "rounded-md bg-primary/10 px-3 py-2 text-xs leading-5 text-primary"
                    : "rounded-md bg-destructive/10 px-3 py-2 text-xs leading-5 text-destructive"
                }
              >
                {state.message}
              </p>
            ) : null}
            {state.fieldErrors?.content?.[0] ? (
              <p className="text-xs text-destructive">{state.fieldErrors.content[0]}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={pending}>
              <FileText className="h-4 w-4" aria-hidden="true" />
              {pending ? "保存中" : "保存笔记"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <NoteList notes={notes} />
    </section>
  );
}

function NoteList({ notes }: { notes: NoteView[] }) {
  if (notes.length === 0) {
    return <EmptyState title="还没有笔记" description="保存第一条原文笔记后，会在这里按时间倒序显示。" />;
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <Card key={note.id}>
          <CardContent className="space-y-2 pt-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{note.createdAt}</span>
              {note.taskTitle ? <span>关联任务：{note.taskTitle}</span> : null}
            </div>
            <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{note.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
