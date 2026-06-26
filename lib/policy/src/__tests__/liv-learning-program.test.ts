import assert from "node:assert/strict";
import {
  formatLivLearningMemory,
  parseLivLearningMemory,
  rankMemoryRowsForPrompt,
  resolveHypothesisEligibility,
  validateHypothesisDrafts,
  resolveLearningPassTrigger,
} from "../liv-learning-program";

const raw = formatLivLearningMemory({
  source: "correction",
  summary: "Tom prefers Conor only",
  entityType: "customer",
  entityId: "cust-1",
  ticketId: "t-1",
});
const parsed = parseLivLearningMemory(raw);
assert.equal(parsed?.source, "correction");
assert.equal(parsed?.summary, "Tom prefers Conor only");
assert.equal(parsed?.entityId, "cust-1");

const ranked = rankMemoryRowsForPrompt([
  { id: "a", kind: "note", content: "auto", createdBy: "liv" },
  {
    id: "b",
    kind: "procedural",
    content: formatLivLearningMemory({
      source: "correction",
      summary: "Staff fix",
    }),
    createdBy: "owner",
  },
]);
assert.equal(ranked[0]?.id, "b");

const rankedSupersede = rankMemoryRowsForPrompt([
  { id: "old", kind: "note", content: "old", createdBy: "liv" },
  {
    id: "new",
    kind: "preference",
    content: "new",
    createdBy: "staff",
    supersedesId: "old",
  },
]);
assert.deepEqual(
  rankedSupersede.map((r) => r.id),
  ["new"],
);

assert.equal(
  resolveHypothesisEligibility({
    daysActive: 3,
    completedBookings: 10,
    memoryRowCount: 0,
    existingHypothesisCount: 0,
  }).eligible,
  false,
);
assert.equal(
  resolveHypothesisEligibility({
    daysActive: 14,
    completedBookings: 8,
    memoryRowCount: 2,
    existingHypothesisCount: 0,
  }).eligible,
  true,
);

const allowed = new Set(["bookings.weekday.tue"]);
const drafts = validateHypothesisDrafts(
  [
    {
      title: "Tuesday walk-ins",
      summary: "Walk-ins cluster Tuesday afternoons",
      domain: "operational",
      confidence: "medium",
      evidenceKeys: ["bookings.weekday.tue", "fake.key"],
    },
    {
      title: "No evidence",
      summary: "Should drop",
      domain: "operational",
      confidence: "low",
      evidenceKeys: [],
    },
  ],
  allowed,
);
assert.equal(drafts.length, 1);
assert.deepEqual(drafts[0]?.evidenceKeys, ["bookings.weekday.tue"]);

assert.equal(
  resolveLearningPassTrigger({
    reason: "milestone_completed_bookings",
    completedBookings: 10,
    daysActive: 20,
    overrideCount30d: 0,
  }).shouldRun,
  true,
);
assert.equal(
  resolveLearningPassTrigger({
    reason: "correction_recorded",
    completedBookings: 2,
    daysActive: 20,
    overrideCount30d: 0,
  }).shouldRun,
  false,
);

console.log("liv-learning-program.test.ts ok");
