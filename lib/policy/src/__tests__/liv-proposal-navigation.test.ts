import assert from "node:assert/strict";
import {
  dedupeLivProposalsForDisplay,
  extractLivProposalNavigateHref,
  livProposalDedupeKey,
  livProposalDisplayTitle,
} from "../liv-proposal-navigation";

assert.equal(
  extractLivProposalNavigateHref(["commerce:open_billing:/settings?tab=billing"]),
  "/settings?tab=billing",
);
assert.equal(extractLivProposalNavigateHref(["booking:abc:cancelled"]), null);
assert.equal(extractLivProposalNavigateHref(undefined), null);

assert.equal(
  livProposalDisplayTitle({
    action: "collect_deposit",
    metadata: { title: "Turn on deposits" },
  }),
  "Turn on deposits",
);
assert.equal(
  livProposalDisplayTitle({
    action: "reply_inbox",
    metadata: { customerName: "Sam" },
    outcomePreview: null,
  }),
  "Inbox reply · Sam",
);

assert.equal(
  livProposalDedupeKey({
    action: "collect_deposit",
    resourceId: "uncaptured_demand",
    metadata: { title: "Turn on deposits" },
  }),
  "collect_deposit",
);

const deduped = dedupeLivProposalsForDisplay([
  {
    action: "collect_deposit",
    resourceId: "uncaptured_demand",
    metadata: { title: "Turn on deposits" },
  },
  {
    action: "collect_deposit",
    resourceId: "low_capture",
    metadata: { title: "Turn on deposits" },
  },
]);
assert.equal(deduped.length, 1);

console.log("liv-proposal-navigation.test.ts: ok");
