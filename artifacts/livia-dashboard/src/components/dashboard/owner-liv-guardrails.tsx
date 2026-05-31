import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Sparkles, ChevronRight } from "lucide-react";
import { useBusiness } from "@/lib/business-context";
import {
  LIV_MANDATE_RUNG_LABELS,
  shouldShowOwnerLivGuardrails,
  type LivAutonomyRung,
} from "@workspace/policy";
import { OPERATIONAL_REFETCH_MS } from "@/lib/operational-cache";
import { cn } from "@/lib/utils";

type MandatePeek = {
  mandate: { rung: string; trustScore: number };
};

export function OwnerLivGuardrails({ livNeedsAttention = false }: { livNeedsAttention?: boolean }) {
  const { business } = useBusiness();
  const bid = business?.id ?? "";

  const { data: mandateData, isLoading: mandateLoading } = useQuery({
    queryKey: ["liv-mandate-peek", bid],
    queryFn: () => customFetch<MandatePeek>(`/api/businesses/${bid}/liv-mandate`),
    enabled: !!bid,
    staleTime: 60_000,
    refetchInterval: OPERATIONAL_REFETCH_MS,
  });

  const rung = (mandateData?.mandate.rung ?? "R3") as LivAutonomyRung;
  const rungCopy = LIV_MANDATE_RUNG_LABELS[rung] ?? LIV_MANDATE_RUNG_LABELS.R1;
  const trust = mandateData?.mandate.trustScore ?? 40;

  const visible =
    mandateLoading ||
    shouldShowOwnerLivGuardrails({ livNeedsAttention, mandateRung: rung });

  if (!visible) return null;

  return (
    <div
      className={cn(
        "rounded-lg border border-border/80 bg-card/80 px-3 py-2 flex flex-col sm:flex-row sm:items-center gap-2 text-sm",
        !mandateLoading && "border-violet-500/20",
      )}
      data-testid="owner-liv-guardrails"
    >
      <div className="flex gap-2 min-w-0 flex-1 items-center">
        <Sparkles className="h-3.5 w-3.5 text-violet-500 shrink-0" aria-hidden />
        <p className="text-xs text-muted-foreground leading-snug min-w-0">
          <span className="font-medium text-foreground">Liv · {mandateLoading ? "…" : rungCopy.short}</span>
          {!mandateLoading ? (
            <>
              {" "}
              — {rungCopy.description}
              <span className="font-mono text-[10px] ml-1">trust {trust}%</span>
            </>
          ) : null}
        </p>
      </div>
      <Link
        href="/settings?tab=liv"
        className="inline-flex items-center text-xs font-medium text-primary hover:underline shrink-0"
      >
        Tune
        <ChevronRight className="h-3 w-3 ml-0.5" />
      </Link>
    </div>
  );
}
