import assert from "node:assert/strict";
import {
  buildCompactOwnerIntelligenceRows,
  ownerIntelligenceActSignalCount,
  ownerIntelligenceHasSurfaceContent,
} from "../owner-intelligence-home";

assert.equal(ownerIntelligenceHasSurfaceContent(null), false);
assert.equal(ownerIntelligenceHasSurfaceContent({}), false);
assert.ok(
  ownerIntelligenceHasSurfaceContent({
    commerce: { topSignal: { severity: "watch" } },
  }),
);
assert.ok(
  ownerIntelligenceHasSurfaceContent({
    capabilityHealth: { score: 70 },
  }),
);

assert.equal(
  ownerIntelligenceActSignalCount({
    remediationTasks: [{ severity: "act" }],
    commerce: { topSignal: { severity: "act" }, signals: [{ severity: "act" }] },
    commerceCapabilityBlockers: [{}],
  }),
  4,
);

assert.equal(
  ownerIntelligenceActSignalCount({
    twinRisks: [{ title: "a" }, { title: "b" }],
  }),
  2,
);

const compact = buildCompactOwnerIntelligenceRows({
  commerce: {
    topSignal: {
      id: "uncaptured_demand",
      severity: "act",
      title: "Demand without deposits",
      body: "Connect Stripe",
      href: "/settings?tab=billing#commerce-fix",
    },
  },
  remediationTasks: [
    {
      signalId: "uncaptured_demand",
      severity: "act",
      title: "Turn on deposits",
      body: "Bookings flowing",
      href: "/settings?tab=billing#commerce-fix",
    },
  ],
  twinRisks: [
    {
      id: "r1",
      title: "Demand without deposits",
      body: "Same signal",
      href: "/settings?tab=billing#commerce-fix",
    },
  ],
  twinObservations: [
    {
      id: "o1",
      title: "Confirmation backlog building",
      body: "5 pending",
      href: "/bookings?status=PENDING",
      severity: "act",
    },
  ],
});
assert.equal(compact.primary?.title, "Demand without deposits");
assert.equal(compact.more.length, 1);
assert.equal(compact.more[0]?.title, "Confirmation backlog building");

console.log("owner-intelligence-home.test.ts OK");
