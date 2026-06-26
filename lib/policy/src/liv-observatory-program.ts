/**
 * Liv observatory — usage cortex (what tenants DO).
 * Every domain-bus event maps here; policy decides signal vs learning pass.
 * Engineers emit domain events on mutations — no separate Liv opt-in.
 */
import type { LearningPassTriggerReason } from "./liv-learning-program";

export const LIV_OBSERVATORY_MODULE = "liv_observatory";

export const LIV_OBSERVATORY_POLICY_MODULES = [
  "liv-observatory-program.ts",
  "event-catalog.ts",
] as const;

/** Must cover every key in @workspace/event-bus eventRegistry (see observatory sync test). */
export const DOMAIN_BUS_EVENT_KEYS = [
  "booking.created",
  "booking.confirmed",
  "booking.cancelled",
  "booking.completed",
  "booking.rescheduled",
  "booking.no-show",
  "conversation.created",
  "conversation.updated",
  "voice.call.received",
  "voice.call.completed",
  "audit.event.recorded",
  "refund.proposed",
  "refund.approved",
  "refund.escalated",
  "time-off.proposed",
  "time-off.approved",
  "peer-set.aggregate.computed",
  "morning.briefing.ready",
  "payment.failed",
  "commerce.signal.detected",
  "twin.observation.generated",
  "twin.insight.generated",
  "twin.risk.detected",
  "twin.opportunity.detected",
  "eval.rollback.triggered",
  "liv.learning.correction.recorded",
  "liv.learning.override.recorded",
  "liv.learning.hypothesis.proposed",
] as const;

export type DomainBusEventKey = (typeof DOMAIN_BUS_EVENT_KEYS)[number];

export type ObservatorySignalPriority = "info" | "watch" | "act";

export type ObservatoryAction = {
  recordSignal: boolean;
  signalPriority: ObservatorySignalPriority;
  learningReason?: LearningPassTriggerReason;
};

const DEFAULT_ACTION: ObservatoryAction = {
  recordSignal: true,
  signalPriority: "info",
};

const EVENT_ACTIONS: Record<DomainBusEventKey, ObservatoryAction> = {
  "booking.created": { recordSignal: true, signalPriority: "watch" },
  "booking.confirmed": { recordSignal: true, signalPriority: "info" },
  "booking.cancelled": { recordSignal: true, signalPriority: "watch" },
  "booking.completed": {
    recordSignal: true,
    signalPriority: "watch",
    learningReason: "milestone_completed_bookings",
  },
  "booking.rescheduled": { recordSignal: true, signalPriority: "watch" },
  "booking.no-show": { recordSignal: true, signalPriority: "act" },
  "conversation.created": { recordSignal: true, signalPriority: "info" },
  "conversation.updated": { recordSignal: true, signalPriority: "watch" },
  "voice.call.received": { recordSignal: true, signalPriority: "watch" },
  "voice.call.completed": { recordSignal: true, signalPriority: "info" },
  "audit.event.recorded": { recordSignal: false, signalPriority: "info" },
  "refund.proposed": { recordSignal: true, signalPriority: "watch" },
  "refund.approved": { recordSignal: true, signalPriority: "info" },
  "refund.escalated": { recordSignal: true, signalPriority: "act" },
  "time-off.proposed": { recordSignal: true, signalPriority: "watch" },
  "time-off.approved": { recordSignal: true, signalPriority: "info" },
  "peer-set.aggregate.computed": { recordSignal: false, signalPriority: "info" },
  "morning.briefing.ready": { recordSignal: false, signalPriority: "info" },
  "payment.failed": { recordSignal: true, signalPriority: "act" },
  "commerce.signal.detected": { recordSignal: false, signalPriority: "act" },
  "twin.observation.generated": { recordSignal: false, signalPriority: "watch" },
  "twin.insight.generated": { recordSignal: false, signalPriority: "watch" },
  "twin.risk.detected": { recordSignal: false, signalPriority: "act" },
  "twin.opportunity.detected": { recordSignal: false, signalPriority: "watch" },
  "eval.rollback.triggered": { recordSignal: true, signalPriority: "act" },
  "liv.learning.correction.recorded": {
    recordSignal: true,
    signalPriority: "act",
    learningReason: "correction_recorded",
  },
  "liv.learning.override.recorded": {
    recordSignal: true,
    signalPriority: "watch",
    learningReason: "override_recorded",
  },
  "liv.learning.hypothesis.proposed": { recordSignal: true, signalPriority: "watch" },
};

export function listObservatoryCoveredEvents(): DomainBusEventKey[] {
  return [...DOMAIN_BUS_EVENT_KEYS];
}

export function resolveObservatoryAction(eventName: string): ObservatoryAction | null {
  if (!(DOMAIN_BUS_EVENT_KEYS as readonly string[]).includes(eventName)) {
    return null;
  }
  return EVENT_ACTIONS[eventName as DomainBusEventKey] ?? DEFAULT_ACTION;
}

export function formatObservatorySignalTitle(
  eventName: string,
  payload: Record<string, unknown>,
): string {
  const labels: Record<string, string> = {
    "booking.created": "New booking",
    "booking.completed": "Visit completed",
    "booking.cancelled": "Booking cancelled",
    "booking.rescheduled": "Booking rescheduled",
    "booking.no-show": "No-show recorded",
    "conversation.updated": "Inbox thread updated",
    "payment.failed": "Payment failed",
    "liv.learning.correction.recorded": "Liv correction logged",
    "liv.learning.override.recorded": "Staff override after Liv booking",
    "liv.learning.hypothesis.proposed": "New learning hypothesis",
    "eval.rollback.triggered": "Eval rollback triggered",
  };
  const base = labels[eventName] ?? eventName.replace(/\./g, " ");
  if (typeof payload.summary === "string" && payload.summary.trim()) {
    return `${base}: ${payload.summary.slice(0, 80)}`;
  }
  if (typeof payload.title === "string" && payload.title.trim()) {
    return payload.title.slice(0, 120);
  }
  return base;
}

export function formatObservatorySignalBody(
  eventName: string,
  payload: Record<string, unknown>,
): string {
  const parts: string[] = [`Event ${eventName}`];
  if (payload.bookingId) parts.push(`booking ${payload.bookingId}`);
  if (payload.conversationId) parts.push(`conversation ${payload.conversationId}`);
  if (payload.hypothesisId) parts.push(`hypothesis ${payload.hypothesisId}`);
  if (payload.signalId) parts.push(`signal ${payload.signalId}`);
  if (typeof payload.body === "string") parts.push(payload.body.slice(0, 160));
  return parts.join(" · ").slice(0, 240);
}

export function inferObservatoryEntity(
  eventName: string,
  payload: Record<string, unknown>,
): { entityType: string | null; entityId: string | null } {
  if (payload.bookingId) return { entityType: "booking", entityId: String(payload.bookingId) };
  if (payload.conversationId) {
    return { entityType: "conversation", entityId: String(payload.conversationId) };
  }
  if (payload.paymentId) return { entityType: "payment", entityId: String(payload.paymentId) };
  if (payload.hypothesisId) {
    return { entityType: "hypothesis", entityId: String(payload.hypothesisId) };
  }
  if (payload.ticketId) return { entityType: "support", entityId: String(payload.ticketId) };
  if (eventName.startsWith("twin.")) {
    return {
      entityType: "twin_observation",
      entityId: String(payload.observationKey ?? payload.riskId ?? payload.opportunityId ?? ""),
    };
  }
  return { entityType: null, entityId: null };
}

export function buildObservatoryPromptLines(
  signals: Array<{ title: string; body: string; eventName?: string | null; createdAt: string }>,
): string[] {
  return signals.slice(0, 8).map((s) => {
    const when = s.createdAt.slice(0, 10);
    const evt = s.eventName ? ` [${s.eventName}]` : "";
    return `${when}${evt}: ${s.title} — ${s.body}`.slice(0, 200);
  });
}

export function buildObservatoryPromptBlock(
  signals: Array<{ title: string; body: string; eventName?: string | null; createdAt: string }>,
): string {
  const lines = buildObservatoryPromptLines(signals);
  if (!lines.length) return "";
  return `\n\nRECENT PLATFORM ACTIVITY (auto-captured usage — ground recommendations in this):\n${lines.join("\n")}\n`;
}
