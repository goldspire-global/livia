import assert from "node:assert/strict";
import { resolvePublicBookLayoutDensity } from "../public-book-layout";

const small = resolvePublicBookLayoutDensity({
  staffCount: 3,
  serviceCount: 5,
  productCount: 2,
  staffPickerEnabled: true,
  shopEnabled: true,
});

assert.equal(small.showSectionNav, false);
assert.equal(small.catalogMode, "featured");
assert.equal(small.shopPlacement, "rail");
assert.equal(small.staffPicker, "strip");
assert.equal(small.teamAfterCatalog, false);

const medium = resolvePublicBookLayoutDensity({
  staffCount: 6,
  serviceCount: 10,
  productCount: 3,
  staffPickerEnabled: true,
  shopEnabled: true,
});

assert.equal(medium.showSectionNav, true);
assert.equal(medium.catalogMode, "expanded");
assert.equal(medium.staffPicker, "grid");
assert.equal(medium.teamAfterCatalog, true);
assert.deepEqual(medium.sections, ["treatments", "team", "shop"]);

const large = resolvePublicBookLayoutDensity({
  staffCount: 10,
  serviceCount: 20,
  productCount: 20,
  staffPickerEnabled: true,
  shopEnabled: true,
});

assert.equal(large.showSectionNav, true);
assert.equal(large.catalogMode, "filtered");
assert.equal(large.shopPlacement, "section");
assert.equal(large.staffPicker, "collapsible");
assert.equal(large.productPreviewLimit, 8);
assert.equal(large.teamAfterCatalog, true);

console.log("public-book-layout.test.ts: ok");
