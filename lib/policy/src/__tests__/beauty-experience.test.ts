import assert from "node:assert/strict";
import {
  BEAUTY_LOCKED_PRESET_IDS,
  resolveBeautyExperience,
  resolveBeautyPickerMeta,
  beautyLayoutMorphLabel,
} from "../beauty-experience";
import {
  listPresentationPresets,
  listPresentationPresetsForTenantPicker,
  PLATFORM_DEFAULT_PRESET_ID,
  resolvePresentationPreset,
} from "../presentation-presets";

assert.equal(resolvePresentationPreset("beauty", null).id, PLATFORM_DEFAULT_PRESET_ID);

const catalog = listPresentationPresets("beauty");
const picker = listPresentationPresetsForTenantPicker("beauty");
assert.equal(catalog.length, 5, "beauty catalog keeps locked presets");
assert.equal(picker.length, 3, "beauty picker shows platform-default + two shipped skins");
assert.deepEqual(
  picker.map((p) => p.id),
  [PLATFORM_DEFAULT_PRESET_ID, "beauty-soft-studio", "beauty-noir-dusk"],
  "beauty picker order: default, light, dark",
);

for (const locked of BEAUTY_LOCKED_PRESET_IDS) {
  assert.ok(catalog.some((p) => p.id === locked), `catalog retains ${locked}`);
  assert.ok(!picker.some((p) => p.id === locked), `picker hides ${locked}`);
}

assert.ok(resolveBeautyExperience("noir-dusk")?.picker.morph === "split-inbox");
assert.ok(resolveBeautyExperience("soft-studio")?.picker.morph === "atrium");
assert.equal(resolveBeautyPickerMeta(PLATFORM_DEFAULT_PRESET_ID)?.morph, "constellation");
assert.equal(beautyLayoutMorphLabel("split-inbox"), "Inbox-first Today");

console.log("beauty-experience.test.ts ok");
