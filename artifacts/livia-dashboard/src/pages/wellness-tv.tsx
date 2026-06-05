import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useBusiness } from "@/lib/business-context";
import { apiFetch } from "@/lib/api-fetch";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Monitor, RefreshCw } from "lucide-react";

type RunRow = {
  bookingId: string;
  time: string;
  guest: string;
  service: string;
  room: string;
  status: string;
};

/** Reception TV — next arrivals for wall display (WB-206). Opens best fullscreen on a tablet. */
export default function WellnessTvPage() {
  const { business } = useBusiness();
  const bid = business?.id ?? "";
  const [rows, setRows] = useState<RunRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    if (!bid) return;
    const load = () => {
      void apiFetch<{ rows: RunRow[] }>(`/api/businesses/${bid}/wellness/run-sheet`)
        .then((r) => {
          setRows(r.rows.filter((x) => x.status !== "CANCELLED").slice(0, 10));
          setLastRefresh(new Date());
        })
        .finally(() => setLoading(false));
    };
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [bid]);

  return (
    <div
      className="wellness-tv-kiosk min-h-[calc(100dvh-3rem)] md:min-h-[calc(100dvh-4rem)] bg-background flex flex-col"
      data-testid="wellness-tv-mode"
    >
      <div className="flex items-start justify-between gap-4 px-6 md:px-10 pt-6 pb-4 border-b border-border/50">
        <header>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <Monitor className="h-3.5 w-3.5" aria-hidden />
            Reception display
          </p>
          <h1 className="text-3xl md:text-4xl font-serif mt-1">{business?.name ?? "Studio"}</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Next arrivals for guests in the waiting area — auto-refreshes every minute. Cast this tab to a wall
            screen or open fullscreen on a reception tablet.
          </p>
        </header>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1"
            onClick={() => void document.documentElement.requestFullscreen?.()}
          >
            Fullscreen
          </Button>
          {lastRefresh ? (
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <RefreshCw className="h-3 w-3" aria-hidden />
              Updated {lastRefresh.toLocaleTimeString()}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex-1 px-6 md:px-10 py-6 md:py-8">
        {loading ? (
          <p className="text-muted-foreground text-lg">Loading today&apos;s arrivals…</p>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/30 px-8 py-16 text-center max-w-lg mx-auto mt-8">
            <p className="text-xl font-serif text-foreground">No arrivals on the board yet</p>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              When today&apos;s bookings exist, guest name, service, room, and time appear here large enough for
              the waiting area.
            </p>
            <Link href="/bookings" className="inline-block mt-6 text-sm text-primary">
              Open room board →
            </Link>
          </div>
        ) : (
          <ul className="space-y-4 md:space-y-5 max-w-4xl">
            {rows.map((r) => (
              <li
                key={r.bookingId}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 border-b border-border/50 pb-4"
              >
                <div>
                  <p className="text-2xl md:text-3xl font-medium">{r.guest}</p>
                  <p className="text-base md:text-lg text-muted-foreground mt-0.5">
                    {r.service} · {r.room}
                  </p>
                </div>
                <p className="text-2xl md:text-4xl tabular-nums font-mono text-primary shrink-0">
                  {formatDateTime(r.time)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer className="px-6 py-3 border-t text-xs text-muted-foreground flex flex-wrap gap-x-4">
        <Link href="/wellness-reception" className="text-primary">
          Reception desk
        </Link>
        <Link href="/dashboard" className="text-primary">
          Today
        </Link>
      </footer>
    </div>
  );
}
