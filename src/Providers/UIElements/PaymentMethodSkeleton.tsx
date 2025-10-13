// 1) Add this tiny skeleton component near your dialog file

function PaymentMethodSkeleton() {
  // Keep structure identical to the loaded state for zero layout shift
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      {/* Title */}
      <div className="space-y-2">
        <div className="h-6 sm:h-7 w-56 sm:w-72 rounded-md bg-[hsl(var(--muted))] animate-pulse" />
      </div>

      {/* Plan Selection */}
      <div className="space-y-3">
        <div className="h-4 w-24 rounded-md bg-[hsl(var(--muted))] animate-pulse" />
        <div className="flex flex-wrap gap-2">
          {/* 3–4 pills to reflect your plans */}
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-9 w-28 rounded-lg bg-[hsl(var(--muted))] animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Saved Cards (2 rows) */}
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm"
          >
            <div className="flex items-center gap-4">
              {/* Brand icon box */}
              <div className="h-10 w-16 rounded-md bg-[hsl(var(--muted))] animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-56 rounded bg-[hsl(var(--muted))] animate-pulse" />
                <div className="h-3 w-28 rounded bg-[hsl(var(--muted))] animate-pulse" />
              </div>
            </div>
            <div className="h-4 w-16 rounded bg-[hsl(var(--muted))] animate-pulse" />
          </div>
        ))}

        {/* CTA placeholder */}
        <div className="h-10 w-full sm:w-48 rounded-lg bg-[hsl(var(--muted))] animate-pulse" />
      </div>

      {/* Fallback form area (when no cards) — keeps height stable */}
      <div className="space-y-3">
        <div className="h-4 w-64 rounded bg-[hsl(var(--muted))] animate-pulse" />
        <div className="h-11 w-full rounded-md bg-[hsl(var(--muted))] animate-pulse" />
        <div className="h-11 w-40 rounded-lg bg-[hsl(var(--muted))] animate-pulse" />
      </div>

      {/* Visually-hidden text for screen readers */}
      <span className="sr-only">Loading payment methods…</span>
    </div>
  );
}
