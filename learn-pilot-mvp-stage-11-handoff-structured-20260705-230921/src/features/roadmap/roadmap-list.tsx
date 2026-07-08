"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Clock3, Route, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResourceView, StageView, TaskView } from "@/server/services/dashboard.service";

type RoadmapListProps = {
  stages: StageView[];
  tasks?: TaskView[];
  resources?: ResourceView[];
};

export function RoadmapList({ stages, tasks = [], resources = [] }: RoadmapListProps) {
  const [openStageIds, setOpenStageIds] = useState(() => new Set(stages.map((stage) => stage.id)));

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
          <h2 className="text-base font-semibold">AI 路线图详情</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            每个阶段都展开显示目标、任务和资料，执行前请结合自己的时间核验。
          </p>
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
        const stageTasks = tasks.filter((task) => task.stageSequence === stage.sequence);
        const stageResources = resources.filter(
          (resource) => resource.stageSequence === stage.sequence,
        );

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
                        {stage.startsOn && stage.endsOn
                          ? ` · ${stage.startsOn} - ${stage.endsOn}`
                          : ""}
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
                  <StageTaskBlock tasks={stageTasks} />
                  <StageResourceBlock resources={stageResources} />
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

function StageTaskBlock({ tasks }: { tasks: TaskView[] }) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md bg-muted px-3 py-2">
      <div className="text-xs font-medium text-foreground">阶段任务</div>
      <div className="mt-2 space-y-2">
        {tasks.slice(0, 3).map((task) => (
          <div
            key={task.id}
            className="space-y-1 border-t border-border/60 pt-2 first:border-t-0 first:pt-0"
          >
            <div className="text-xs font-medium text-foreground">{task.title}</div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                {task.estimatedMinutes} 分钟
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                {task.taskTypeLabel} · {task.statusLabel}
              </span>
            </div>
          </div>
        ))}
      </div>
      {tasks.length > 3 ? (
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          还有 {tasks.length - 3} 个任务在下方任务列表中。
        </p>
      ) : null}
    </div>
  );
}

function StageResourceBlock({ resources }: { resources: ResourceView[] }) {
  if (resources.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md bg-muted px-3 py-2">
      <div className="text-xs font-medium text-foreground">推荐资料</div>
      <div className="mt-2 space-y-2">
        {resources.slice(0, 2).map((resource) => (
          <div
            key={resource.id}
            className="space-y-1 border-t border-border/60 pt-2 first:border-t-0 first:pt-0"
          >
            <div className="text-xs font-medium text-foreground">{resource.title}</div>
            <p className="text-xs leading-5 text-muted-foreground">
              {resource.typeLabel} · {resource.difficultyLabel}
              {resource.estimatedMinutes ? ` · ${resource.estimatedMinutes} 分钟` : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
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
