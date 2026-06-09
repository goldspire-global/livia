import { useQueryClient } from "@tanstack/react-query";
import {
  getGetTenantCapabilitiesQueryKey,
  getGetOwnerIntelligenceQueryKey,
  useGetTenantCapabilities,
  usePatchTenantCapabilityInstance,
} from "@workspace/api-client-react";
import { useBusiness } from "@/lib/business-context";
import { useMembership } from "@/lib/membership-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CreditCard, Layers, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { capabilityBlockerHref, resolveCommerceCapabilityBlockers, type ResolvedPlatformCapability } from "@workspace/policy";

const STATE_LABEL: Record<string, string> = {
  defined: "Planned",
  installed: "Installed",
  configured: "Ready",
  active: "Active",
  suspended: "Paused",
};

export function CapabilityReadinessPanel({ className }: { className?: string }) {
  const { business } = useBusiness();
  const { role } = useMembership();
  const qc = useQueryClient();
  const bid = business?.id ?? "";

  const { data, isLoading } = useGetTenantCapabilities(bid, {
    query: { enabled: !!bid } as never,
  });

  const patch = usePatchTenantCapabilityInstance({
    mutation: {
      onSuccess: () => {
        void qc.invalidateQueries({ queryKey: getGetTenantCapabilitiesQueryKey(bid) });
        void qc.invalidateQueries({ queryKey: getGetOwnerIntelligenceQueryKey(bid) });
      },
    },
  });

  if (!business || !["OWNER", "ADMIN"].includes(role ?? "")) return null;
  if (isLoading) return <Skeleton className={cn("h-28 w-full rounded-lg", className)} />;
  if (!data) return null;

  const blocked = data.platformCapabilities.filter((c) => c.readinessBlockers.length > 0);
  const commerceBlockers = resolveCommerceCapabilityBlockers(
    data.platformCapabilities as ResolvedPlatformCapability[],
  );
  const suspended = data.platformCapabilities.filter((c) => c.state === "suspended");
  const autoAdvanced = data.onboardingAutoAdvanced ?? [];
  if (
    blocked.length === 0 &&
    commerceBlockers.length === 0 &&
    suspended.length === 0 &&
    autoAdvanced.length === 0 &&
    data.activation?.sacredMetricMet
  ) {
    return null;
  }

  return (
    <Card
      className={cn("border-amber-500/20 bg-amber-500/5", className)}
      data-testid="capability-readiness-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Layers className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          Capability readiness
        </CardTitle>
        <CardDescription>
          Platform capabilities for {data.vertical} — finish blockers or pause capabilities you
          are not using yet.
          {data.capabilityHealth ? (
            <>
              {" "}
              · Health{" "}
              <span className="font-medium text-foreground">
                {data.capabilityHealth.score}% ({data.capabilityHealth.grade})
              </span>
            </>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {commerceBlockers.length > 0 ? (
          <div
            className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-2 mb-2"
            data-testid="capability-commerce-blockers"
          >
            <p className="text-xs font-medium flex items-center gap-1.5 text-amber-800 dark:text-amber-200">
              <CreditCard className="h-3.5 w-3.5" />
              Commerce setup blockers
            </p>
            {commerceBlockers.slice(0, 3).map((b) => (
              <div key={`${b.capabilityId}-${b.blocker}`} className="flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <span className="font-medium">{b.capabilityName}</span>
                  <p className="text-xs text-muted-foreground">{b.blocker}</p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0 h-7 text-xs" asChild>
                  <Link href={b.href}>Billing</Link>
                </Button>
              </div>
            ))}
          </div>
        ) : null}
        {autoAdvanced.length > 0 ? (
          <p className="text-xs text-emerald-700 dark:text-emerald-300" data-testid="capability-auto-advanced">
            Readiness cleared — auto-completed: {autoAdvanced.join(", ")}
          </p>
        ) : null}
        {data.platformCapabilities.map((cap) => {
          const blocker = cap.readinessBlockers[0];
          const href = blocker ? capabilityBlockerHref(cap.id, blocker) : undefined;
          return (
            <div
              key={cap.id}
              className="flex flex-wrap items-center justify-between gap-2 text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0"
            >
              <div className="min-w-0 flex-1">
                <span className="font-medium">{cap.name}</span>
                {blocker ? (
                  <p className="text-xs text-muted-foreground">
                    {href ? (
                      <Link href={href} className="hover:text-primary underline-offset-2 hover:underline">
                        {blocker}
                      </Link>
                    ) : (
                      blocker
                    )}
                  </p>
                ) : cap.state === "suspended" ? (
                  <p className="text-xs text-muted-foreground">Paused — resume when ready.</p>
                ) : null}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant={cap.state === "active" ? "default" : "secondary"}>
                  {STATE_LABEL[cap.state] ?? cap.state}
                </Badge>
                {cap.state === "suspended" ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    disabled={patch.isPending}
                    aria-label={`Resume ${cap.name}`}
                    onClick={() =>
                      patch.mutate({ businessId: bid, capabilityId: cap.id, data: { action: "resume" } })
                    }
                  >
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                ) : cap.state !== "defined" ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    disabled={patch.isPending}
                    aria-label={`Pause ${cap.name}`}
                    onClick={() =>
                      patch.mutate({ businessId: bid, capabilityId: cap.id, data: { action: "suspend" } })
                    }
                  >
                    <Pause className="h-3.5 w-3.5" />
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
        {!data.activation?.sacredMetricMet ? (
          <p className="text-xs text-muted-foreground pt-1">
            Sacred metric:{" "}
            <Link href="/bookings/new" className="text-primary underline-offset-2 hover:underline">
              first real booking
            </Link>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
