import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardCheck, RotateCcw, Route } from "lucide-react";
import { ErrorState } from "@/components/feedback/error-state";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskList } from "@/features/daily-tasks/task-list";
import { NotePanel } from "@/features/notes/note-panel";
import { ProgressSummary } from "@/features/progress/progress-summary";
import { ResourceList } from "@/features/resources/resource-list";
import { generateRoadmapAction } from "@/features/roadmap/actions";
import { RoadmapList } from "@/features/roadmap/roadmap-list";
import { getPlanDetail } from "@/server/services/dashboard.service";

export const dynamic = "force-dynamic";

type PlanDetailPageProps = {
  params: Promise<{ planId: string }>;
  searchParams: Promise<{ roadmap?: string }>;
};

export default async function PlanDetailPage({ params, searchParams }: PlanDetailPageProps) {
  const { planId } = await params;
  const { roadmap } = await searchParams;
  const detail = await getPlanDetail(planId);

  if (detail.status === "not-found") {
    notFound();
  }

  return (
    <MobileShell title="计划详情" subtitle="路线、任务、资源和进度">
      {detail.status === "unavailable" ? <ErrorState /> : null}

      {detail.status === "ready" ? (
        <>
          <section className="space-y-2">
            <span className="inline-flex rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {detail.plan.status}
            </span>
            <h1 className="text-2xl font-semibold tracking-normal">{detail.plan.title}</h1>
            <p className="text-sm leading-6 text-muted-foreground">{detail.plan.goal}</p>
          </section>

          <RoadmapStatusMessage status={roadmap} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" aria-hidden="true" />
                基础测评
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {detail.latestAssessment ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  最近结果：{detail.latestAssessment.status}
                  {detail.latestAssessment.score !== null
                    ? `，得分 ${detail.latestAssessment.score}`
                    : ""}
                  {detail.latestAssessment.resultLevel
                    ? `，判断为${detail.latestAssessment.resultLevel}`
                    : ""}
                  。
                </p>
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  先完成或跳过基础测评，后续路线图会根据这个结果生成。
                </p>
              )}
              <Button asChild className="w-full">
                <Link href={`/plans/${detail.plan.id}/assessment`}>
                  {detail.latestAssessment ? "重新测评" : "开始测评"}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5 text-primary" aria-hidden="true" />
                AI 路线图
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {detail.stages.length > 0 ? (
                <>
                  <p className="text-sm leading-6 text-muted-foreground">
                    已生成 {detail.stages.length} 个 AI
                    学习阶段。下面先显示路线预览，完整任务和资料在页面下方。
                  </p>
                  <div className="space-y-2">
                    {detail.stages.map((stage) => (
                      <div key={stage.id} className="rounded-md bg-muted px-3 py-2">
                        <div className="text-sm font-medium text-foreground">
                          {stage.sequence}. {stage.title}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {stage.goal}
                        </p>
                        {stage.sequenceRationale ? (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                            排序依据：{stage.sequenceRationale}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <form action={generateRoadmapAction}>
                    <input type="hidden" name="planId" value={detail.plan.id} />
                    <input type="hidden" name="mode" value="regenerate" />
                    <Button type="submit" variant="outline" className="w-full">
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      重新生成 AI 路线图
                    </Button>
                  </form>
                </>
              ) : detail.latestAssessment ? (
                <>
                  <p className="text-sm leading-6 text-muted-foreground">
                    根据当前计划和最近一次测评结果，生成学习阶段、前几天任务和资源建议。
                  </p>
                  <form action={generateRoadmapAction}>
                    <input type="hidden" name="planId" value={detail.plan.id} />
                    <Button type="submit" className="w-full">
                      生成路线图
                    </Button>
                  </form>
                </>
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  请先完成或跳过基础测评，再生成路线图。
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-primary" aria-hidden="true" />
                基础复盘
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-6 text-muted-foreground">
                汇总本周任务完成率、延期任务、跳过任务和最近笔记，保存你的主观反馈。
              </p>
              <Button asChild className="w-full">
                <Link href={`/plans/${detail.plan.id}/review`}>进入复盘</Link>
              </Button>
            </CardContent>
          </Card>

          <ProgressSummary plan={detail.plan} />
          <RoadmapList
            stages={detail.stages}
            tasks={detail.tasks}
            resources={detail.resources}
            preferredResources={detail.plan.preferredResources}
          />
          <TaskList title="全部任务" tasks={detail.tasks} />
          <ResourceList resources={detail.resources} />
          <NotePanel planId={detail.plan.id} tasks={detail.tasks} notes={detail.notes} />
        </>
      ) : null}
    </MobileShell>
  );
}

function RoadmapStatusMessage({ status }: { status?: string }) {
  const messages: Record<string, string> = {
    generated: "路线图已生成，并写入阶段、任务、资源建议和 AI 调用日志。",
    regenerated: "AI 路线图已重新生成，旧的阶段、任务和资源建议已替换。",
    "already-exists": "这个计划已经有路线图，暂时不会重复生成。",
    "assessment-required": "请先完成或跳过基础测评，再生成路线图。",
  };

  if (!status || !messages[status]) {
    return null;
  }

  return (
    <section className="rounded-lg border bg-card px-4 py-3 text-sm leading-6 text-muted-foreground">
      {messages[status]}
    </section>
  );
}
