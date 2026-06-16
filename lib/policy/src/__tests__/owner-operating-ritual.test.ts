import assert from "node:assert/strict";
import {
  classifyPendingBookingAttention,
  resolveOperatingPulse,
} from "../owner-operating-ritual";
import { PENDING_REASON_CODES } from "../booking-experience-copy";

assert.equal(
  classifyPendingBookingAttention(PENDING_REASON_CODES.AWAITING_DEPOSIT),
  "guest_action",
);
assert.equal(
  classifyPendingBookingAttention(PENDING_REASON_CODES.AWAITING_STAFF_CONFIRM),
  "needs_you",
);

const pulse = resolveOperatingPulse({
  pendingBookings: [
    { pendingReason: PENDING_REASON_CODES.AWAITING_DEPOSIT },
    { pendingReason: PENDING_REASON_CODES.AWAITING_STAFF_CONFIRM },
  ],
  inboxNeedsYou: 1,
  inboxHandedOff: 0,
  inboxLivHandling: 2,
});
assert.ok(pulse.needsYou >= 2);
assert.equal(pulse.guestAction, 1);
assert.ok(pulse.headline.includes("need"));

console.log("owner-operating-ritual.test.ts: ok");
