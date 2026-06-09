import assert from "node:assert/strict";
import {
  assertAnalyticsEventCatalogComplete,
  catalogCoverageReport,
  listUncataloguedAnalyticsTypes,
  validateAnalyticsEventType,
} from "../analytics-event-bridge";

assertAnalyticsEventCatalogComplete();

const booking = validateAnalyticsEventType("BOOKING_CREATED");
assert.equal(booking.catalogued, true);
assert.equal(booking.entry?.name, "BookingCreated");

const ops = validateAnalyticsEventType("AI_OBSERVATION_CREATED");
assert.equal(ops.catalogued, true);
assert.equal(ops.opsOnly, true);

const missing = listUncataloguedAnalyticsTypes();
assert.equal(missing.length, 0, `uncatalogued: ${missing.join(", ")}`);

const report = catalogCoverageReport();
assert.ok(report.catalogEntries >= 20);
assert.ok(report.analyticsMapped >= 15);
assert.ok(report.v1Required >= 1);

console.log("analytics-event-bridge.test.ts OK");
