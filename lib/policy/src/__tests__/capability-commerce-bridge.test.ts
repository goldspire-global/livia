import assert from "node:assert/strict";
import { resolveCommerceCapabilityBlockers, isCommerceCapabilityId } from "../capability-commerce-bridge";

const blockers = resolveCommerceCapabilityBlockers([
  {
    id: "payments",
    name: "Payments",
    state: "installed",
    readinessBlockers: ["Connect Stripe"],
    readinessMet: false,
    v1: true,
    category: "commerce",
    description: "",
    livTools: [],
    events: [],
  },
]);
assert.equal(blockers.length, 1);
assert.equal(blockers[0]?.href, "/settings?tab=billing#commerce-fix");
assert.equal(isCommerceCapabilityId("payments"), true);
assert.equal(isCommerceCapabilityId("bookings"), false);

console.log("capability-commerce-bridge.test.ts: ok");
