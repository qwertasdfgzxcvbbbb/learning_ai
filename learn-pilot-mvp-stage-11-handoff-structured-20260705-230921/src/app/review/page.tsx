import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlansOverview } from "@/server/services/dashboard.service";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const overview = await getPlansOverview();

  return (
    <MobileShell title="复盘" subtitle="选择计划完成周复盘">
      {overview.status === "unavailable" ? <ErrorState /> : null}

      {overview.status === "empty" ? (
        <EmptyState
          title="还没有可复盘的计划"
          description="先创建学习计划并生成任务，后续可在这里进入周复盘。"
          action={
            <Button asChild>
              <Link href="/plans/new">创建计划</Link>
            </Button>
          }
        />
      ) : null}

      {overview.status === "ready" ? (
        <section className="space-y-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-normal">选择复盘计划</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              复盘会汇总本周任务完成率、延期任务、跳过任务和最近笔记。
            </p>
          </div>
          {overview.plans.map((plan) => (
            <Card key={plan.id}>
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
              <CardContent className="space-y-3">
                <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{plan.goal}</p>
                <Button asChild className="w-full">
                  <Link href={`/plans/${plan.id}/review`}>
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    进入复盘
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}
    </MobileShell>
  );
}
