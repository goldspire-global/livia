import assert from "node:assert/strict";
import {
  listMarketingDemoConciergeEntries,
  isMarketingDemoWedgeUnlocked,
} from "../marketing-demo-concierge";
import { listWedgeDemoVerticals } from "../wedge-demo-stories";

const entries = listMarketingDemoConciergeEntries();
assert.ok(entries.length >= 8, "concierge shows full pipeline");
assert.equal(entries[0].vertical, "beauty", "beauty leads the unlock pipeline");
assert.equal(entries[1].vertical, "wellness", "next wedge stacks beside beauty");

const wedgeVerticals = listWedgeDemoVerticals();
const unlocked = entries.filter((e) => e.unlocked);
assert.equal(unlocked.length, wedgeVerticals.length, "all demo verticals unlocked for beta");
for (const vertical of wedgeVerticals) {
  assert.ok(isMarketingDemoWedgeUnlocked(vertical), `${vertical} unlocked in /demo`);
}

console.log("marketing-demo-concierge.test.ts: ok");
