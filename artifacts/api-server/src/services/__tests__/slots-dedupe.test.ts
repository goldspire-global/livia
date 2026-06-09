import assert from "node:assert/strict";
import { dedupeSlotsByStartAt } from "../../lib/slot-dedupe";

const base = (startAt: string, available = true) => ({
  startAt,
  available,
});

const slots = [
  base("2026-06-06T08:30:00.000Z"),
  base("2026-06-06T08:30:00.000Z"),
  base("2026-06-06T09:00:00.000Z"),
  base("2026-06-06T09:00:00.000Z", false),
  base("2026-06-06T10:00:00.000Z"),
];

const deduped = dedupeSlotsByStartAt(slots);
assert.equal(deduped.length, 3);
assert.equal(deduped[0]?.startAt, "2026-06-06T08:30:00.000Z");
assert.equal(deduped[1]?.startAt, "2026-06-06T09:00:00.000Z");
assert.equal(deduped[1]?.available, true);
assert.equal(deduped[2]?.startAt, "2026-06-06T10:00:00.000Z");

console.log("slots-dedupe.test.ts: ok");
