#!/usr/bin/env node
/**
 * R3 engineering exit verification (no live API required).
 *
 *   pnpm r3:exit-verify
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(label, args) {
  console.log(`\n▶ ${label}`);
  const r = spawnSync("node", args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (r.status !== 0) {
    console.error(`✗ ${label} failed`);
    return false;
  }
  console.log(`✓ ${label}`);
  return true;
}

console.log("\n══ R3 engineering exit verify ══\n");

let ok = true;
ok = run("vertical:check", ["scripts/vertical-check.mjs"]) && ok;
ok = run("mobile:parity-audit", ["scripts/mobile-parity-audit.mjs"]) && ok;
ok = run("evolution:v3-check", ["scripts/evolution-v3-tier-check.mjs"]) && ok;
ok = run("gate2 evidence status", ["scripts/gate2-evidence-status.mjs"]) && ok;

console.log(
  ok
    ? "\n✅ R3 automated exit checks passed\n   Manual: pnpm headless:lifecycle:r3 (API + demo up)\n"
    : "\n❌ R3 exit verify failed\n",
);
process.exit(ok ? 0 : 1);
