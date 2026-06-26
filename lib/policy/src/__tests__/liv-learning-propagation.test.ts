import assert from "node:assert/strict";
import {
  LIV_LEARNING_POLICY_MODULES,
  LIV_LEARNING_SURFACE_IDS,
  LIV_LEARNING_MODULE,
  resolveLearningPassTrigger,
} from "../liv-learning-program";
import {
  capabilitiesAffectedByPolicyModule,
  surfacesAffectedByPolicyModule,
} from "../propagation";

for (const mod of LIV_LEARNING_POLICY_MODULES) {
  const caps = capabilitiesAffectedByPolicyModule(mod);
  assert.ok(caps.length > 0, `${mod} must map to at least one capability route`);
}

const surfaces = surfacesAffectedByPolicyModule("liv-learning-program.ts");
for (const expected of ["tenant.owner.dashboard", "internal.ops.support"]) {
  assert.ok(surfaces.includes(expected), `liv-learning must affect ${expected}`);
}

assert.equal(LIV_LEARNING_MODULE, "liv_learning");
assert.ok(LIV_LEARNING_SURFACE_IDS.length >= 4);

assert.equal(
  resolveLearningPassTrigger({
    reason: "correction_recorded",
    completedBookings: 5,
    daysActive: 14,
    overrideCount30d: 0,
  }).shouldRun,
  true,
);

assert.equal(
  resolveLearningPassTrigger({
    reason: "milestone_completed_bookings",
    completedBookings: 10,
    daysActive: 30,
    overrideCount30d: 0,
  }).shouldRun,
  true,
);

assert.equal(
  resolveLearningPassTrigger({
    reason: "milestone_completed_bookings",
    completedBookings: 7,
    daysActive: 30,
    overrideCount30d: 0,
  }).shouldRun,
  false,
);

console.log("liv-learning-propagation.test.ts ok");
