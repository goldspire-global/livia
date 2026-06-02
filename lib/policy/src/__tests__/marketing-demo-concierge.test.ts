import assert from "node:assert/strict";
import {
  listMarketingDemoConciergeEntries,
  MARKETING_DEMO_WEDGE_UNLOCK_ORDER,
  isMarketingDemoWedgeUnlocked,
} from "../marketing-demo-concierge";

const entries = listMarketingDemoConciergeEntries();
assert.ok(entries.length >= 8, "concierge shows full pipeline");
assert.equal(entries[0].vertical, "beauty", "beauty leads the unlock pipeline");
assert.equal(entries[1].vertical, "wellness", "next wedge stacks beside beauty");

const unlocked = entries.filter((e) => e.unlocked);
assert.equal(unlocked.length, MARKETING_DEMO_WEDGE_UNLOCK_ORDER.length);
assert.ok(isMarketingDemoWedgeUnlocked("beauty"));
assert.ok(!isMarketingDemoWedgeUnlocked("wellness"));
assert.ok(!isMarketingDemoWedgeUnlocked("medspa"));

console.log("marketing-demo-concierge.test.ts: ok");
