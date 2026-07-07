export function LoadingBlock() {
  return (
    <section className="space-y-3 rounded-lg border bg-card p-4" aria-label="正在加载">
      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      <div className="h-20 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 animate-pulse rounded bg-muted" />
        <div className="h-16 animate-pulse rounded bg-muted" />
      </div>
    </section>
  );
}
