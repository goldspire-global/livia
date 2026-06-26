import assert from "node:assert/strict";
import {
  DOMAIN_BUS_EVENT_KEYS,
  formatObservatorySignalTitle,
  listObservatoryCoveredEvents,
  resolveObservatoryAction,
} from "../liv-observatory-program";

assert.equal(DOMAIN_BUS_EVENT_KEYS.length, listObservatoryCoveredEvents().length);

const completed = resolveObservatoryAction("booking.completed");
assert.equal(completed?.learningReason, "milestone_completed_bookings");
assert.equal(completed?.recordSignal, true);

const correction = resolveObservatoryAction("liv.learning.correction.recorded");
assert.equal(correction?.learningReason, "correction_recorded");

const twin = resolveObservatoryAction("twin.observation.generated");
assert.equal(twin?.recordSignal, false);

assert.equal(resolveObservatoryAction("unknown.event"), null);

const title = formatObservatorySignalTitle("booking.completed", {
  bookingId: "b-1",
});
assert.ok(title.length > 0);

console.log("liv-observatory-program.test.ts ok");
