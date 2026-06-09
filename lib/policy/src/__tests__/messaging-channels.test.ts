import assert from "node:assert/strict";
import {
  isOwnerConfiguredChannelId,
  isPlaceholderMessagingChannelId,
  ownerChannelIdForForm,
} from "../messaging-channels";

assert.equal(isPlaceholderMessagingChannelId("demo_wa_aurora"), true);
assert.equal(isPlaceholderMessagingChannelId("dev_wa_phone_id"), true);
assert.equal(isPlaceholderMessagingChannelId("123456789012345"), false);
assert.equal(isPlaceholderMessagingChannelId(""), true);

assert.equal(isOwnerConfiguredChannelId("demo_wa_aurora"), false);
assert.equal(isOwnerConfiguredChannelId("9876543210"), true);

assert.equal(ownerChannelIdForForm("demo_wa_aurora"), "");
assert.equal(ownerChannelIdForForm("9876543210"), "9876543210");

console.log("messaging-channels.test.ts OK");
