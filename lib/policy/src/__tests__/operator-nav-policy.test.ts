import assert from "node:assert/strict";
import { activationStepsFromState } from "../onboarding-program";
import {
  filterActivationStepsForOperator,
  filterNavItemsByOperatorShape,
  isNavHrefAllowedForOperator,
  operatorNeedsWorkforceNav,
} from "../operator-nav-policy";

const soloOne = { tier: "solo", activeStaffCount: 1 };
const soloTwo = { tier: "solo", activeStaffCount: 2 };
const studio = { tier: "studio", activeStaffCount: 1 };

assert.equal(operatorNeedsWorkforceNav(soloOne), false);
assert.equal(operatorNeedsWorkforceNav(soloTwo), true);
assert.equal(operatorNeedsWorkforceNav(studio), true);

assert.equal(isNavHrefAllowedForOperator("/staff", soloOne), false);
assert.equal(isNavHrefAllowedForOperator("/rota", soloOne), false);
assert.equal(isNavHrefAllowedForOperator("/bookings", soloOne), true);
assert.equal(isNavHrefAllowedForOperator("/staff", soloTwo), true);

const nav = [
  { href: "/dashboard", label: "Today" },
  { href: "/staff", label: "Team" },
  { href: "/rota", label: "Rota" },
];
const soloNav = filterNavItemsByOperatorShape(nav, soloOne);
assert.equal(soloNav.length, 1);
assert.equal(soloNav[0]?.href, "/dashboard");

const steps = activationStepsFromState({ completedActs: [], percentComplete: 0, currentAct: "a2_shop_profile", checklist: {}, updatedAt: "" }, "hair");
const soloSteps = filterActivationStepsForOperator(steps, soloOne);
assert.ok(!soloSteps.some((s) => s.id === "team"));

console.log("operator-nav-policy.test.ts OK");
