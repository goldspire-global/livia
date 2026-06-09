import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { dedupeLivProposalsForDisplay, livProposalDisplayTitle } from "@workspace/policy";
import { customFetch } from "@workspace/api-client-react";
import { Bot, Check, X, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBusiness } from "@/lib/business-context";
import { useToast } from "@/hooks/use-toast";
import { invalidateOperationalState, OPERATIONAL_REFETCH_MS } from "@/lib/operational-cache";
import { invalidateCommerceIntelligence } from "@/lib/commerce-intelligence-cache";
import { navigateToolkitHref } from "@/lib/toolkit-navigation";
import { cn } from "@/lib/utils";

type Proposal = {
  id: string;
  action: string;
  outcomePreview: string | null;
  reason: string | null;
  valueMinor?: number;
  resourceKind?: string | null;
  resourceId?: string | null;
  metadata?: { customerName?: string; bookingId?: string; title?: string } | null;
  createdAt: string;
};

const TOOLKIT_APPROVALS_HREF = "/toolkit#liv-approvals";
const TOOLKIT_MANDATE_HREF = "/toolkit#liv-mandate";

export function LivProposalsPanel({
  variant = "full",
  maxItems,
}: {
  variant?: "full" | "home";
  maxItems?: number;
}) {
  const { business } = useBusiness();
  const bid = business?.id ?? "";
  const { toast } = useToast();
  const qc = useQueryClient();
  const [location, navigate] = useLocation();
  const limit = maxItems ?? (variant === "home" ? 3 : undefined);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["liv-proposals", bid],
    queryFn: () => customFetch<{ data: Proposal[] }>(`/api/businesses/${bid}/liv-proposals`),
    enabled: !!bid,
    refetchInterval: OPERATIONAL_REFETCH_MS,
  });

  const rows = dedupeLivProposalsForDisplay(data?.data ?? []);
  const visible = limit ? rows.slice(0, limit) : rows;
  const overflow = limit ? Math.max(0, rows.length - limit) : 0;
  const onToolkit = location.startsWith("/toolkit");

  if (!isLoading && rows.length === 0) return null;

  const resolve = async (proposalId: string, status: "approved" | "dismissed") => {
    try {
      const result = await customFetch<{
        execution?: { effects?: string[] };
        nextHref?: string | null;
      }>(`/api/businesses/${bid}/liv-proposals/${proposalId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const effects = result.execution?.effects?.join(" · ");
      toast({
        title: status === "approved" ? "Approved — Liv applied this" : "Dismissed",
        description:
          status === "approved" && result.nextHref
            ? "Opening billing to finish setup…"
            : effects,
      });
      invalidateOperationalState(qc, bid);
      invalidateCommerceIntelligence(qc, bid);
      void refetch();
      if (status === "approved" && result.nextHref) {
        navigate(result.nextHref);
      }
    } catch (e) {
      toast({
        title: "Could not update proposal",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    }
  };

  const isHome = variant === "home";

  return (
    <Card
      data-testid="liv-proposals-panel"
      className={cn(
        "relative overflow-hidden border-violet-500/40 bg-gradient-to-br from-violet-500/8 via-card to-cyan-500/5",
        isHome
          ? "shadow-[0_8px_32px_-12px_rgba(139,92,246,0.35)]"
          : "shadow-[0_12px_40px_-16px_rgba(139,92,246,0.45)]",
      )}
    >
      <CardHeader className={cn("pb-2", isHome && "pb-1")}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-4 w-4 text-violet-500" />
              {isHome ? "Liv needs your OK" : "Liv proposals"}
              {rows.length > 0 ? (
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {rows.length}
                </Badge>
              ) : null}
            </CardTitle>
            <CardDescription className="mt-1">
              {isHome
                ? "Review before Liv acts — you're always in control of customer-facing moves."
                : "Actions Liv wants to take inside your mandate — approve or dismiss."}
            </CardDescription>
          </div>
          {isHome ? (
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-primary shrink-0 flex items-center gap-0.5"
              onClick={() => navigateToolkitHref(TOOLKIT_MANDATE_HREF, navigate)}
            >
              Mandate
              <ChevronRight className="h-3 w-3" />
            </button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? <Skeleton className="h-16 w-full" /> : null}
        {visible.map((p) => (
          <div
            key={p.id}
            className={cn(
              "flex flex-col gap-2 rounded-lg border bg-background/60 p-3 sm:flex-row sm:items-center sm:justify-between",
              isHome && "border-violet-500/15",
            )}
            data-testid={`liv-proposal-${p.id}`}
          >
            <div className="space-y-1 min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug">
                {livProposalDisplayTitle({
                  action: p.action,
                  outcomePreview: p.outcomePreview,
                  metadata: p.metadata as Record<string, unknown> | null,
                })}
              </p>
              {p.reason ? (
                <p className="text-xs text-muted-foreground line-clamp-2">{p.reason}</p>
              ) : null}
              {p.valueMinor && p.valueMinor > 0 ? (
                <p className="text-xs font-mono text-muted-foreground">
                  €{(p.valueMinor / 100).toFixed(0)}
                </p>
              ) : null}
            </div>
            <div className="flex gap-2 shrink-0 w-full sm:w-auto">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="flex-1 sm:flex-none min-h-[44px] sm:min-h-9"
                onClick={() => void resolve(p.id, "dismissed")}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Dismiss
              </Button>
              <Button
                type="button"
                size="sm"
                className="flex-1 sm:flex-none min-h-[44px] sm:min-h-9"
                onClick={() => void resolve(p.id, "approved")}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Approve
              </Button>
            </div>
          </div>
        ))}
        {overflow > 0 && !onToolkit ? (
          <p className="text-xs text-center text-muted-foreground">
            +{overflow} more —{" "}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => navigateToolkitHref(TOOLKIT_APPROVALS_HREF, navigate)}
            >
              view all approvals
            </button>
          </p>
        ) : null}
        {overflow > 0 && onToolkit ? (
          <p className="text-xs text-center text-muted-foreground">
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => navigateToolkitHref(TOOLKIT_APPROVALS_HREF, navigate)}
            >
              View all {rows.length} approvals below
            </button>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
