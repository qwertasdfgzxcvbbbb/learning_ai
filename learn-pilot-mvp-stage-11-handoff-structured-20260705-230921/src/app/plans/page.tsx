import Link from "next/link";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { PlanCard } from "@/features/plans/plan-card";
import { getPlansOverview } from "@/server/services/dashboard.service";

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const overview = await getPlansOverview();

  return (
    <MobileShell title="学习计划" subtitle="查看已有计划">
      {overview.status === "unavailable" ? <ErrorState /> : null}

      {overview.status === "empty" ? (
        <EmptyState
          title="还没有计划"
          description="先创建一个学习目标草稿，后续再进入基础测评和路线生成。"
          action={
            <Button asChild>
              <Link href="/plans/new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                创建计划
              </Link>
            </Button>
          }
        />
      ) : null}

      {overview.status === "ready" ? (
        <section className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">我的计划</h1>
              <p className="mt-1 text-sm text-muted-foreground">共 {overview.plans.length} 个计划</p>
            </div>
            <Button asChild size="icon" aria-label="创建计划">
              <Link href="/plans/new">
                <Plus className="h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          {overview.plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </section>
      ) : null}
    </MobileShell>
  );
}
