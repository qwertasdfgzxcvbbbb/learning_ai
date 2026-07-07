import Link from "next/link";
import { CalendarDays, Clock3, Layers3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlanCardView } from "@/server/services/dashboard.service";

type PlanCardProps = {
  plan: PlanCardView;
};

export function PlanCard({ plan }: PlanCardProps) {
  return (
    <Link href={`/plans/${plan.id}`} className="block">
      <Card className="transition-colors hover:border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <CardTitle className="line-clamp-2">{plan.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{plan.direction}</p>
            </div>
            <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {plan.status}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{plan.goal}</p>
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {plan.durationDays} 天
            </span>
            <span className="flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              {plan.dailyMinutes} 分钟
            </span>
            <span className="flex items-center gap-1">
              <Layers3 className="h-3.5 w-3.5" aria-hidden="true" />
              {plan.stageCount} 阶段
            </span>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>任务进度</span>
              <span>{plan.completionRate}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${plan.completionRate}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
