import assert from "node:assert/strict";
import { scoreCapabilityGraphHealth } from "../capability-health-score";

assert.equal(scoreCapabilityGraphHealth({ total: 4, active: 4, configured: 0, installed: 0, suspended: 0, blockerCount: 0 }).grade, "A");
assert.ok(scoreCapabilityGraphHealth({ total: 4, active: 0, configured: 0, installed: 4, suspended: 0, blockerCount: 3 }).score < 50);

console.log("capability-health-score.test.ts OK");
