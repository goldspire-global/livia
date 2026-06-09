import { Link } from "wouter";
import { useGetActivityFeed } from "@workspace/api-client-react";
import { useBusiness } from "@/lib/business-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";
import { getActivityEventMeta } from "@/lib/activity-labels";
import { cn } from "@/lib/utils";

function formatRelativeTime(dateStr: string): string {
  const mins = Math.round((Date.now() - new Date(dateStr).getTime()) / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.round(mins / 60)}h`;
  return `${Math.round(mins / 1440)}d`;
}

export function ActivityFeedPanel({ limit = 10, className }: { limit?: number; className?: string }) {
  const { business } = useBusiness();
  const bid = business?.id ?? "";

  const { data, isLoading } = useGetActivityFeed(
    bid,
    { limit },
    { query: { enabled: !!bid } as never },
  );

  if (!bid) return null;
  if (!isLoading && (data?.length ?? 0) === 0) return null;

  return (
    <div className={cn("rounded-lg border bg-card", className)} data-testid="activity-feed-panel">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Recent activity</h3>
      </div>
      {isLoading ? (
        <div className="p-3 space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : (
        <div className="flex flex-col">
          {(data ?? []).map((a) => {
            const meta = getActivityEventMeta(
              a.type,
              (business as { vertical?: string } | undefined)?.vertical,
              business?.category,
            );
            const label = a.label ?? meta.label;
            const row = (
              <div
                className={cn(
                  "flex items-start gap-3 px-4 py-2.5 border-b border-border last:border-0 hover:bg-muted/30",
                  a.priority === "act" && "border-l-2 border-l-destructive",
                )}
              >
                <div className={`mt-0.5 shrink-0 ${meta.color}`}>
                  <meta.Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] truncate">{label}</div>
                  {a.detail ? (
                    <div className="text-[10px] text-muted-foreground truncate">{a.detail}</div>
                  ) : null}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono shrink-0">
                  {formatRelativeTime(a.createdAt)}
                </div>
              </div>
            );
            if (a.href) {
              return (
                <Link key={a.id} href={a.href}>
                  {row}
                </Link>
              );
            }
            return <div key={a.id}>{row}</div>;
          })}
        </div>
      )}
    </div>
  );
}
