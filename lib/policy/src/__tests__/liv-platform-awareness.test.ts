import assert from "node:assert/strict";
import {
  buildPlatformAwarenessPromptBlock,
  compileLivToolsDigest,
  compilePlatformRouteDigest,
  compileVerticalCapabilityDigest,
  LIV_PLATFORM_AWARENESS_MODULE,
} from "../liv-platform-awareness-program";

assert.equal(LIV_PLATFORM_AWARENESS_MODULE, "liv_platform_awareness");

const routes = compilePlatformRouteDigest();
assert.ok(routes.length >= 5);
assert.ok(routes.some((r) => r.id === "owner-today"));

const hairCaps = compileVerticalCapabilityDigest("hair");
assert.ok(hairCaps.length >= 1);

const staffTools = compileLivToolsDigest("tenant_staff");
assert.ok(staffTools.some((t) => t.toolId === "send_message"));

const block = buildPlatformAwarenessPromptBlock({
  profile: "tenant_staff",
  vertical: "hair",
  tenantGraph: null,
});
assert.ok(block.includes("PLATFORM AWARENESS"));
assert.ok(block.includes("hair") || block.includes("Capability"));

const internalBlock = buildPlatformAwarenessPromptBlock({
  profile: "livia_internal",
  vertical: null,
  tenantGraph: null,
});
assert.ok(internalBlock.includes("internal operator"));

console.log("liv-platform-awareness.test.ts ok");
