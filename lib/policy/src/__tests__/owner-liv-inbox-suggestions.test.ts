import assert from "node:assert/strict";
import { ownerLivInboxSuggestions } from "../owner-liv-inbox-suggestions";

assert.deepEqual(
  ownerLivInboxSuggestions({ pendingCount: 2 }),
  [],
);

const commerce = ownerLivInboxSuggestions({
  hasCommerceActSignal: true,
  capabilityBlockers: 1,
});
assert.ok(commerce.length >= 2);

console.log("owner-liv-inbox-suggestions.test.ts OK");
