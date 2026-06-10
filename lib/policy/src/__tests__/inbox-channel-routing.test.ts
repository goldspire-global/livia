import assert from "node:assert/strict";
import {
  inboxSiblingThreadsBanner,
  isLastInboundChannelFresh,
  modalityFromInboundChannel,
  resolveEffectivePreferredModality,
  LAST_INBOUND_CHANNEL_MAX_AGE_MS,
} from "../inbox-channel-routing";
const now = Date.parse("2026-06-05T12:00:00.000Z");

assert.equal(modalityFromInboundChannel("WHATSAPP"), "WHATSAPP");
assert.equal(modalityFromInboundChannel("MESSENGER"), "INSTAGRAM");
assert.equal(modalityFromInboundChannel("VOICE"), null);

assert.equal(
  isLastInboundChannelFresh(new Date(now - LAST_INBOUND_CHANNEL_MAX_AGE_MS + 1000), now),
  true,
);
assert.equal(
  isLastInboundChannelFresh(new Date(now - LAST_INBOUND_CHANNEL_MAX_AGE_MS - 1000), now),
  false,
);

assert.equal(
  resolveEffectivePreferredModality({
    preferredModality: "ANY",
    lastInboundChannel: "WHATSAPP",
    lastInboundAt: new Date(now - 24 * 60 * 60 * 1000),
    nowMs: now,
  }),
  "WHATSAPP",
);

assert.equal(
  resolveEffectivePreferredModality({
    preferredModality: "EMAIL",
    lastInboundChannel: "WHATSAPP",
    lastInboundAt: new Date(now - 1000),
    nowMs: now,
  }),
  "EMAIL",
);

assert.equal(
  inboxSiblingThreadsBanner([{ id: "a", channel: "WHATSAPP" }]),
  "This guest also has an open WhatsApp thread — switch below to reply there.",
);

console.log("inbox-channel-routing.test.ts: ok");
