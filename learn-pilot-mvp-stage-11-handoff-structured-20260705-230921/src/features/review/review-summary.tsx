import Link from "next/link";
import { Bot, CheckCircle2, FileText, History, NotebookText, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  applyReviewAdjustmentAction,
  generateReviewAdjustmentAction,
} from "@/features/review/actions";
import type {
  ReviewAdjustmentView,
  ReviewNoteView,
  ReviewRecordView,
  WeeklyReviewStatsView,
} from "@/features/review/types";

type WeeklyReviewSummaryProps = {
  stats: WeeklyReviewStatsView;
};

type ReviewNotesProps = {
  planId: string;
  notes: ReviewNoteView[];
};

type ReviewHistoryProps = {
  reviews: ReviewRecordView[];
};

type AiAdjustmentPanelProps = {
  planId: string;
  adjustments: ReviewAdjustmentView[];
  canGenerate: boolean;
};

export function WeeklyReviewSummary({ stats }: WeeklyReviewSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>本周复盘</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">{stats.periodLabel}</p>
        <div className="grid grid-cols-2 gap-2 text-center">
          <Metric label="任务完成率" value={`${stats.completionRatePercent}%`} />
          <Metric label="完成任务" value={`${stats.completedTasks}/${stats.totalTasks}`} />
          <Metric label="延期任务" value={`${stats.delayedTaskCount}`} />
          <Metric label="跳过任务" value={`${stats.skippedTaskCount}`} />
        </div>
        <p className="rounded-md bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground">
          本周共有 {stats.progressLogCount} 条进度日志用于复盘参考。跳过任务不计入完成率分母。
        </p>
      </CardContent>
    </Card>
  );
}

export function ReviewNotes({ planId, notes }: ReviewNotesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <NotebookText className="h-5 w-5 text-primary" aria-hidden="true" />
          笔记摘要入口
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div key={note.id} className="rounded-md border bg-background px-3 py-2">
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>{note.createdAt}</span>
                {note.taskTitle ? <span>关联任务：{note.taskTitle}</span> : null}
              </div>
              <p className="mt-1 line-clamp-2 text-sm leading-6">{note.content}</p>
            </div>
          ))
        ) : (
          <EmptyState title="暂无笔记" description="本周复盘会优先展示最近 3 条原文笔记。" />
        )}
        <Button asChild variant="outline" className="w-full">
          <Link href={`/plans/${planId}`}>
            <FileText className="h-4 w-4" aria-hidden="true" />
            回到计划详情补充笔记
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function ReviewHistory({ reviews }: ReviewHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" aria-hidden="true" />
          复盘记录
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="space-y-2 rounded-md border bg-background px-3 py-2">
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>{review.periodLabel}</span>
                <span>{review.createdAt}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <Metric label="完成率" value={`${review.completionRatePercent}%`} />
                <Metric label="延期" value={`${review.delayedTaskCount}`} />
                <Metric label="跳过" value={`${review.skippedTaskCount}`} />
              </div>
              {review.satisfactionScore ? (
                <p className="text-sm text-muted-foreground">满意度：{review.satisfactionScore}/5</p>
              ) : null}
              {review.blockers ? <p className="text-sm leading-6">{review.blockers}</p> : null}
              {review.nextGoal ? (
                <p className="text-sm leading-6 text-muted-foreground">下周目标：{review.nextGoal}</p>
              ) : null}
            </div>
          ))
        ) : (
          <EmptyState title="还没有复盘记录" description="保存本周复盘后，会在这里按时间倒序显示。" />
        )}
      </CardContent>
    </Card>
  );
}

export function AiAdjustmentPanel({ planId, adjustments, canGenerate }: AiAdjustmentPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" aria-hidden="true" />
          AI 调整建议
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-6 text-muted-foreground">
          AI 建议会先保存为待确认状态。只有点击确认应用后，才会修改计划说明和每日学习时长，并生成新的计划版本。
        </p>
        <form action={generateReviewAdjustmentAction}>
          <input type="hidden" name="planId" value={planId} />
          <Button type="submit" variant="outline" className="w-full" disabled={!canGenerate}>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            生成调整建议
          </Button>
        </form>
        {!canGenerate ? (
          <p className="text-xs leading-5 text-muted-foreground">
            保存至少一条复盘记录后，才能基于复盘生成调整建议。
          </p>
        ) : null}
        {adjustments.length > 0 ? (
          <div className="space-y-3">
            {adjustments.map((adjustment) => (
              <div key={adjustment.id} className="space-y-3 rounded-md border bg-background px-3 py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{adjustment.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {adjustment.reviewPeriodLabel ?? "未关联复盘"} · {adjustment.createdAt}
                    </p>
                  </div>
                  <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {adjustment.statusLabel}
                  </span>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{adjustment.reason}</p>
                <div className="space-y-2 rounded-md bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground">
                  <p>影响范围：{adjustment.impactScope}</p>
                  <p>学习时长：{formatDailyMinutesDelta(adjustment.dailyMinutesDelta)}</p>
                  <p>计划说明：{adjustment.planNote}</p>
                  <p>任务策略：{adjustment.taskStrategy}</p>
                </div>
                {adjustment.nextReviewFocus.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {adjustment.nextReviewFocus.map((focus) => (
                      <span key={focus} className="rounded-md border px-2 py-1 text-xs text-muted-foreground">
                        {focus}
                      </span>
                    ))}
                  </div>
                ) : null}
                {adjustment.status === "pending" ? (
                  <form action={applyReviewAdjustmentAction}>
                    <input type="hidden" name="planId" value={planId} />
                    <input type="hidden" name="adjustmentId" value={adjustment.id} />
                    <Button type="submit" className="w-full">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      确认应用
                    </Button>
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="暂无调整建议" description="生成后会先显示为待确认，不会自动修改计划。" />
        )}
      </CardContent>
    </Card>
  );
}

function formatDailyMinutesDelta(delta: number) {
  if (delta === 0) {
    return "保持不变";
  }

  return delta > 0 ? `增加 ${delta} 分钟/天` : `减少 ${Math.abs(delta)} 分钟/天`;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted px-2 py-3">
      <div className="text-base font-semibold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
