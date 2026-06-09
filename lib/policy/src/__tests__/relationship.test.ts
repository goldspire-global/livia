import assert from "node:assert/strict";
import { deriveRelationshipSignals, relationshipStageLabel, atRiskStageFromDays, atRiskGuestHeadline } from "../relationship";

const trusted = deriveRelationshipSignals({
  totalBookings: 8,
  completedVisits: 6,
  daysSinceLastVisit: 14,
  hasUpcomingBooking: true,
  trustedClient: true,
  noShowCount: 0,
  conversationCount: 2,
  daysSinceLastMessage: 3,
});
assert.equal(trusted.stage, "trusted");
assert.equal(trusted.trajectory, "strengthening");

const lapsed = deriveRelationshipSignals({
  totalBookings: 4,
  completedVisits: 3,
  daysSinceLastVisit: 120,
  hasUpcomingBooking: false,
  trustedClient: false,
  noShowCount: 0,
  conversationCount: 0,
  daysSinceLastMessage: null,
});
assert.equal(lapsed.stage, "lapsed");
assert.equal(lapsed.trajectory, "weakening");

const prospect = deriveRelationshipSignals({
  totalBookings: 0,
  completedVisits: 0,
  daysSinceLastVisit: null,
  hasUpcomingBooking: false,
  trustedClient: false,
  noShowCount: 0,
  conversationCount: 0,
  daysSinceLastMessage: null,
});
assert.equal(prospect.stage, "prospect");
assert.equal(relationshipStageLabel("active"), "Active");

const stage = atRiskStageFromDays(75);
assert.equal(stage, "at_risk");
assert.ok(atRiskGuestHeadline("lapsed", "Jane Doe").includes("Jane"));

console.log("relationship.test.ts OK");
