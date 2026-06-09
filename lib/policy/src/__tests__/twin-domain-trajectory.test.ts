import assert from "node:assert/strict";
import {
  enrichTwinDomainsWithTrajectory,
  resolveTwinDomainTrajectory,
  TWIN_TRAJECTORY_COPY,
} from "../twin-domain-trajectory";

assert.equal(
  resolveTwinDomainTrajectory("revenue", { score: 42, riskCount: 1, opportunityCount: 0 }),
  "weakening",
);
assert.equal(
  resolveTwinDomainTrajectory("trust", { score: 82, riskCount: 0, opportunityCount: 1 }),
  "strengthening",
);
assert.equal(
  resolveTwinDomainTrajectory("operational", { score: 65, riskCount: 0, opportunityCount: 0 }),
  "stable",
);

const enriched = enrichTwinDomainsWithTrajectory({
  domains: [
    { domain: "revenue", score: 40 },
    { domain: "trust", score: 85 },
  ],
  risks: [{ domain: "revenue" }],
  opportunities: [{ domain: "trust" }],
});

assert.equal(enriched[0]?.trajectory, "weakening");
assert.equal(enriched[1]?.trajectory, "strengthening");
assert.ok(TWIN_TRAJECTORY_COPY.strengthening);

console.log("twin-domain-trajectory.test.ts OK");
