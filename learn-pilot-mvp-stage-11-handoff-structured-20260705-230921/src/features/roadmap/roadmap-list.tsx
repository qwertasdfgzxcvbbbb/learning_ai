"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Route, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StageView } from "@/server/services/dashboard.service";

type RoadmapListProps = {
  stages: StageView[];
};

export function RoadmapList({ stages }: RoadmapListProps) {
  const [openStageIds, setOpenStageIds] = useState(() => new Set(stages[0] ? [stages[0].id] : []));

  if (stages.length === 0) {
    return (
      <EmptyState
        title="路线图还没生成"
        description="完成或跳过基础测评后，可以在计划详情页生成学习路线。"
      />
    );
  }

  function toggleStage(stageId: string) {
    setOpenStageIds((current) => {
      const next = new Set(current);

      if (next.has(stageId)) {
        next.delete(stageId);
      } else {
        next.add(stageId);
      }

      return next;
    });
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">学习路线</h2>
          <p className="mt-1 text-xs text-muted-foreground">内容可调整，执行前请结合自己的时间核验。</p>
        </div>
        <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
          {stages.length} 阶段
        </span>
      </div>

      <div className="rounded-lg border bg-card p-3 text-xs leading-5 text-muted-foreground">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span>路线图来自 mock AI。它是学习建议，不是绝对承诺；资源和结论都需要你自行核验。</span>
        </div>
      </div>

      {stages.map((stage) => {
        const isOpen = openStageIds.has(stage.id);

        return (
          <Card key={stage.id}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Route className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="line-clamp-2">
                        {stage.sequence}. {stage.title}
                      </CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {stage.statusLabel}
                        {stage.startsOn && stage.endsOn ? ` · ${stage.startsOn} - ${stage.endsOn}` : ""}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={isOpen ? "收起阶段" : "展开阶段"}
                      onClick={() => toggleStage(stage.id)}
                      className="h-8 w-8 shrink-0"
                    >
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>{stage.goal}</p>

              {isOpen ? (
                <div className="space-y-3">
                  <InfoBlock label="内容提纲" value={stage.contentOutline} />
                  <InfoBlock label="预期产出" value={stage.expectedOutcome} />
                  <InfoBlock label="验收方式" value={stage.acceptanceCriteria} />
                  <div className="rounded-md bg-muted px-3 py-2 text-xs leading-5">
                    来源：{stage.aiGenerated ? "mock AI 生成" : "用户创建"}
                    {stage.sourcePromptVersion ? ` · ${stage.sourcePromptVersion}` : ""}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted px-3 py-2">
      <div className="text-xs font-medium text-foreground">{label}</div>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{value}</p>
    </div>
  );
}
