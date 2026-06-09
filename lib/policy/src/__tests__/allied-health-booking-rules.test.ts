import assert from "node:assert/strict";
import test from "node:test";
import {
  groupAlliedServicesByKind,
  inferAlliedServiceKind,
} from "../allied-health-booking-rules";

test("inferAlliedServiceKind detects assessment vs follow-up", () => {
  assert.equal(inferAlliedServiceKind("Initial physiotherapy assessment"), "initial_assessment");
  assert.equal(inferAlliedServiceKind("Follow-up session"), "follow_up");
  assert.equal(inferAlliedServiceKind("Sports screening"), "sports_screen");
});

test("groupAlliedServicesByKind orders assessment before follow-up", () => {
  const groups = groupAlliedServicesByKind([
    { name: "Follow-up", category: null },
    { name: "Initial assessment", category: null },
  ]);
  assert.equal(groups[0]?.kind, "initial_assessment");
  assert.equal(groups[1]?.kind, "follow_up");
});
