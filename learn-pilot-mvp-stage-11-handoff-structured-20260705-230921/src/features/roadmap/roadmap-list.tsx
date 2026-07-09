"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  ExternalLink,
  Route,
  Sparkles,
} from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  ResourceView,
  RoadmapSourceReferenceView,
  StageView,
  TaskView,
} from "@/server/services/dashboard.service";

type RoadmapListProps = {
  stages: StageView[];
  tasks?: TaskView[];
  resources?: ResourceView[];
  preferredResources?: string[];
};

export function RoadmapList({
  stages,
  tasks = [],
  resources = [],
  preferredResources = [],
}: RoadmapListProps) {
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
          <span>
            推荐器会优先匹配你的资源偏好
            {preferredResources.length > 0 ? `：${preferredResources.join("、")}` : ""}
            。每个阶段目标都有可点击的学习资料，资源和结论仍需要你自行核验。
          </span>
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
                  <StageResourceBlock resources={stageResources} />
                  {stage.sequenceRationale ? (
                    <InfoBlock label="排序依据" value={stage.sequenceRationale} />
                  ) : null}
                  <SourceReferenceBlock references={stage.sourceReferences} />
                  <StageTaskBlock tasks={stageTasks} />
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

function SourceReferenceBlock({ references }: { references: RoadmapSourceReferenceView[] }) {
  if (references.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md bg-muted px-3 py-2">
      <div className="text-xs font-medium text-foreground">可核验来源</div>
      <div className="mt-2 space-y-2">
        {references.map((reference) => (
          <div
            key={`${reference.title}-${reference.url ?? "local"}`}
            className="space-y-1 border-t border-border/60 pt-2 first:border-t-0 first:pt-0"
          >
            {reference.url ? (
              <a
                href={reference.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
              >
                {reference.title}
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            ) : (
              <div className="text-xs font-medium text-foreground">{reference.title}</div>
            )}
            <p className="text-xs leading-5 text-muted-foreground">{reference.note}</p>
          </div>
        ))}
      </div>
    </div>
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
      <div className="text-xs font-medium text-foreground">本阶段目标的学习资料</div>
      <div className="mt-2 space-y-2">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="space-y-1 border-t border-border/60 pt-2 first:border-t-0 first:pt-0"
          >
            {resource.url ? (
              <a
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
              >
                {resource.title}
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            ) : (
              <div className="text-xs font-medium text-foreground">{resource.title}</div>
            )}
            <p className="text-xs leading-5 text-muted-foreground">
              {resource.typeLabel} · {resource.difficultyLabel}
              {resource.estimatedMinutes ? ` · ${resource.estimatedMinutes} 分钟` : ""}
              {resource.sourceName ? ` · ${resource.sourceName}` : ""}
            </p>
            {resource.matchedPreferences.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {resource.matchedPreferences.map((preference) => (
                  <span
                    key={preference}
                    className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary"
                  >
                    匹配偏好：{preference}
                  </span>
                ))}
              </div>
            ) : null}
            <p className="text-xs leading-5 text-muted-foreground">
              {resource.recommendationReason}
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
