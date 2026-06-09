#!/usr/bin/env node
/**
 * Capability graph CI — registry, resolution, instances, commerce bridge.
 *
 *   pnpm capability:check
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const apiServerCwd = join(root, "artifacts", "api-server");

function run(label, args) {
  console.log(`\n▶ ${label}`);
  const r = spawnSync("node", args, {
    cwd: apiServerCwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (r.status !== 0) {
    console.error(`✗ ${label} failed`);
    process.exit(r.status ?? 1);
  }
  console.log(`✓ ${label}`);
}

console.log("\n══ Capability check ══\n");

run("Capability registry", ["--import", "tsx/esm", "../../lib/policy/src/__tests__/capability-registry.test.ts"]);
run("Capability resolution", ["--import", "tsx/esm", "../../lib/policy/src/__tests__/capability-resolution.test.ts"]);
run("Capability instances", ["--import", "tsx/esm", "../../lib/policy/src/__tests__/capability-instances.test.ts"]);
run("Capability graph consistency", [
  "--import",
  "tsx/esm",
  "../../lib/policy/src/__tests__/capability-graph-consistency.test.ts",
]);
run("Capability commerce bridge", [
  "--import",
  "tsx/esm",
  "../../lib/policy/src/__tests__/capability-commerce-bridge.test.ts",
]);
run("Capability health score", [
  "--import",
  "tsx/esm",
  "../../lib/policy/src/__tests__/capability-health-score.test.ts",
]);
run("Capability nav gates", ["--import", "tsx/esm", "../../lib/policy/src/__tests__/capability-nav.test.ts"]);

console.log("\n✅ capability:check passed\n");
