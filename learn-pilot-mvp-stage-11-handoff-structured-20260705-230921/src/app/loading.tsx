import { LoadingBlock } from "@/components/feedback/loading-block";
import { MobileShell } from "@/components/layout/mobile-shell";

export default function Loading() {
  return (
    <MobileShell title="学径 AI" subtitle="正在整理学习数据">
      <LoadingBlock />
    </MobileShell>
  );
}
