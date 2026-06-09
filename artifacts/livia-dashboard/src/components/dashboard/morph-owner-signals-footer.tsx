import { AtRiskGuestsStrip } from "@/components/dashboard/at-risk-guests-strip";
import { VisitFeedbackStrip } from "@/components/dashboard/visit-feedback-strip";
import { OwnerIntelligenceStack } from "@/components/dashboard/owner-intelligence-stack";
import type { AtRiskGuestPreview } from "@workspace/policy";

type FeedbackItem = {
  id: string;
  bookingId: string;
  score: number;
  comment: string | null;
  createdAt: string;
};

/** Relationship + trust + twin blocks shared by beauty/wellness morph Today layouts. */
export function MorphOwnerSignalsFooter({
  atRiskGuests,
  recentVisitFeedback,
  loading,
}: {
  atRiskGuests?: AtRiskGuestPreview[];
  recentVisitFeedback?: FeedbackItem[];
  loading?: boolean;
}) {
  const hasSignals =
    (atRiskGuests?.length ?? 0) > 0 || (recentVisitFeedback?.length ?? 0) > 0;
  if (loading && !hasSignals) return null;

  return (
    <div className="space-y-3 mt-4" data-testid="morph-owner-signals-footer">
      <AtRiskGuestsStrip guests={atRiskGuests ?? []} loading={loading} />
      <VisitFeedbackStrip items={recentVisitFeedback} loading={loading} />
      <OwnerIntelligenceStack variant="owner-home" />
    </div>
  );
}
