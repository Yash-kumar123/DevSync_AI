// =============================================================================
// DevSync AI — WorkspaceCardSkeleton
// Loading placeholder that matches the WorkspaceCard dimensions.
// =============================================================================

export function WorkspaceCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 animate-pulse">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-800" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-3/4 rounded-md bg-slate-800" />
          <div className="h-3 w-1/3 rounded-md bg-slate-800/60" />
        </div>
      </div>
      {/* Description */}
      <div className="mb-4 space-y-2">
        <div className="h-3 w-full rounded-md bg-slate-800/60" />
        <div className="h-3 w-5/6 rounded-md bg-slate-800/40" />
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-800/60 pt-3">
        <div className="h-6 w-24 rounded-lg bg-slate-800" />
        <div className="h-3 w-20 rounded-md bg-slate-800/60" />
      </div>
    </div>
  );
}
