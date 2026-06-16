import assert from "node:assert/strict";
import {
  evaluateEmergentTrustEligibility,
  buildEmergentTrustProposal,
  emergentTrustTwinObservation,
} from "../emergent-trust-program";

const eligible = {
  monthsActive: 12,
  completedBookings: 120,
  uniqueClients: 55,
  depositCaptureRatePercent: 88,
  repeatClientSharePercent: 35,
  noShowRatePercent: 4,
  trustProgramActive: false,
};

assert.equal(evaluateEmergentTrustEligibility(eligible), true);
assert.ok(buildEmergentTrustProposal(eligible)?.title.includes("Trusted"));
assert.ok(emergentTrustTwinObservation(eligible)?.observationKey.includes("trust"));

assert.equal(
  evaluateEmergentTrustEligibility({ ...eligible, monthsActive: 3 }),
  false,
  "too early for emergent trust",
);

console.log("emergent-trust-program.test.ts: ok");
