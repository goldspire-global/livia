import assert from "node:assert/strict";
import {
  ownerLivOpsDynamicSuggestions,
  resolveOwnerPresenceIntelLine,
} from "../owner-presence-intel";

assert.equal(
  resolveOwnerPresenceIntelLine({
    pending: 1,
    open: 0,
    intel: { commerceTopSignal: { title: "Turn on deposits", href: "/b", severity: "act" } },
  }),
  null,
);

assert.equal(
  resolveOwnerPresenceIntelLine({
    pending: 0,
    open: 0,
    intel: {
      commerceTopSignal: { title: "Turn on deposits", href: "/b", severity: "act" },
    },
  }),
  "Turn on deposits",
);

const suggestions = ownerLivOpsDynamicSuggestions({
  remediationTasks: [{ title: "Fix capture", ownerPrompt: "Why is capture low?" }],
});
assert.ok(suggestions[0]?.includes("capture"));

console.log("owner-presence-intel.test.ts: ok");
