"use client";

import { ErrorState } from "@/components/feedback/error-state";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <MobileShell title="学径 AI" subtitle="页面出了一点问题">
      <ErrorState description="页面加载失败。请确认数据库已启动，然后再试一次。" />
      <Button onClick={reset}>重新加载</Button>
    </MobileShell>
  );
}
