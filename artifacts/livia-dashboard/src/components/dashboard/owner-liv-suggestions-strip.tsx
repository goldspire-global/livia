import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { ownerHomeLivSuggestions } from "@workspace/policy";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function OwnerLivSuggestionsStrip({
  pendingCount,
  handedOffCount,
  atRiskCount = 0,
  lowFeedbackCount = 0,
  confirmedCount = 0,
  weekBookings = 0,
  commerce,
  className,
}: {
  pendingCount: number;
  handedOffCount: number;
  atRiskCount?: number;
  lowFeedbackCount?: number;
  confirmedCount?: number;
  weekBookings?: number;
  commerce?: {
    capturedMinor30d?: number;
    captureRatePercent?: number | null;
    paymentCount30d?: number;
    refundMinor30d?: number;
  };
  className?: string;
}) {
  const suggestions = ownerHomeLivSuggestions({
    pendingCount,
    handedOffCount,
    atRiskCount,
    lowFeedbackCount,
    commerce: {
      ...commerce,
      demandBookings: pendingCount + confirmedCount,
      weekBookings,
    },
  });

  if (suggestions.length === 0) return null;

  return (
    <div
      className={cn("flex flex-wrap gap-2", className)}
      data-testid="owner-liv-suggestions"
    >
      {suggestions.map((s) => (
        <Button key={s.id} size="sm" variant="outline" className="h-8 gap-1 rounded-full" asChild>
          <Link href={s.href}>
            {s.label}
            <ArrowRight className="h-3 w-3 opacity-60" />
          </Link>
        </Button>
      ))}
    </div>
  );
}
