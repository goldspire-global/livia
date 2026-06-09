import assert from "node:assert/strict";
import {
  resolveTwinRisksAndOpportunities,
  shouldPromoteTwinInsight,
} from "../twin-risks-opportunities";

assert.equal(
  shouldPromoteTwinInsight({
    observationKey: "revenue:low-capture-rate",
    domain: "revenue",
    title: "Low capture",
    body: "Fix billing",
    confidence: "high",
    evidence: [],
  }),
  true,
);

assert.equal(
  shouldPromoteTwinInsight({
    observationKey: "trust:strong-reputation",
    domain: "trust",
    title: "Strong",
    body: "Good",
    confidence: "medium",
    evidence: [],
  }),
  false,
);

const { risks, opportunities } = resolveTwinRisksAndOpportunities([
  {
    observationKey: "revenue:low-capture-rate",
    domain: "revenue",
    title: "Low capture",
    body: "Fix",
    confidence: "high",
  },
  {
    observationKey: "trust:strong-reputation",
    domain: "trust",
    title: "Strong feedback",
    body: "Ask for reviews",
    confidence: "medium",
  },
]);

assert.equal(risks.length, 1);
assert.equal(opportunities.length, 1);

console.log("twin-risks-opportunities.test.ts OK");
