import { CheckCircle2, Sparkles } from "lucide-react";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { useBusiness } from "@/lib/business-context";
import { useMembership } from "@/lib/membership-context";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Shows sacred V1 metric status on owner home — activated businesses see time-to-first-booking.
 */
export function ActivationMilestone({ className }: { className?: string }) {
  const { business } = useBusiness();
  const { effectiveRole } = useMembership();
  const bid = business?.id ?? "";
  const { data, isLoading } = useGetDashboardSummary(bid, {
    query: { enabled: !!bid } as never,
  });

  if (!business || !["OWNER", "ADMIN"].includes(effectiveRole ?? "")) return null;

  if (isLoading) {
    return <Skeleton className={cn("h-12 w-full rounded-lg", className)} />;
  }

  const activation = data?.activation;
  if (!activation) return null;

  if (activation.sacredMetricMet && activation.timeToFirstBookingLabel) {
    return (
      <div
        className={cn(
          "mb-4 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm",
          className,
        )}
        data-testid="activation-milestone-activated"
      >
        <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="font-medium text-foreground">First booking received</p>
          <p className="text-muted-foreground">
            Activated in {activation.timeToFirstBookingLabel}
            {activation.activationSource === "public" ? " via your booking page" : null}.
          </p>
        </div>
      </div>
    );
  }

  if (activation.status === "in_progress") {
    const remaining = activation.activationStepsTotal - activation.activationStepsComplete;
    return (
      <div
        className={cn(
          "mb-4 flex items-center gap-3 rounded-lg border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm",
          className,
        )}
        data-testid="activation-milestone-in-progress"
      >
        <Sparkles className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
        <div>
          <p className="font-medium text-foreground">Almost live</p>
          <p className="text-muted-foreground">
            {remaining} setup step{remaining === 1 ? "" : "s"} left — your sacred metric is the first
            real booking.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
