import assert from "node:assert/strict";
import {
  LIV_PLATFORM_AWARENESS_MODULE,
  LIV_PLATFORM_AWARENESS_SURFACE_IDS,
} from "../liv-platform-awareness-program";
import {
  capabilitiesAffectedByPolicyModule,
  surfacesAffectedByPolicyModule,
} from "../propagation";

const caps = capabilitiesAffectedByPolicyModule("liv-platform-awareness-program.ts");
assert.ok(caps.length > 0, "liv-platform-awareness-program.ts must map to capability routes");

const surfaces = surfacesAffectedByPolicyModule("liv-platform-awareness-program.ts");
for (const expected of ["tenant.owner.dashboard", "guest.public.book", "internal.ops.support"]) {
  assert.ok(surfaces.includes(expected), `platform-awareness must affect ${expected}`);
}

assert.equal(LIV_PLATFORM_AWARENESS_MODULE, "liv_platform_awareness");
assert.ok(LIV_PLATFORM_AWARENESS_SURFACE_IDS.length >= 4);

console.log("liv-platform-awareness-propagation.test.ts ok");
