/**
 * Enrich flat analytics `events` rows for operator activity feeds.
 * @see docs/engineering/EVENT-TAXONOMY.md
 */

import { isCommerceCapabilityId } from "./capability-commerce-bridge";

export type ActivityFeedEnrichment = {
  label: string;
  detail?: string;
  href?: string;
  priority: "info" | "watch" | "act";
};

type ActivityContext = Record<string, unknown> | null | undefined;

function ctxString(ctx: ActivityContext, key: string): string | null {
  const v = ctx?.[key];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function ctxNumber(ctx: ActivityContext, key: string): number | null {
  const v = ctx?.[key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function enrichActivityFeedItem(args: {
  type: string;
  entityType?: string | null;
  entityId?: string | null;
  context?: ActivityContext;
}): ActivityFeedEnrichment {
  const ctx = args.context;
  const entityId = args.entityId ?? undefined;

  switch (args.type) {
    case "PAYMENT_FAILED": {
      const status = ctxString(ctx, "status");
      return {
        label: "Payment failed",
        detail: status ? `Card or checkout ${status.replace(/_/g, " ")}` : "A guest payment did not complete",
        href: "/settings?tab=billing",
        priority: "act",
      };
    }
    case "PAYMENT_SUCCEEDED":
      return {
        label: "Payment captured",
        detail: entityId ? `Payment ${entityId.slice(-8)}` : undefined,
        href: "/settings?tab=billing",
        priority: "info",
      };
    case "COMMERCE_SIGNAL_DETECTED": {
      const signalId = ctxString(ctx, "signalId") ?? entityId ?? "signal";
      const severity = ctxString(ctx, "severity");
      const titles: Record<string, string> = {
        uncaptured_demand: "Uncaptured demand — turn on deposits",
        low_capture: "Low payment capture rate",
        elevated_refunds: "Elevated refunds",
        strong_revenue: "Strong revenue signal",
      };
      return {
        label: titles[signalId] ?? "Commerce signal",
        detail: severity === "act" ? "Needs owner action in billing" : "Worth a look in billing",
        href: "/settings?tab=billing",
        priority: severity === "act" ? "act" : severity === "watch" ? "watch" : "info",
      };
    }
    case "TWIN_OBSERVATION_GENERATED":
    case "TWIN_INSIGHT_GENERATED": {
      const title = ctxString(ctx, "title");
      const domain = ctxString(ctx, "domain");
      const confidence = ctxString(ctx, "confidence");
      return {
        label: args.type === "TWIN_INSIGHT_GENERATED" ? "Twin insight" : "Twin observation",
        detail: title ?? (domain ? `${domain} domain` : undefined),
        href: "/dashboard",
        priority: confidence === "high" ? "act" : confidence === "medium" ? "watch" : "info",
      };
    }
    case "TWIN_RISK_DETECTED":
      return {
        label: "Risk detected",
        detail: ctxString(ctx, "domain") ? `${ctxString(ctx, "domain")} health` : undefined,
        href: "/dashboard",
        priority: "act",
      };
    case "TWIN_OPPORTUNITY_DETECTED":
      return {
        label: "Opportunity detected",
        detail: ctxString(ctx, "domain") ? `${ctxString(ctx, "domain")} upside` : undefined,
        href: "/dashboard",
        priority: "watch",
      };
    case "REFUND_CREATED":
      return {
        label: "Refund issued",
        detail: entityId ? `Refund ${entityId.slice(-8)}` : undefined,
        href: "/settings?tab=billing",
        priority: "watch",
      };
    case "BOOKING_CREATED":
    case "BOOKING_CONFIRMED":
    case "BOOKING_CANCELLED":
    case "BOOKING_COMPLETED":
    case "BOOKING_NO_SHOW": {
      const href = entityId ? `/bookings/${entityId}` : "/bookings";
      const labels: Record<string, string> = {
        BOOKING_CREATED: "New booking created",
        BOOKING_CONFIRMED: "Booking confirmed",
        BOOKING_CANCELLED: "Booking cancelled",
        BOOKING_COMPLETED: "Booking completed",
        BOOKING_NO_SHOW: "Customer no-show",
      };
      return {
        label: labels[args.type] ?? args.type.replace(/_/g, " ").toLowerCase(),
        href,
        priority: args.type === "BOOKING_NO_SHOW" ? "watch" : "info",
      };
    }
    case "CUSTOMER_CREATED":
      return {
        label: "New client added",
        href: entityId ? `/customers/${entityId}` : "/customers",
        priority: "info",
      };
    case "CUSTOMER_UPDATED":
      return {
        label: "Client profile updated",
        href: entityId ? `/customers/${entityId}` : "/customers",
        priority: "info",
      };
    case "MESSAGE_RECEIVED":
    case "MESSAGE_SENT":
      return {
        label: args.type === "MESSAGE_RECEIVED" ? "Inbox message received" : "Inbox reply sent",
        href: ctxString(ctx, "conversationId")
          ? `/inbox?conversation=${ctxString(ctx, "conversationId")}`
          : "/inbox",
        priority: "info",
      };
    case "CAPABILITY_STATE_CHANGED": {
      const capabilityId = ctxString(ctx, "capabilityId") ?? entityId ?? "capability";
      const from = ctxString(ctx, "from");
      const to = ctxString(ctx, "to");
      const commerce = isCommerceCapabilityId(capabilityId);
      const detail =
        from && to ? `${from.replace(/_/g, " ")} → ${to.replace(/_/g, " ")}` : undefined;
      return {
        label: commerce ? "Commerce capability changed" : "Capability readiness changed",
        detail,
        href: commerce ? "/settings?tab=billing" : "/settings?tab=liv",
        priority: commerce && to !== "active" && to !== "configured" ? "act" : "watch",
      };
    }
    case "ONBOARDING_ACT_COMPLETED":
      return {
        label: "Onboarding step completed",
        href: "/settings?tab=liv",
        priority: "info",
      };
    case "REVIEW_RECEIVED": {
      const score = ctxNumber(ctx, "score");
      return {
        label: "Client feedback received",
        detail: score != null ? `Score ${score}/5` : undefined,
        href: "/dashboard",
        priority: score != null && score <= 3 ? "watch" : "info",
      };
    }
    default:
      return {
        label: args.type.replace(/_/g, " ").toLowerCase(),
        priority: "info",
      };
  }
}
