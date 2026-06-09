import assert from "node:assert/strict";
import {
  getSubverticalProfile,
  isMultiSegmentProfile,
  resolveOnboardingTierFromSubvertical,
  suggestedTierFromSubvertical,
} from "../subvertical-profiles";
import { getVerticalStarterPackServicesForProfile } from "../vertical-starter-packs";

const chairHost = getSubverticalProfile("hair.chair_rental")!;
assert.equal(suggestedTierFromSubvertical(chairHost), "chair-host");
assert.equal(
  resolveOnboardingTierFromSubvertical(chairHost, "solo", false),
  "chair-host",
);
assert.equal(resolveOnboardingTierFromSubvertical(chairHost, "chain", true), "chain");

const multiBeauty = getSubverticalProfile("beauty.multi")!;
assert.equal(isMultiSegmentProfile(multiBeauty), true);
const lashOnly = getSubverticalProfile("beauty.lash")!;
const multiServices = getVerticalStarterPackServicesForProfile("beauty", multiBeauty.id);
const lashServices = getVerticalStarterPackServicesForProfile("beauty", lashOnly.id);
assert.ok(multiServices.length > lashServices.length);

console.log("subvertical-profiles.test.ts — ok");
