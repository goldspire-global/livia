#!/usr/bin/env node
/**
 * Innovation P0 full E2E — API smoke + Playwright guest/owner surfaces.
 *
 *   pnpm test:e2e:innovation-p0
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m && process.env[m[1].trim()] === undefined) {
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

function run(cmd, args, label) {
  console.log(`\n▶ ${label}`);
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });
  if (r.status !== 0) {
    console.error(`✗ ${label} failed (exit ${r.status})`);
    return false;
  }
  return true;
}

loadEnv();

console.log("\n══ Innovation P0 E2E ══\n");

let ok = run("pnpm", ["db:migrate:sql"], "Apply SQL migrations");
ok = run("node", ["scripts/provision-demo-if-needed.mjs"], "Ensure demo provisioned") && ok;
ok = run("node", ["scripts/innovation-p0-smoke.mjs"], "API smoke: innovation P0") && ok;

const apiBase = process.env.E2E_API_BASE ?? "http://127.0.0.1:3000";
const dashBase = process.env.E2E_DASHBOARD_BASE ?? "http://127.0.0.1:5173";

let dashOk = false;
try {
  const r = await fetch(dashBase, { signal: AbortSignal.timeout(5000) });
  dashOk = r.ok || r.status < 500;
} catch {
  dashOk = false;
}

if (dashOk) {
  ok =
    run(
      "pnpm",
      [
        "--filter",
        "@workspace/e2e",
        "exec",
        "playwright",
        "test",
        "--project=innovation-p0-e2e",
        "--project=guest-hub-smoke",
        "--project=dual-entry-uat",
        "--workers=1",
      ],
      "Playwright: innovation P0 + guest hub + dual entry",
    ) && ok;
} else {
  console.log("⊘ Skip Playwright — dashboard :5173 not running (API smoke still ran)");
}

if (!ok) process.exit(1);
console.log("\n✓ Innovation P0 E2E finished.\n");
