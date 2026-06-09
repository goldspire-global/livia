import assert from "node:assert/strict";
import { ownerIntelBadgesForNav, ownerIntelligenceNavBadges } from "../owner-intelligence-nav";

const badges = ownerIntelligenceNavBadges({
  remediationTasks: [{ severity: "act" }, { severity: "watch" }],
  commerce: { topSignal: { severity: "act" } },
  commerceCapabilityBlockers: [{ capabilityId: "payments" }],
  livPrompts: ["Review billing"],
});
assert.equal(badges.billingActCount, 3);
assert.equal(badges.homeActCount, 4);
assert.equal(badges.livActCount, 1);

const nav = ownerIntelBadgesForNav({
  commerceCapabilityBlockers: [{}],
});
assert.ok(nav["/settings"] >= 1);

console.log("owner-intelligence-nav.test.ts OK");
