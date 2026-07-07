import { Ban, BookmarkCheck, ExternalLink, GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateResourceStatusAction } from "@/features/resources/actions";
import type { ResourceView } from "@/server/services/dashboard.service";

type ResourceListProps = {
  resources: ResourceView[];
};

export function ResourceList({ resources }: ResourceListProps) {
  if (resources.length === 0) {
    return (
      <EmptyState title="暂无资源建议" description="生成路线图后，这里会展示书籍、课程或网站建议。" />
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">资源建议</h2>
      {resources.map((resource) => (
        <Card key={resource.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="line-clamp-2">{resource.title}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  {resource.typeLabel}
                  {resource.sourceName ? ` · ${resource.sourceName}` : ""}
                </p>
              </div>
              <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                {resource.statusLabel}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                {resource.difficultyLabel}
              </span>
              <span className="flex items-center gap-1">
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                {resource.estimatedMinutes ? `${resource.estimatedMinutes} 分钟` : "时间待评估"}
              </span>
            </div>
            {resource.stageLabel ? (
              <p className="rounded-md bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground">
                适用阶段：{resource.stageLabel}
              </p>
            ) : null}
            <p className="text-sm leading-6 text-muted-foreground">{resource.recommendationReason}</p>
            <p className="rounded-md bg-secondary/15 px-3 py-2 text-xs leading-5 text-secondary-foreground">
              请自行核验：{resource.verificationNote}
            </p>
            <ResourceActions resource={resource} />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function ResourceActions({ resource }: { resource: ResourceView }) {
  const actions = [
    { status: "want_to_learn", label: "想学", icon: GraduationCap, variant: "outline" as const },
    { status: "learned", label: "已学", icon: BookmarkCheck, variant: "default" as const },
    { status: "unsuitable", label: "不适合", icon: Ban, variant: "outline" as const },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {actions.map((action) => {
        const isCurrent = resource.status === action.status;

        return (
          <form key={action.status} action={updateResourceStatusAction}>
            <input type="hidden" name="resourceId" value={resource.id} />
            <input type="hidden" name="nextStatus" value={action.status} />
            <Button
              type="submit"
              variant={isCurrent ? "secondary" : action.variant}
              size="sm"
              className="w-full px-2"
              disabled={isCurrent}
            >
              <action.icon className="h-4 w-4" aria-hidden="true" />
              {action.label}
            </Button>
          </form>
        );
      })}
    </div>
  );
}
