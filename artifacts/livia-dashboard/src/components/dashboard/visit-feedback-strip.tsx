import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Star, AlertTriangle } from "lucide-react";
import { useBusiness } from "@/lib/business-context";
import { apiFetch } from "@/lib/api-fetch";
import { Button } from "@/components/ui/button";

export type VisitFeedbackRow = {
  id: string;
  bookingId: string;
  score: number;
  comment: string | null;
  createdAt: string;
};

type Props = {
  /** When set, skips the extra API fetch (e.g. from dashboard summary). */
  items?: VisitFeedbackRow[];
  loading?: boolean;
};

export function VisitFeedbackStrip({ items: itemsProp, loading }: Props) {
  const { business } = useBusiness();
  const bid = business?.id ?? "";
  const [fetched, setFetched] = useState<VisitFeedbackRow[]>([]);

  useEffect(() => {
    if (itemsProp !== undefined || !bid) return;
    void apiFetch<{ data: VisitFeedbackRow[] }>(`/businesses/${bid}/visit-feedback`)
      .then((r) => setFetched(r.data ?? []))
      .catch(() => setFetched([]));
  }, [bid, itemsProp]);

  if (loading) return null;

  const rows = itemsProp ?? fetched;
  const low = rows.filter((r) => r.score <= 3);
  if (rows.length === 0) return null;

  return (
    <section
      className="rounded-lg border border-border/80 bg-card/40 px-4 py-3 space-y-2"
      data-testid="visit-feedback-strip"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          Client feedback
          {low.length > 0 ? (
            <span className="text-xs text-destructive flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {low.length} need attention
            </span>
          ) : null}
        </p>
        <Link href="/inbox">
          <Button variant="ghost" size="sm">
            Queue
          </Button>
        </Link>
      </div>
      <ul className="space-y-1.5">
        {rows.slice(0, 5).map((r) => (
          <li key={r.id} className="flex items-center justify-between text-sm gap-2">
            <span className={r.score <= 3 ? "text-destructive font-medium" : "text-foreground"}>
              {r.score}/5
              {r.comment ? ` · ${r.comment.slice(0, 60)}` : ""}
            </span>
            <Link href={`/bookings/${r.bookingId}`}>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                Booking
              </Button>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
