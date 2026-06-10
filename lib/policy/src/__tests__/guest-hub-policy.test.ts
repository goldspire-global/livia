import assert from "node:assert/strict";
import { curateGuestHubUpcoming, GUEST_HUB_DEMO_BOOKING_NOTE } from "../guest-hub-policy";
import { resolveBookingCreatedNotificationPlan } from "../notification-policy";

const rows = [
  {
    bookingId: "a",
    businessId: "b1",
    startAt: "2026-06-10T10:00:00.000Z",
    notes: null,
  },
  {
    bookingId: "b",
    businessId: "b1",
    startAt: "2026-06-25T10:00:00.000Z",
    notes: GUEST_HUB_DEMO_BOOKING_NOTE,
  },
  {
    bookingId: "c",
    businessId: "b2",
    startAt: "2026-06-10T11:00:00.000Z",
    notes: null,
  },
];

const curated = curateGuestHubUpcoming(rows);
assert.equal(curated.length, 2);
assert.equal(curated.find((r) => r.businessId === "b1")?.bookingId, "b");

const pending = resolveBookingCreatedNotificationPlan({
  status: "PENDING",
  startAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
});
assert.equal(pending.sendPush, true);
assert.equal(pending.priority, "act");

const far = resolveBookingCreatedNotificationPlan({
  status: "CONFIRMED",
  startAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
});
assert.equal(far.sendPush, false);
assert.equal(far.digestBucket, "evening_roundup");

const tomorrow = resolveBookingCreatedNotificationPlan({
  status: "CONFIRMED",
  startAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
});
assert.equal(tomorrow.sendPush, true);

console.log("guest-hub-policy.test.ts OK");
