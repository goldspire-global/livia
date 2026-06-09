import assert from "node:assert/strict";
import { buildCommerceRemediationTasks, resolveCommerceActPlaybook } from "../commerce-act-playbooks";

const pb = resolveCommerceActPlaybook("uncaptured_demand");
assert.equal(pb?.proposalAction, "collect_deposit");

const tasks = buildCommerceRemediationTasks([
  {
    id: "low_capture",
    severity: "act",
    title: "Low capture",
    body: "55%",
    href: "/settings?tab=billing",
    priority: 2,
  },
]);
assert.equal(tasks[0]?.signalId, "low_capture");
assert.ok(tasks[0]?.ownerPrompt.includes("capture"));

console.log("commerce-act-playbooks.test.ts OK");
