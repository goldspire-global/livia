import { cn } from "@/lib/utils";
import type { EnquiryPrescreenTier } from "@workspace/policy";

export type LivPrescreenView = {
  tier: EnquiryPrescreenTier;
  headline: string;
  guidance: string;
  reasons: string[];
  score?: number;
};

/** Subtle inbox hint — only surfaces when Liv has a strong low-fit signal. */
export function LivPrescreenBadge({ prescreen }: { prescreen: LivPrescreenView }) {
  if (prescreen.tier !== "low" || !prescreen.reasons[0]) return null;

  return (
    <p
      className={cn("text-xs text-muted-foreground leading-snug")}
      data-testid="liv-prescreen-badge"
    >
      {prescreen.reasons[0]}
    </p>
  );
}
