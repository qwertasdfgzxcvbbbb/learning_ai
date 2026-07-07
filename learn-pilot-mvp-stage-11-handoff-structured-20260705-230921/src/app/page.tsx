import Link from "next/link";
import { BookOpen, Clock3, Plus } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskList } from "@/features/daily-tasks/task-list";
import { PlanCard } from "@/features/plans/plan-card";
import { ProgressSummary } from "@/features/progress/progress-summary";
import { ResourceList } from "@/features/resources/resource-list";
import { IN_APP_REMINDER_HOUR } from "@/lib/constants";
import { getDashboard } from "@/server/services/dashboard.service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const dashboard = await getDashboard();

  return (
    <MobileShell title="学径 AI" subtitle="今天的学习节奏">
      {dashboard.status === "unavailable" ? <ErrorState /> : null}

      {dashboard.status === "empty" ? (
        <EmptyState
          title="还没有学习计划"
          description="先创建一个学习目标草稿，下一步再进入基础测评和路线生成。"
          action={
            <Button asChild>
              <Link href="/plans/new">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                创建计划
              </Link>
            </Button>
          }
        />
      ) : null}

      {dashboard.status === "ready" && dashboard.activePlan ? (
        <>
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-primary">{dashboard.todayLabel}</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-normal">今晚继续推进一点点</h1>
              </div>
              <Button asChild size="icon" aria-label="创建计划">
                <Link href="/plans/new">
                  <Plus className="h-5 w-5" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </section>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock3 className="h-5 w-5 text-secondary" aria-hidden="true" />
                今晚 {IN_APP_REMINDER_HOUR} 点学习提醒
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">
                打开 App 后会看到这条提醒。MVP 先做 App 内提醒，不调用系统通知。
              </p>
            </CardContent>
          </Card>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">当前计划</h2>
            <PlanCard plan={dashboard.activePlan} />
          </section>

          <ProgressSummary plan={dashboard.activePlan} />
          <TaskList title="今日任务" tasks={dashboard.todayTasks} />
          <ResourceList resources={dashboard.recommendedResources} />
        </>
      ) : null}
    </MobileShell>
  );
}
