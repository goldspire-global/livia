import assert from "node:assert/strict";
import {
  buildNotificationDeepLinks,
  notificationFeedIcon,
  parseNotificationPrefs,
} from "../notification-policy";

const prefs = parseNotificationPrefs({});
assert.equal(prefs.pushTwinRisk, true);
assert.equal(prefs.pushTwinOpportunity, true);

const riskLinks = buildNotificationDeepLinks({
  kind: "twin.risk",
  businessId: "biz1",
});
assert.equal(riskLinks.href, "/dashboard");
assert.equal(riskLinks.mobileHref, "/(tabs)/index");
assert.equal(notificationFeedIcon("twin.risk"), "twin");

console.log("notification-policy-twin.test.ts OK");
