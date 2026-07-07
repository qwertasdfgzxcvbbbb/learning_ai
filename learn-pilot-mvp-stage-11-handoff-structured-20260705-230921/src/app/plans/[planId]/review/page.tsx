import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { ErrorState } from "@/components/feedback/error-state";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewForm } from "@/features/review/review-form";
import {
  AiAdjustmentPanel,
  ReviewHistory,
  ReviewNotes,
  WeeklyReviewSummary,
} from "@/features/review/review-summary";
import { getReviewPageData } from "@/server/services/review.service";

export const dynamic = "force-dynamic";

type PlanReviewPageProps = {
  params: Promise<{ planId: string }>;
};

export default async function PlanReviewPage({ params }: PlanReviewPageProps) {
  const { planId } = await params;
  const data = await getReviewPageData(planId);

  if (data.status === "not-found") {
    notFound();
  }

  return (
    <MobileShell title="基础复盘" subtitle="本周任务、笔记和主观反馈">
      {data.status === "unavailable" ? <ErrorState /> : null}

      {data.status === "ready" ? (
        <>
          <section className="space-y-3">
            <Button asChild variant="ghost" className="w-fit px-0">
              <Link href={`/plans/${data.plan.id}`}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                返回计划
              </Link>
            </Button>
            <div className="space-y-2">
              <span className="inline-flex rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                周复盘
              </span>
              <h1 className="text-2xl font-semibold tracking-normal">{data.plan.title}</h1>
              <p className="text-sm leading-6 text-muted-foreground">{data.plan.goal}</p>
            </div>
          </section>

          <WeeklyReviewSummary stats={data.currentStats} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-primary" aria-hidden="true" />
                填写本周反馈
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewForm planId={data.plan.id} />
            </CardContent>
          </Card>

          <ReviewNotes planId={data.plan.id} notes={data.notes} />
          <AiAdjustmentPanel
            planId={data.plan.id}
            adjustments={data.adjustments}
            canGenerate={data.reviews.length > 0}
          />
          <ReviewHistory reviews={data.reviews} />
        </>
      ) : null}
    </MobileShell>
  );
}
