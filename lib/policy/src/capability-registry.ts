/**
 * Capability Graph registry — Volume C hub (Phase 1).
 * Vertical announcements and liv-tool-matrix should derive from here over time.
 * @see docs/engineering/CAPABILITY-GRAPH-SPEC.md
 */

export type CapabilityCategory =
  | "people"
  | "scheduling"
  | "commerce"
  | "communication"
  | "trust"
  | "intelligence";

export type CapabilityDefinition = {
  id: string;
  name: string;
  description: string;
  category: CapabilityCategory;
  dependencies: string[];
  /** Analytics / domain events this capability publishes */
  events: string[];
  /** Liv tools exposed when capability is active */
  livTools: string[];
  v1: boolean;
};

export const CAPABILITY_REGISTRY: CapabilityDefinition[] = [
  {
    id: "bookings",
    name: "Bookings",
    description: "Schedule appointments between customers, staff, and services",
    category: "scheduling",
    dependencies: [],
    events: ["BookingCreated", "BookingConfirmed", "BookingCancelled", "BookingCompleted"],
    livTools: ["create_booking", "cancel_booking", "reschedule_booking", "check_availability"],
    v1: true,
  },
  {
    id: "availability",
    name: "Availability",
    description: "Working hours, time off, and bookable slots",
    category: "scheduling",
    dependencies: ["bookings"],
    events: ["AvailabilityUpdated"],
    livTools: [],
    v1: true,
  },
  {
    id: "payments",
    name: "Payments",
    description: "Stripe deposits and booking payments",
    category: "commerce",
    dependencies: ["bookings"],
    events: ["PaymentCaptured", "PaymentFailed"],
    livTools: [],
    v1: true,
  },
  {
    id: "messaging",
    name: "Messaging",
    description: "Unified inbox across SMS, email, and social channels",
    category: "communication",
    dependencies: [],
    events: ["MessageSent", "ConversationCreated"],
    livTools: ["send_message"],
    v1: true,
  },
  {
    id: "reviews",
    name: "Reviews",
    description: "Collect and display customer trust signals",
    category: "trust",
    dependencies: ["bookings"],
    events: ["ReviewReceived"],
    livTools: ["request_review"],
    v1: true,
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Showcase work and proof on public booking page",
    category: "trust",
    dependencies: [],
    events: [],
    livTools: [],
    v1: true,
  },
  {
    id: "deposits",
    name: "Deposits",
    description: "Upfront commitment payments to reduce no-shows",
    category: "commerce",
    dependencies: ["payments", "bookings"],
    events: ["DepositPaid", "DepositRefunded"],
    livTools: ["request_deposit"],
    v1: false,
  },
  {
    id: "memberships",
    name: "Memberships",
    description: "Recurring client plans and session packages",
    category: "commerce",
    dependencies: ["payments", "bookings"],
    events: ["SubscriptionCreated"],
    livTools: [],
    v1: false,
  },
];

const byId = new Map(CAPABILITY_REGISTRY.map((c) => [c.id, c]));

export function getCapabilityDefinition(id: string): CapabilityDefinition | undefined {
  return byId.get(id);
}

export function listV1Capabilities(): CapabilityDefinition[] {
  return CAPABILITY_REGISTRY.filter((c) => c.v1);
}

export function listCapabilitiesForVertical(requiredIds: string[]): CapabilityDefinition[] {
  return requiredIds
    .map((id) => byId.get(id))
    .filter((c): c is CapabilityDefinition => c != null);
}
