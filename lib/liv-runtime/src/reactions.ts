/**
 * Declarative map: domain events → Liv briefing / workflow hints.
 * Workflows (Inngest) own deterministic side effects; Liv owns narrative surfaces.
 */

export type LivReactionEventName =
  | "booking.created"
  | "booking.confirmed"
  | "booking.cancelled"
  | "booking.no-show"
  | "conversation.updated"
  | "morning.briefing.ready"
  | "payment.failed"
  | "commerce.signal.detected"
  | "twin.observation.generated"
  | "twin.insight.generated"
  | "twin.risk.detected"
  | "twin.opportunity.detected"
  | "eval.rollback.triggered"
  | "liv.learning.correction.recorded"
  | "liv.learning.override.recorded"
  | "liv.learning.hypothesis.proposed";

export type LivReactionKind =
  | "briefing_increment"
  | "coach_owner"
  | "pause_liv"
  | "internal_triage";

export type LivSignalPriority = "info" | "watch" | "act";

export type LivEventReaction = {
  event: LivReactionEventName;
  kind: LivReactionKind;
  templateKey: string;
  profiles: Array<"tenant" | "livia_internal">;
  /** Default moment priority when materialized as liv_signal */
  priority?: LivSignalPriority;
};

export const LIV_EVENT_REACTIONS: LivEventReaction[] = [
  {
    event: "booking.created",
    kind: "briefing_increment",
    templateKey: "booking.created.count",
    profiles: ["tenant"],
    priority: "info",
  },
  {
    event: "booking.confirmed",
    kind: "briefing_increment",
    templateKey: "booking.confirmed.count",
    profiles: ["tenant"],
    priority: "info",
  },
  {
    event: "booking.cancelled",
    kind: "briefing_increment",
    templateKey: "booking.cancelled.count",
    profiles: ["tenant"],
    priority: "watch",
  },
  {
    event: "booking.no-show",
    kind: "coach_owner",
    templateKey: "booking.no_show.recovery",
    profiles: ["tenant"],
    priority: "act",
  },
  {
    event: "conversation.updated",
    kind: "pause_liv",
    templateKey: "conversation.handed_off",
    profiles: ["tenant"],
    priority: "watch",
  },
  {
    event: "morning.briefing.ready",
    kind: "briefing_increment",
    templateKey: "morning.briefing",
    profiles: ["tenant"],
    priority: "info",
  },
  {
    event: "payment.failed",
    kind: "coach_owner",
    templateKey: "payment.failed",
    profiles: ["tenant"],
    priority: "watch",
  },
  {
    event: "commerce.signal.detected",
    kind: "coach_owner",
    templateKey: "commerce.signal",
    profiles: ["tenant"],
    priority: "act",
  },
  {
    event: "twin.observation.generated",
    kind: "coach_owner",
    templateKey: "twin.observation",
    profiles: ["tenant"],
    priority: "watch",
  },
  {
    event: "twin.insight.generated",
    kind: "coach_owner",
    templateKey: "twin.insight",
    profiles: ["tenant"],
    priority: "act",
  },
  {
    event: "twin.risk.detected",
    kind: "coach_owner",
    templateKey: "twin.risk",
    profiles: ["tenant"],
    priority: "act",
  },
  {
    event: "twin.opportunity.detected",
    kind: "coach_owner",
    templateKey: "twin.opportunity",
    profiles: ["tenant"],
    priority: "watch",
  },
  {
    event: "eval.rollback.triggered",
    kind: "internal_triage",
    templateKey: "eval.rollback",
    profiles: ["livia_internal"],
    priority: "act",
  },
  {
    event: "liv.learning.correction.recorded",
    kind: "coach_owner",
    templateKey: "liv.learning.correction",
    profiles: ["tenant"],
    priority: "watch",
  },
  {
    event: "liv.learning.override.recorded",
    kind: "briefing_increment",
    templateKey: "liv.learning.override",
    profiles: ["tenant"],
    priority: "info",
  },
  {
    event: "liv.learning.hypothesis.proposed",
    kind: "coach_owner",
    templateKey: "liv.learning.hypothesis",
    profiles: ["tenant"],
    priority: "watch",
  },
];

export function reactionsForEvent(
  event: LivReactionEventName,
  profile: "tenant" | "livia_internal",
): LivEventReaction[] {
  return LIV_EVENT_REACTIONS.filter((r) => r.event === event && r.profiles.includes(profile));
}

/** Map event-bus names to Liv reaction events (subset). */
export function domainEventToLivReaction(
  name: string,
): LivReactionEventName | null {
  const allowed: LivReactionEventName[] = [
    "booking.created",
    "booking.confirmed",
    "booking.cancelled",
    "booking.no-show",
    "conversation.updated",
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
  ];
  return allowed.includes(name as LivReactionEventName)
    ? (name as LivReactionEventName)
    : null;
}

