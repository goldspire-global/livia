import assert from "node:assert/strict";
import { businessVerticalSchema } from "../types";
import {
  PLATFORM_DEFAULT_VERTICAL_ATTRIBUTES,
  validateVerticalAnnouncement,
  welcomeVerticalAnnouncement,
} from "../vertical-announcement";

for (const vertical of businessVerticalSchema.options) {
  const v = validateVerticalAnnouncement(vertical);
  assert.equal(v.ok, true, `${vertical}: ${v.missingDefaults.join(", ")} ${v.handshakeErrors.join("; ")}`);
  const welcomed = welcomeVerticalAnnouncement(vertical);
  assert.equal(welcomed.welcomed, true, vertical);
  assert.equal(
    welcomed.satisfiedDefaults.length,
    PLATFORM_DEFAULT_VERTICAL_ATTRIBUTES.length,
    vertical,
  );
}

const wellness = welcomeVerticalAnnouncement("wellness");
assert.equal(wellness.operatorShell, "wellness-full-nav");
assert.equal(wellness.roomBoard.mode, "resource-linked");
assert.ok(wellness.readyCapabilities.some((c) => c.id === "gift-public-book"));
assert.ok(wellness.readyCapabilities.some((c) => c.id === "room-board-schedule"));
assert.ok(wellness.readyCapabilities.some((c) => c.id === "wellness-reports"));

const beauty = welcomeVerticalAnnouncement("beauty");
assert.equal(beauty.operatorShell, "beauty-inbox-nav");
assert.ok(beauty.readyCapabilities.some((c) => c.id === "treatment-menu-setup"));
const beautyExt = beauty.extensions.beauty as { menuSetupRequired?: boolean };
assert.equal(beautyExt.menuSetupRequired, true);

console.log("vertical-announcement.test.ts ok");
