import { Link } from "wouter";
import { useGetOwnerIntelligence } from "@workspace/api-client-react";
import { useBusiness } from "@/lib/business-context";
import { useMembership } from "@/lib/membership-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function OwnerIntelligenceHub({ className }: { className?: string }) {
  const { business } = useBusiness();
  const { effectiveRole } = useMembership();
  const bid = business?.id ?? "";

  const { data, isLoading } = useGetOwnerIntelligence(bid, {
    query: { enabled: !!bid } as never,
  });

  if (!business || !["OWNER", "ADMIN"].includes(effectiveRole ?? "")) return null;
  if (isLoading) return <Skeleton className={cn("h-36 w-full rounded-lg", className)} />;
  if (!data) return null;

  const top = data.commerce.topSignal;
  const health = data.capabilityHealth;
  const tasks = data.remediationTasks ?? [];
  const commerceBlockers = data.commerceCapabilityBlockers ?? [];
  const showHub =
    top != null ||
    commerceBlockers.length > 0 ||
    (health != null && health.score < 85) ||
    data.livPrompts.length > 0 ||
    tasks.length > 0 ||
    data.twinTopRecommendation != null;

  if (!showHub) return null;

  return (
    <Card className={cn("border-primary/10", className)} data-testid="owner-intelligence-hub">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          What Liv sees
        </CardTitle>
        <CardDescription>
          Revenue signals, setup gaps, and prompts worth acting on
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.twinHeadline ? (
          <p className="text-sm text-muted-foreground border-b border-border/60 pb-2">
            <span className="font-medium text-foreground">{data.twinHeadline}</span>
            {data.twinSubline ? ` — ${data.twinSubline}` : null}
          </p>
        ) : null}

        {top ? (
          <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant={top.severity === "act" ? "destructive" : "secondary"}>
                {top.severity}
              </Badge>
              <span className="text-sm font-medium">{top.title}</span>
            </div>
            <p className="text-sm text-muted-foreground">{top.body}</p>
            <Button size="sm" variant="link" className="h-auto p-0" asChild>
              <Link href={top.href}>Review in billing</Link>
            </Button>
          </div>
        ) : null}

        {commerceBlockers.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Commerce setup
            </p>
            {commerceBlockers.slice(0, 3).map((b) => (
              <div key={`${b.capabilityId}-${b.blocker}`} className="text-sm border rounded-lg p-2">
                <p className="font-medium">{b.capabilityName}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{b.blocker}</p>
                <Button size="sm" variant="link" className="h-auto p-0 mt-1" asChild>
                  <Link href={b.href}>Fix in billing</Link>
                </Button>
              </div>
            ))}
          </div>
        ) : null}

        {health && health.score < 85 ? (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Shop readiness</span>
            <span className="font-medium">
              {health.score}% · {health.grade}
            </span>
          </div>
        ) : null}

        {tasks.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Remediation
            </p>
            {tasks.slice(0, 2).map((task) => (
              <div key={task.signalId} className="text-sm border rounded-lg p-2">
                <p className="font-medium">{task.title}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{task.body}</p>
                <Button size="sm" variant="link" className="h-auto p-0 mt-1" asChild>
                  <Link href={task.href}>Fix in billing</Link>
                </Button>
              </div>
            ))}
          </div>
        ) : null}

        {data.twinTopRecommendation ? (
          <div className="flex gap-2 text-sm items-start justify-between">
            <div className="flex gap-2 min-w-0">
              <Sparkles className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <div>
                <p className="font-medium">{data.twinTopRecommendation.title}</p>
                <p className="text-muted-foreground">{data.twinTopRecommendation.reason}</p>
              </div>
            </div>
            {data.twinTopRecommendation.href ? (
              <Button size="sm" variant="link" className="shrink-0 h-auto p-0" asChild>
                <Link href={data.twinTopRecommendation.href}>Open</Link>
              </Button>
            ) : null}
          </div>
        ) : null}

        {data.livPrompts.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {data.livPrompts.map((prompt) => (
              <Button
                key={prompt}
                size="sm"
                variant="outline"
                className="h-8 rounded-full gap-1"
                asChild
              >
                <Link href={`/my-livia?q=${encodeURIComponent(prompt)}`}>
                  <MessageSquare className="h-3 w-3 opacity-60" />
                  {prompt.length > 42 ? `${prompt.slice(0, 40)}…` : prompt}
                </Link>
              </Button>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
