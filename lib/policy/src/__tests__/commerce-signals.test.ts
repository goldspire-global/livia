import assert from "node:assert/strict";
import { resolveCommerceSignals, topCommerceSignal } from "../commerce-signals";

const act = resolveCommerceSignals({
  paymentCount30d: 0,
  demandBookings: 4,
  weekBookings: 3,
});
assert.equal(act[0]?.id, "uncaptured_demand");
assert.equal(act[0]?.severity, "act");

const low = resolveCommerceSignals({
  paymentCount30d: 5,
  captureRatePercent: 55,
  capturedMinor30d: 50000,
});
assert.ok(low.some((s) => s.id === "low_capture"));

const top = topCommerceSignal(low);
assert.equal(top?.id, "low_capture");

console.log("commerce-signals.test.ts OK");
