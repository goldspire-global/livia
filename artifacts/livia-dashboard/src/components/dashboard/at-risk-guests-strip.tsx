import { Link } from "wouter";
import { ChevronRight, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AtRiskGuestPreview } from "@workspace/policy";

type Props = {
  guests: AtRiskGuestPreview[];
  loading?: boolean;
  className?: string;
};

export function AtRiskGuestsStrip({ guests, loading, className }: Props) {
  if (loading || guests.length === 0) return null;

  return (
    <section
      className={cn(
        "rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-3 space-y-2",
        className,
      )}
      data-testid="at-risk-guests-strip"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] uppercase tracking-[0.18em] font-medium text-amber-800 dark:text-amber-200/90">
          Guests to reconnect
        </p>
        <Link href="/customers" className="text-xs text-primary hover:underline shrink-0">
          All clients
        </Link>
      </div>
      <ul className="space-y-1.5">
        {guests.map((g) => (
          <li key={g.customerId}>
            <Link
              href={`/customers/${g.customerId}`}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 -mx-2 hover:bg-background/60 transition-colors group"
              data-testid={`at-risk-guest-${g.customerId}`}
            >
              <UserRound className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{g.displayName}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{g.headline}</p>
              </div>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground shrink-0">
                {g.stage === "lapsed" ? "Lapsed" : "At risk"}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
