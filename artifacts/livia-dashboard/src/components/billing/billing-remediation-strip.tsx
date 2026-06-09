import { useGetOwnerIntelligence } from "@workspace/api-client-react";
import { useBusiness } from "@/lib/business-context";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { CommerceSettingsLink } from "@/components/billing/commerce-settings-link";

/** Actionable commerce remediation from owner-intelligence — billing tab anchor. */
export function BillingRemediationStrip() {
  const { business } = useBusiness();
  const bid = business?.id ?? "";
  const { data, isLoading } = useGetOwnerIntelligence(bid, {
    query: { enabled: !!bid } as never,
  });

  if (!bid) return null;
  if (isLoading) return <Skeleton className="h-20 w-full rounded-lg" />;

  const tasks = data?.remediationTasks ?? [];
  const top = data?.commerce.topSignal;
  const commerceBlockers = data?.commerceCapabilityBlockers ?? [];
  if (tasks.length === 0 && !top && commerceBlockers.length === 0) return null;

  const rows =
    tasks.length > 0
      ? tasks.slice(0, 3).map((t) => ({
          key: t.signalId,
          severity: t.severity,
          title: t.title,
          body: t.body,
          href: t.href,
        }))
      : top
        ? [
            {
              key: top.id,
              severity: top.severity,
              title: top.title,
              body: top.body,
              href: top.href,
            },
          ]
        : [];

  const blockerRows = commerceBlockers.slice(0, 2).map((b) => ({
    key: `${b.capabilityId}-${b.blocker}`,
    severity: "watch" as const,
    title: b.capabilityName,
    body: b.blocker,
    href: b.href,
  }));

  return (
    <div
      className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-3"
      data-testid="billing-remediation-strip"
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        Commerce needs attention
      </div>
      {blockerRows.map((task) => (
        <div key={task.key} className="flex items-start justify-between gap-3 text-sm">
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">setup</Badge>
              <span className="font-medium">{task.title}</span>
            </div>
            <p className="text-muted-foreground text-xs">{task.body}</p>
          </div>
          <CommerceSettingsLink href={task.href} className="shrink-0" />
        </div>
      ))}
      {rows.map((task) => (
        <div key={task.key} className="flex items-start justify-between gap-3 text-sm">
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={task.severity === "act" ? "destructive" : "secondary"}>
                {task.severity}
              </Badge>
              <span className="font-medium">{task.title}</span>
            </div>
            <p className="text-muted-foreground text-xs">{task.body}</p>
          </div>
          <CommerceSettingsLink href={task.href} className="shrink-0" />
        </div>
      ))}
    </div>
  );
}
