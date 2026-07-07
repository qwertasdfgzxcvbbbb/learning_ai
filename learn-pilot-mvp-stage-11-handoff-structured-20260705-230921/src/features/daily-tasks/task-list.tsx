import { CheckCircle2, Clock3, FastForward, PauseCircle, PlayCircle, RotateCcw } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateTaskStatusAction } from "@/features/daily-tasks/actions";
import type { DailyTaskStatus } from "@/features/daily-tasks/status";
import type { TaskView } from "@/server/services/dashboard.service";

type TaskListProps = {
  title: string;
  tasks: TaskView[];
};

export function TaskList({ title, tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title="今天还没有任务"
        description="生成路线图后，这里会展示当天要完成的学习任务。"
      />
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">{title}</h2>
      {tasks.map((task) => (
        <Card key={task.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="line-clamp-2">{task.title}</CardTitle>
              <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                {task.statusLabel}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {task.description ? (
              <p className="text-sm leading-6 text-muted-foreground">{task.description}</p>
            ) : null}
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                {task.estimatedMinutes} 分钟
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                {task.taskTypeLabel}
              </span>
            </div>
            <p className="rounded-md bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground">
              完成标准：{task.completionCriteria}
            </p>
            <TaskActions task={task} />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function TaskActions({ task }: { task: TaskView }) {
  const actions = getTaskActions(task.status as DailyTaskStatus);

  if (actions.length === 0) {
    return (
      <div className="rounded-md bg-primary/10 px-3 py-2 text-xs leading-5 text-primary">
        任务已结束，不会重复记录进度。
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map((action) => (
        <form key={action.status} action={updateTaskStatusAction}>
          <input type="hidden" name="taskId" value={task.id} />
          <input type="hidden" name="nextStatus" value={action.status} />
          <Button type="submit" variant={action.variant} size="sm" className="w-full">
            <action.icon className="h-4 w-4" aria-hidden="true" />
            {action.label}
          </Button>
        </form>
      ))}
    </div>
  );
}

function getTaskActions(status: DailyTaskStatus) {
  if (status === "done" || status === "skipped") {
    return [];
  }

  if (status === "delayed") {
    return [
      { status: "todo", label: "重新安排", icon: RotateCcw, variant: "outline" as const },
      { status: "done", label: "完成", icon: CheckCircle2, variant: "default" as const },
    ];
  }

  if (status === "in_progress") {
    return [
      { status: "done", label: "完成", icon: CheckCircle2, variant: "default" as const },
      { status: "delayed", label: "延期", icon: PauseCircle, variant: "outline" as const },
      { status: "skipped", label: "跳过", icon: FastForward, variant: "outline" as const },
    ];
  }

  return [
    { status: "in_progress", label: "开始", icon: PlayCircle, variant: "outline" as const },
    { status: "done", label: "完成", icon: CheckCircle2, variant: "default" as const },
    { status: "delayed", label: "延期", icon: PauseCircle, variant: "outline" as const },
    { status: "skipped", label: "跳过", icon: FastForward, variant: "outline" as const },
  ];
}
