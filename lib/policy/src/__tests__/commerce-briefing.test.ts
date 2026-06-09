import assert from "node:assert/strict";
import {
  ownerHomeCommerceNeedsAttention,
  ownerHomeUncapturedDemand,
  ownerHomeElevatedRefunds,
  resolveCommerceOwnerBriefingCta,
  ownerHomeLivSuggestions,
} from "../commerce-briefing";

assert.equal(ownerHomeCommerceNeedsAttention({ captureRatePercent: 55, paymentCount30d: 4 }), true);
assert.equal(ownerHomeCommerceNeedsAttention({ captureRatePercent: 85, paymentCount30d: 4 }), false);

assert.equal(
  ownerHomeUncapturedDemand({ paymentCount30d: 0, demandBookings: 3, weekBookings: 2 }),
  true,
);
assert.equal(
  ownerHomeUncapturedDemand({ paymentCount30d: 2, demandBookings: 3, weekBookings: 2 }),
  false,
);

assert.equal(ownerHomeElevatedRefunds({ refundMinor30d: 2000, capturedMinor30d: 10000 }), true);
assert.equal(ownerHomeElevatedRefunds({ refundMinor30d: 500, capturedMinor30d: 10000 }), false);

assert.deepEqual(resolveCommerceOwnerBriefingCta({ paymentCount30d: 0, demandBookings: 4 }), {
  href: "/settings?tab=billing#commerce-fix",
  label: "Turn on deposits",
});

const suggestions = ownerHomeLivSuggestions({
  pendingCount: 2,
  handedOffCount: 0,
  commerce: { paymentCount30d: 0, demandBookings: 5 },
});
assert.equal(suggestions[0]?.id, "pending");
assert.ok(suggestions.some((s) => s.id === "commerce"));

console.log("commerce-briefing.test.ts OK");
