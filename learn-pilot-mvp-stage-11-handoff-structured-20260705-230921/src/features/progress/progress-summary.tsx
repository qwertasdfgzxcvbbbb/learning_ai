import { Flame, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlanCardView } from "@/server/services/dashboard.service";

type ProgressSummaryProps = {
  plan: PlanCardView;
};

export function ProgressSummary({ plan }: ProgressSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
          进度概览
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <Metric label="今日完成" value={`${plan.todayCompletionRate}%`} />
          <Metric label="计划进度" value={`${plan.completionRate}%`} />
          <Metric label="连续学习" value={`${plan.streakDays} 天`} />
        </div>

        <div className="space-y-3">
          <ProgressBar
            label="今天"
            value={plan.todayCompletionRate}
            detail={`${plan.todayCompletedTasks}/${plan.todayTotalTasks} 个任务`}
          />
          <ProgressBar
            label="全部"
            value={plan.completionRate}
            detail={`${plan.completedTasks}/${plan.totalTasks} 个任务`}
          />
        </div>

        <div className="flex items-start gap-2 rounded-md bg-secondary/10 px-3 py-2 text-xs leading-5 text-muted-foreground">
          <Flame className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
          <span>
            {plan.canCheckIn
              ? "今天已有核心任务完成，可以算作一次有效学习。"
              : "完成任意核心任务后，今天会计入连续学习天数。"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted px-2 py-3">
      <div className="text-lg font-semibold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function ProgressBar({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{detail}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
