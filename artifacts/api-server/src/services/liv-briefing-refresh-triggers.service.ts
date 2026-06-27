/**
 * Fan-in domain events → single Inngest trigger (Inngest caps triggers per function at 10).
 */
import { inngest, isInngestWorkflowsEnabled } from "../lib/inngest";
import { logger } from "../lib/logger";

export const LIV_BRIEFING_REFRESH_REQUESTED = "liv/briefing.refresh.requested";

const BRIEFING_REFRESH_SOURCE_EVENTS = new Set([
  "booking.created",
  "booking.confirmed",
  "booking.cancelled",
  "booking.no-show",
  "payment.failed",
  "commerce.signal.detected",
  "twin.observation.generated",
  "twin.insight.generated",
  "twin.risk.detected",
  "twin.opportunity.detected",
  "liv.learning.correction.recorded",
  "liv.learning.override.recorded",
  "liv.learning.hypothesis.proposed",
]);

export async function maybeScheduleBriefingRefreshFromEvent(
  name: string,
  payload: unknown,
): Promise<void> {
  if (!BRIEFING_REFRESH_SOURCE_EVENTS.has(name)) return;

  const p = payload as { businessId?: string; bookingId?: string };
  if (!p.businessId) return;

  if (isInngestWorkflowsEnabled()) {
    void inngest
      .send({
        name: LIV_BRIEFING_REFRESH_REQUESTED,
        data: {
          businessId: p.businessId,
          bookingId: p.bookingId,
          sourceEvent: name,
        },
      })
      .catch((err) => {
        logger.warn({ err, businessId: p.businessId, name }, "briefing refresh schedule failed");
      });
  }

  logger.debug({ businessId: p.businessId, sourceEvent: name }, "liv briefing refresh scheduled");
}
