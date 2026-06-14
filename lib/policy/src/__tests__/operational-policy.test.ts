import assert from "node:assert/strict";
import {
  DEFAULT_OPERATIONAL_POLICY,
  diffOperationalPolicy,
  explainOperationalPolicySummary,
  mergeOperationalPolicy,
  normalizeDepositPercent,
  parseOperationalPolicy,
} from "../operational-policy";

assert.equal(normalizeDepositPercent("020"), 20);
assert.equal(normalizeDepositPercent(20), 20);
assert.equal(parseOperationalPolicy({ depositPercent: "020" }).depositPercent, 20);

const summary = explainOperationalPolicySummary({
  operational: { ...DEFAULT_OPERATIONAL_POLICY, depositRequired: true, depositPercent: 20 },
  cancelWindowHours: 24,
  depositPolicySummary: "20% deposit for new clients.",
});
assert.ok(summary.headline.includes("20%"));
assert.ok(summary.bullets.some((b) => b.includes("24 hours")));

const proposed = mergeOperationalPolicy({ lateGraceMinutes: 15 }, DEFAULT_OPERATIONAL_POLICY);
const changes = diffOperationalPolicy(DEFAULT_OPERATIONAL_POLICY, proposed);
assert.equal(changes.length, 1);
assert.equal(changes[0]?.field, "lateGraceMinutes");

console.log("operational-policy.test.ts OK");
