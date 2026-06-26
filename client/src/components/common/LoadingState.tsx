export function LoadingState() {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
      <div className="space-y-3">
        <div className="h-4 w-1/4 animate-pulse rounded bg-surface-container" />
        <div className="h-10 animate-pulse rounded bg-surface-container" />
        <div className="h-10 animate-pulse rounded bg-surface-container" />
        <div className="h-10 animate-pulse rounded bg-surface-container" />
      </div>
    </div>
  );
}
