#!/usr/bin/env node
/**
 * Deep UAT engineering gate — migrations, demo world, Clerk hygiene, API + Playwright.
 *
 *   pnpm uat:deep-gate
 *   pnpm uat:deep-gate -- --skip-clerk
 *   pnpm uat:deep-gate -- --skip-playwright
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const skipClerk = args.includes("--skip-clerk");
const skipPlaywright = args.includes("--skip-playwright");

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

function run(cmd, cmdArgs, label) {
  console.log(`\n▶ ${label}`);
  const r = spawnSync(cmd, cmdArgs, {
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

async function apiUp() {
  const base = process.env.E2E_API_BASE ?? "http://127.0.0.1:3000";
  try {
    const r = await fetch(`${base}/api/healthz`, { signal: AbortSignal.timeout(5000) });
    return r.ok;
  } catch {
    return false;
  }
}

async function dashUp() {
  const base = process.env.E2E_DASHBOARD_BASE ?? "http://127.0.0.1:5173";
  try {
    const r = await fetch(base, { signal: AbortSignal.timeout(5000) });
    return r.ok || r.status < 500;
  } catch {
    return false;
  }
}

loadEnv();

console.log("\n══ Livia deep UAT gate ══\n");

let ok = run("pnpm", ["db:migrate:sql"], "SQL migrations");
ok = run("pnpm", ["run", "typecheck"], "Typecheck") && ok;

if (!(await apiUp())) {
  console.error("\n✗ API not reachable — start: pnpm dev:api");
  process.exit(1);
}

if (!skipClerk) {
  ok = run("pnpm", ["demo:clerk-prune"], "Clerk prune (dry-run audit)") && ok;
  ok = run("pnpm", ["demo:clerk-prune", "--", "--execute"], "Clerk prune (execute)") && ok;
  ok = run("pnpm", ["demo:clerk-rebuild"], "Clerk rebuild official demo users") && ok;
}

ok = run("node", ["scripts/provision-demo-if-needed.mjs"], "Demo provision") && ok;
ok = run("node", ["scripts/innovation-p0-smoke.mjs"], "Innovation P0 API smoke") && ok;
ok = run("node", ["scripts/guest-hub-smoke.mjs"], "Guest hub API smoke") && ok;
ok = run("node", ["scripts/mobile-entry-smoke.mjs"], "Mobile entry API smoke") && ok;

if (!skipPlaywright && (await dashUp())) {
  ok =
    run(
      "pnpm",
      [
        "--filter",
        "@workspace/e2e",
        "exec",
        "playwright",
        "test",
        "--project=dual-entry-uat",
        "--project=innovation-p0-e2e",
        "--project=guest-hub-smoke",
        "--workers=1",
      ],
      "Playwright dual-entry + innovation P0",
    ) && ok;
} else if (!skipPlaywright) {
  console.log("⊘ Skip Playwright — dashboard :5173 not running");
}

if (!ok) process.exit(1);
console.log("\n✓ Deep UAT gate passed — see docs/testing/FINAL-UAT-WALKTHROUGH.md\n");
