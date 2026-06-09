import assert from "node:assert/strict";
import {
  domainEventToLivReaction,
  reactionsForEvent,
} from "@workspace/liv-runtime";

assert.equal(domainEventToLivReaction("booking.created"), "booking.created");
assert.equal(domainEventToLivReaction("booking.confirmed"), "booking.confirmed");
assert.equal(domainEventToLivReaction("booking.no-show"), "booking.no-show");
assert.equal(domainEventToLivReaction("voice.call.completed"), null);

assert.equal(domainEventToLivReaction("commerce.signal.detected"), "commerce.signal.detected");
assert.equal(domainEventToLivReaction("twin.observation.generated"), "twin.observation.generated");
assert.equal(domainEventToLivReaction("twin.insight.generated"), "twin.insight.generated");

const twinObs = reactionsForEvent("twin.observation.generated", "tenant");
assert.ok(twinObs.some((x) => x.kind === "coach_owner"));

const noShow = reactionsForEvent("booking.no-show", "tenant");
assert.ok(noShow.some((x) => x.kind === "coach_owner"));
assert.equal(noShow[0]?.priority, "act");

const handoff = reactionsForEvent("conversation.updated", "tenant");
assert.equal(handoff[0]?.kind, "pause_liv");

console.log("liv-reactions.test.ts: ok");
