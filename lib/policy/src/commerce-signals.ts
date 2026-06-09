/**
 * Structured commerce signals — materialized as Liv moments, Twin recs, and owner UI.
 */
import type { CommerceBriefingInput } from "./commerce-briefing";
import {
  ownerHomeCommerceNeedsAttention,
  ownerHomeElevatedRefunds,
  ownerHomeUncapturedDemand,
} from "./commerce-briefing";

export type CommerceSignalSeverity = "act" | "watch" | "info";

export type CommerceSignalId =
  | "uncaptured_demand"
  | "low_capture"
  | "elevated_refunds"
  | "strong_revenue";

export type CommerceSignal = {
  id: CommerceSignalId;
  severity: CommerceSignalSeverity;
  title: string;
  body: string;
  href: string;
  priority: number;
};

/** Plan tab — general billing navigation. */
export const COMMERCE_BILLING_HREF = "/settings?tab=billing";
/** Plan tab anchor with actionable commerce fix steps. */
export const COMMERCE_BILLING_FIX_HREF = "/settings?tab=billing#commerce-fix";
/** Legal tab — deposit and booking policy controls. */
export const COMMERCE_BOOKING_POLICIES_HREF = "/settings?tab=legal#booking-policies-legal";

/** All active commerce signals for a tenant, sorted by priority. */
export function resolveCommerceSignals(
  input: CommerceBriefingInput & { capturedLabel?: string },
): CommerceSignal[] {
  const out: CommerceSignal[] = [];

  if (
    ownerHomeUncapturedDemand({
      paymentCount30d: input.paymentCount30d,
      demandBookings: input.demandBookings,
      weekBookings: input.weekBookings,
    })
  ) {
    out.push({
      id: "uncaptured_demand",
      severity: "act",
      title: "Demand without deposits",
      body: "Bookings are flowing but no payments were captured in the last 30 days. Turn on deposits, then run a test payment on your booking page.",
      href: COMMERCE_BILLING_FIX_HREF,
      priority: 1,
    });
  }

  if (
    ownerHomeCommerceNeedsAttention({
      captureRatePercent: input.captureRatePercent,
      paymentCount30d: input.paymentCount30d,
    })
  ) {
    out.push({
      id: "low_capture",
      severity: "act",
      title: "Low payment capture",
      body: `Only ${input.captureRatePercent}% of payment attempts succeeded — review deposit settings and failed cards.`,
      href: COMMERCE_BILLING_FIX_HREF,
      priority: 2,
    });
  }

  if (
    ownerHomeElevatedRefunds({
      refundMinor30d: input.refundMinor30d,
      capturedMinor30d: input.capturedMinor30d,
    })
  ) {
    out.push({
      id: "elevated_refunds",
      severity: "watch",
      title: "Elevated refunds",
      body: "Refund volume is high relative to captured revenue — spot-check recent cancellations and policy.",
      href: COMMERCE_BILLING_FIX_HREF,
      priority: 3,
    });
  }

  if (
    Math.max(0, input.paymentCount30d ?? 0) >= 3 &&
    Math.max(0, input.capturedMinor30d ?? 0) > 0 &&
    (input.captureRatePercent == null || input.captureRatePercent >= 70)
  ) {
    out.push({
      id: "strong_revenue",
      severity: "info",
      title: "Revenue on track",
      body: input.capturedLabel
        ? `${input.capturedLabel} captured in 30 days with healthy capture rate.`
        : "Payments are landing consistently this month.",
      href: COMMERCE_BILLING_HREF,
      priority: 9,
    });
  }

  return out.sort((a, b) => a.priority - b.priority);
}

export function commerceSignalsNeedOwnerAction(signals: CommerceSignal[]): boolean {
  return signals.some((s) => s.severity === "act");
}

export function topCommerceSignal(signals: CommerceSignal[]): CommerceSignal | null {
  return signals.find((s) => s.severity === "act") ?? signals[0] ?? null;
}
