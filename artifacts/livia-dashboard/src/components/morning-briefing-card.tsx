import { useEffect, useState } from "react";
import { useBusiness } from "@/lib/business-context";
import { customFetch } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

type BriefingPayload = {
  briefingDate: string;
  content: {
    businessName?: string;
    verticalLabel?: string;
    summary: string;
    highlights: string[];
    intel?: {
      commerceSignals?: Array<{ id: string; title: string; severity: string }>;
      capabilityHealth?: { score: number; grade: string; headline: string };
      twinHeadline?: string | null;
      twinSubline?: string | null;
    };
    source?: "liv" | "stats_fallback";
    stats: {
      todayCount: number;
      pendingCount: number;
      handedOffConversations: number;
      weekAheadCount: number;
    };
    todayBookings: Array<{
      id: string;
      startAt: string;
      status: string;
      customerName: string;
      serviceName: string;
    }>;
  };
  live?: boolean;
};

export function MorningBriefingCard() {
  const { business } = useBusiness();
  const bid = business?.id ?? "";
  const [data, setData] = useState<BriefingPayload | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!bid) return;
    setLoading(true);
    try {
      const res = await customFetch<BriefingPayload>(`/api/businesses/${bid}/morning-briefing`);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const onRefresh = () => void load();
    window.addEventListener("livia:morning-briefing-refresh", onRefresh);
    return () => window.removeEventListener("livia:morning-briefing-refresh", onRefresh);
  }, [bid]);

  if (!bid) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent" data-testid="morning-briefing-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Liv — morning briefing
        </CardTitle>
        <CardDescription>
          {data?.content.businessName ?? business?.name ?? "Today"} · {data?.briefingDate ?? "Today"}
          {data?.content.source === "liv" ? " · Liv" : data?.live ? " · updating…" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <Skeleton className="h-16 w-full" />
        ) : data ? (
          <>
            <p className="text-sm font-medium">{data.content.summary}</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
              {data.content.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            {data.content.intel?.commerceSignals?.some((s) => s.severity === "act") ? (
              <p className="text-xs text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-md px-2 py-1.5">
                Commerce act:{" "}
                {data.content.intel.commerceSignals
                  .filter((s) => s.severity === "act")
                  .map((s) => s.title)
                  .join(" · ")}
              </p>
            ) : null}
            {data.content.intel?.twinHeadline ? (
              <p className="text-xs text-muted-foreground border-t border-border/60 pt-2">
                <span className="font-medium text-foreground">{data.content.intel.twinHeadline}</span>
                {data.content.intel.twinSubline ? ` — ${data.content.intel.twinSubline}` : null}
              </p>
            ) : null}
            {data.content.intel?.capabilityHealth &&
            data.content.intel.capabilityHealth.score < 70 ? (
              <p className="text-xs text-muted-foreground">
                Setup health {data.content.intel.capabilityHealth.score}% (
                {data.content.intel.capabilityHealth.grade}) —{" "}
                {data.content.intel.capabilityHealth.headline}
              </p>
            ) : null}
            {data.content.todayBookings.length > 0 ? (
              <ul className="text-xs divide-y border rounded-md">
                {data.content.todayBookings.slice(0, 5).map((b) => (
                  <li key={b.id} className="px-2 py-1.5 flex justify-between gap-2">
                    <span>{b.customerName}</span>
                    <span className="text-muted-foreground">{b.serviceName}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {data.content.source !== "liv" ? (
              <p className="text-[10px] text-muted-foreground">
                Liv is generating your briefing — tap Refresh or use Command Hub.
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Briefing unavailable.</p>
        )}
        <Button variant="outline" size="sm" onClick={() => void load()}>
          Refresh
        </Button>
      </CardContent>
    </Card>
  );
}
