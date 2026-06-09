import assert from "node:assert/strict";
import { buildMorningBriefingIntelHighlights } from "../morning-briefing-intel";

const commerceIntel = buildMorningBriefingIntelHighlights({
  commerceSignals: [
    {
      id: "low_capture",
      title: "Low capture",
      severity: "act",
      body: "Review deposits",
    },
  ],
  capabilityHealth: {
    score: 55,
    grade: "D",
    headline: "2 blockers",
  },
});

assert.equal(commerceIntel.length, 2);
assert.ok(commerceIntel[0]?.includes("Low capture"));

const twinIntel = buildMorningBriefingIntelHighlights({
  commerceSignals: [],
  twinRisks: [{ title: "Retention dip", body: "Repeat visits down 12%" }],
  twinOpportunities: [{ title: "Upsell window", body: "Package attach rate low" }],
  twinObservations: [{ title: "Peak hour strain", body: "Saturday 11am", domain: "Scheduling" }],
});

assert.ok(twinIntel.some((h) => h.startsWith("Risk:")));
assert.ok(twinIntel.some((h) => h.startsWith("Opportunity:")));

const headlineFallback = buildMorningBriefingIntelHighlights({
  commerceSignals: [],
  twinHeadline: "Steady week ahead",
  twinSubline: "No urgent commerce signals",
});

assert.equal(headlineFallback.length, 1);
assert.ok(headlineFallback[0]?.includes("Steady week ahead"));

console.log("morning-briefing-intel.test.ts OK");
