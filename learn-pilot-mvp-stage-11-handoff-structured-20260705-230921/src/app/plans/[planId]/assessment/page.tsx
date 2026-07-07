import { notFound } from "next/navigation";
import { ErrorState } from "@/components/feedback/error-state";
import { MobileShell } from "@/components/layout/mobile-shell";
import { AssessmentForm } from "@/features/assessment/assessment-form";
import { getAssessmentPage } from "@/server/services/assessment.service";

export const dynamic = "force-dynamic";

type AssessmentPageProps = {
  params: Promise<{ planId: string }>;
};

export default async function AssessmentPage({ params }: AssessmentPageProps) {
  const { planId } = await params;
  const assessment = await getAssessmentPage(planId);

  if (assessment.status === "not-found") {
    notFound();
  }

  return (
    <MobileShell title="基础测评" subtitle="完成后会回到计划详情">
      {assessment.status === "unavailable" ? <ErrorState /> : null}

      {assessment.status === "ready" ? (
        <>
          <section className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-normal">{assessment.plan.title}</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              这组题目会根据当前学习方向生成一个保守的基础判断。MVP 先使用 mock 题目，后续再接真实 AI。
            </p>
          </section>

          {assessment.latestAssessment ? (
            <section className="rounded-lg border bg-card p-4 text-sm leading-6 text-muted-foreground">
              最近一次测评状态：{assessment.latestAssessment.status}
              {assessment.latestAssessment.score !== null
                ? `，得分 ${assessment.latestAssessment.score}`
                : ""}
              。你可以重新提交一次测评覆盖后续判断依据。
            </section>
          ) : null}

          <AssessmentForm planId={assessment.plan.id} questions={assessment.questions} />
        </>
      ) : null}
    </MobileShell>
  );
}
