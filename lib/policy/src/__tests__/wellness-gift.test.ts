import assert from "node:assert/strict";
import {
  isWellnessGiftPublicBookEnabled,
  WELLNESS_GIFT_PACKAGE_PRESETS,
  wellnessGiftConfirmLines,
} from "../wellness-gift";

assert.equal(isWellnessGiftPublicBookEnabled("wellness", null), true);
assert.equal(isWellnessGiftPublicBookEnabled("hair", null), false);
assert.ok(WELLNESS_GIFT_PACKAGE_PRESETS.length >= 2);
const lines = wellnessGiftConfirmLines("Maeve", "ABCD1234");
assert.ok(lines.some((l) => l.includes("ABCD1234")));

console.log("wellness-gift.test.ts ok");
