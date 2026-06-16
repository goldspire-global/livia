import { derivePendingReason, PENDING_REASONS } from "../../lib/booking-pending";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const base = {
  aiCanBookDirectly: true,
  depositRequired: false,
  depositPaidEurCents: 0,
};

assert(
  derivePendingReason({
    ...base,
    source: "web",
    depositRequired: true,
    depositPaidEurCents: 0,
    bookingContinuityEnabled: true,
    customerHasPhone: true,
  }) === PENDING_REASONS.AWAITING_DEPOSIT,
  "deposits on → awaiting_deposit is the V1 gate",
);

assert(
  derivePendingReason({
    ...base,
    source: "web",
    bookingContinuityEnabled: true,
    customerHasPhone: true,
  }) === null,
  "continuity no longer blocks Liv auto-confirm at create",
);

assert(
  derivePendingReason({
    ...base,
    source: "web",
    bookingContinuityEnabled: false,
    customerHasPhone: true,
  }) === null,
  "web + Liv on → auto-confirm when deposit not required",
);

assert(
  derivePendingReason({
    ...base,
    source: "web",
    depositRequired: true,
    depositPaidEurCents: 2500,
  }) === null,
  "deposit paid → Liv auto-confirms",
);

assert(
  derivePendingReason({
    ...base,
    source: "web",
    aiCanBookDirectly: false,
    depositRequired: true,
    depositPaidEurCents: 2500,
  }) === PENDING_REASONS.AWAITING_STAFF_CONFIRM,
  "Liv direct booking off → human queue even after deposit",
);

assert(
  derivePendingReason({
    ...base,
    source: "walk-in",
    depositRequired: true,
    depositPaidEurCents: 2500,
  }) === PENDING_REASONS.OWNER_MANUAL,
  "walk-in → owner manual edge case",
);

console.log("booking-pending-continuity.test.ts: ok");
