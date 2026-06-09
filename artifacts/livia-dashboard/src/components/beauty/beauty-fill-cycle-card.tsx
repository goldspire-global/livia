import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { useBusiness } from "@/lib/business-context";
import { apiFetch } from "@/lib/api-fetch";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, Loader2, MessageCircle } from "lucide-react";

type FillRow = {
  customerId: string;
  customerName: string;
  serviceId: string;
  serviceName: string;
  daysSince: number;
  daysOverdue: number;
  phone?: string | null;
  canNudge?: boolean;
};

export function BeautyFillCycleCard({ id }: { id?: string }) {
  const { business } = useBusiness();
  const { toast } = useToast();
  const bid = business?.id ?? "";
  const vertical = (business as { vertical?: string } | null)?.vertical;
  const [rows, setRows] = useState<FillRow[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [nudgeBusy, setNudgeBusy] = useState(false);

  const load = useCallback(() => {
    if (!bid || vertical !== "beauty") return;
    setLoading(true);
    apiFetch<{ dueCount: number; rows: FillRow[] }>(`/businesses/${bid}/beauty/fill-cycle`)
      .then((d) => {
        setDueCount(d.dueCount ?? 0);
        setRows(d.rows ?? []);
      })
      .catch(() => {
        setDueCount(0);
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [bid, vertical]);

  useEffect(() => {
    load();
  }, [load]);

  async function sendNudges(customerIds?: string[]) {
    if (!bid) return;
    setNudgeBusy(true);
    try {
      const result = await apiFetch<{
        sent: number;
        skipped: Array<{ reason: string }>;
      }>(`/businesses/${bid}/beauty/fill-cycle/nudge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerIds,
          limit: customerIds?.length ?? 8,
        }),
      });
      toast({
        title: result.sent > 0 ? `Sent ${result.sent} rebook SMS` : "No SMS sent",
        description:
          result.skipped.length > 0
            ? `${result.skipped.length} skipped (no phone, recent nudge, or upcoming booking).`
            : undefined,
      });
      load();
    } catch {
      toast({ title: "Could not send rebook SMS", variant: "destructive" });
    } finally {
      setNudgeBusy(false);
    }
  }

  if (vertical !== "beauty" || !bid) return null;
  if (!loading && dueCount === 0) return null;

  const nudgeable = rows.filter((r) => r.canNudge);

  return (
    <Card
      id={id}
      className="border-primary/20 bg-primary/5 scroll-mt-20"
      data-testid="beauty-fill-cycle-card"
    >
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" aria-hidden />
              Fill cycle due
            </CardTitle>
            <CardDescription>
              Clients past their lash or nail maintenance window — Liv can text a rebook link with
              service pre-selected.
            </CardDescription>
          </div>
          {nudgeable.length > 0 ? (
            <Button
              size="sm"
              variant="default"
              disabled={nudgeBusy}
              onClick={() => void sendNudges(nudgeable.map((r) => r.customerId))}
              data-testid="beauty-fill-cycle-nudge-all"
            >
              {nudgeBusy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
              )}
              SMS {nudgeable.length} due
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Scanning completed visits…</p>
        ) : (
          rows.slice(0, 6).map((r) => (
            <div
              key={`${r.customerId}-${r.serviceId}`}
              className="flex items-center justify-between gap-2 text-sm border rounded-md px-3 py-2"
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{r.customerName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {r.serviceName} · {r.daysSince}d since visit
                  {r.daysOverdue > 0 ? ` (${r.daysOverdue}d overdue)` : ""}
                  {!r.canNudge ? " · no mobile" : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                {r.canNudge ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={nudgeBusy}
                    onClick={() => void sendNudges([r.customerId])}
                    data-testid={`fill-nudge-${r.customerId}`}
                  >
                    SMS
                  </Button>
                ) : null}
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/customers/${r.customerId}`}>View</Link>
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
