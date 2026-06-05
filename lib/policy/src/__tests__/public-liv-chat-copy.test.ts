import assert from "node:assert/strict";
import { publicLivChatCopy, staffLivInboxSuggestions } from "../public-liv-chat-copy";

const wellness = publicLivChatCopy("wellness");
assert.ok(!wellness.suggestedPrompts.some((s) => /haircut|cut tomorrow/i.test(s)));
assert.ok(wellness.suggestedPrompts[0].includes("massage"));

const hair = publicLivChatCopy("hair");
assert.ok(hair.suggestedPrompts.some((s) => /cut/i.test(s)));

const inboxWellness = staffLivInboxSuggestions("wellness", null, "open");
assert.ok(inboxWellness.some((s) => /guest/i.test(s)));
assert.ok(!inboxWellness.some((s) => /client needs in one short/i.test(s)));

console.log("public-liv-chat-copy.test.ts ok");
