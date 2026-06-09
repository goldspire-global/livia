import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useBusiness } from "@/lib/business-context";
import { apiFetch } from "@/lib/api-fetch";
import { Button } from "@/components/ui/button";
import { Monitor, RefreshCw } from "lucide-react";

type QueueRow = {
  bookingId: string;
  time: string;
  guest: string;
  service: string;
  artist: string;
  status: string;
};

/** Reception TV — anonymised queue for waiting area (beauty vertical). */
export default function BeautyTvPage() {
  const { business } = useBusiness();
  const bid = business?.id ?? "";
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    if (!bid) return;
    const load = () => {
      void apiFetch<{ rows: QueueRow[] }>(`/api/businesses/${bid}/beauty/tv-queue`)
        .then((r) => {
          setRows((r.rows ?? []).filter((x) => x.status !== "CANCELLED").slice(0, 10));
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
      className="beauty-tv-kiosk min-h-[calc(100dvh-3rem)] md:min-h-[calc(100dvh-4rem)] bg-background flex flex-col"
      data-testid="beauty-tv-mode"
    >
      <div className="flex items-start justify-between gap-4 px-6 md:px-10 pt-6 pb-4 border-b border-border/50">
        <header>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <Monitor className="h-3.5 w-3.5" aria-hidden />
            Waiting area
          </p>
          <h1 className="text-3xl md:text-4xl font-serif mt-1">{business?.name ?? "Studio"}</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Upcoming appointments — first names only. Auto-refreshes every minute.
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
          <p className="text-muted-foreground text-lg">Loading today&apos;s queue…</p>
        ) : rows.length === 0 ? (
          <p className="text-muted-foreground text-lg">No upcoming appointments — enjoy the calm.</p>
        ) : (
          <ul className="space-y-3 max-w-3xl">
            {rows.map((row) => (
              <li
                key={row.bookingId}
                className="flex items-baseline justify-between gap-4 border-b border-border/40 pb-3"
              >
                <div>
                  <p className="text-2xl md:text-3xl font-serif">{row.guest}</p>
                  <p className="text-sm text-muted-foreground mt-1">{row.service}</p>
                </div>
                <p className="text-xl md:text-2xl tabular-nums text-primary shrink-0">{row.time}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer className="px-6 py-4 border-t border-border/40 text-center text-xs text-muted-foreground">
        <Link href="/beauty-reception" className="text-primary hover:underline">
          Back to desk mode
        </Link>
      </footer>
    </div>
  );
}
