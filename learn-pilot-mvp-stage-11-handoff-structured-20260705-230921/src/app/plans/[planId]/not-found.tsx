import Link from "next/link";
import { EmptyState } from "@/components/feedback/empty-state";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";

export default function PlanNotFoundPage() {
  return (
    <MobileShell title="计划详情" subtitle="没有找到这个计划">
      <EmptyState
        title="计划不存在"
        description="这个计划可能已经被删除，或者不属于当前演示用户。"
        action={
          <Button asChild>
            <Link href="/plans">返回计划列表</Link>
          </Button>
        }
      />
    </MobileShell>
  );
}
