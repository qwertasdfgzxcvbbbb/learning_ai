import { MobileShell } from "@/components/layout/mobile-shell";
import { PlanCreationForm } from "@/features/plan-creation/plan-creation-form";

export default function NewPlanPage() {
  return (
    <MobileShell title="创建计划" subtitle="先保存草稿，下一步再测评">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-normal">你的学习目标是什么？</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          先把目标、周期、每天时间和资源偏好保存下来。MVP 当前会创建计划草稿，不会直接生成路线图。
        </p>
      </section>

      <PlanCreationForm />
    </MobileShell>
  );
}
