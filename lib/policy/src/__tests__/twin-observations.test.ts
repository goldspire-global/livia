import assert from "node:assert/strict";
import { resolveTwinObservationDrafts } from "../twin-observations";

const drafts = resolveTwinObservationDrafts({
  pendingCount: 4,
  todayBookings: 2,
  weekBookings: 8,
  handedOffCount: 0,
  sacredMetricMet: true,
  atRiskCount: 0,
  lowFeedbackCount: 0,
  commerceSignals: [
    {
      id: "low-capture",
      severity: "act",
      title: "Low capture",
      body: "Fix billing",
      href: "/settings?tab=billing",
    },
  ],
  paymentCount30d: 10,
  captureRatePercent: 45,
  capabilityBlockerCount: 0,
  capabilitySuspendedCount: 0,
  capabilityScore: 85,
  feedbackCount: 0,
  avgFeedback: null,
});

assert.ok(drafts.some((d) => d.observationKey === "operational:pending-backlog"));
assert.ok(drafts.some((d) => d.observationKey === "revenue:low-capture-rate"));
assert.ok(drafts.some((d) => d.observationKey === "revenue:commerce-low-capture"));

const keys = new Set(drafts.map((d) => d.observationKey));
assert.equal(keys.size, drafts.length, "observation keys must be unique within resolve");

console.log("twin-observations.test.ts OK");
