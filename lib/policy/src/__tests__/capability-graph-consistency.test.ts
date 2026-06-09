import assert from "node:assert/strict";
import { REQUIRED_BUSINESS_VERTICALS } from "../vertical-pack-factory";
import {
  CAPABILITY_REGISTRY,
  getCapabilityDefinition,
} from "../capability-registry";
import { VERTICAL_PLATFORM_CAPABILITY_MAP } from "../capability-resolution";
import { isCommerceCapabilityId } from "../capability-commerce-bridge";

const registryIds = new Set(CAPABILITY_REGISTRY.map((c) => c.id));

for (const vertical of REQUIRED_BUSINESS_VERTICALS) {
  const ids = VERTICAL_PLATFORM_CAPABILITY_MAP[vertical] ?? [];
  for (const id of ids) {
    assert.ok(registryIds.has(id), `${vertical} maps unknown capability ${id}`);
    assert.ok(getCapabilityDefinition(id), `${vertical} capability ${id} missing definition`);
  }
}

const commerceCaps = CAPABILITY_REGISTRY.filter((c) => c.category === "commerce");
assert.ok(commerceCaps.length >= 2);
assert.ok(isCommerceCapabilityId("payments"));

console.log("capability-graph-consistency.test.ts OK");
