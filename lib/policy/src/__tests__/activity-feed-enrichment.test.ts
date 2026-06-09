import assert from "node:assert/strict";
import { enrichActivityFeedItem } from "../activity-feed-enrichment";

const paymentFailed = enrichActivityFeedItem({
  type: "PAYMENT_FAILED",
  entityId: "pi_abc",
  context: { status: "requires_payment_method" },
});
assert.equal(paymentFailed.href, "/settings?tab=billing");
assert.equal(paymentFailed.priority, "act");

const commerce = enrichActivityFeedItem({
  type: "COMMERCE_SIGNAL_DETECTED",
  entityId: "uncaptured_demand",
  context: { signalId: "uncaptured_demand", severity: "act" },
});
assert.match(commerce.label, /Uncaptured demand/);
assert.equal(commerce.priority, "act");

const booking = enrichActivityFeedItem({
  type: "BOOKING_CONFIRMED",
  entityId: "bk_123",
});
assert.equal(booking.href, "/bookings/bk_123");

const capCommerce = enrichActivityFeedItem({
  type: "CAPABILITY_STATE_CHANGED",
  entityId: "payments",
  context: { capabilityId: "payments", from: "installed", to: "configured" },
});
assert.equal(capCommerce.href, "/settings?tab=billing");
assert.equal(capCommerce.priority, "watch");

const capPaused = enrichActivityFeedItem({
  type: "CAPABILITY_STATE_CHANGED",
  entityId: "deposits",
  context: { capabilityId: "deposits", from: "active", to: "suspended" },
});
assert.equal(capPaused.priority, "act");

console.log("activity-feed-enrichment.test.ts: ok");
