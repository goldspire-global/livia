import assert from "node:assert/strict";
import {
  CAPABILITY_REGISTRY,
  getCapabilityDefinition,
  listV1Capabilities,
} from "../capability-registry";

assert.ok(CAPABILITY_REGISTRY.length >= 6);

const bookings = getCapabilityDefinition("bookings");
assert.equal(bookings?.v1, true);
assert.ok(bookings?.livTools.includes("create_booking"));

const v1 = listV1Capabilities();
assert.ok(v1.every((c) => c.v1));
assert.ok(v1.some((c) => c.id === "bookings"));
assert.ok(v1.some((c) => c.id === "messaging"));

console.log("capability-registry.test.ts OK");
