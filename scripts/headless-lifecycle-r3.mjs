#!/usr/bin/env node
/**
 * R3 headless lifecycle — R1 path + guest tokens + tenant support ticket.
 *
 *   node scripts/headless-lifecycle-r3.mjs
 *   pnpm headless:lifecycle:r3
 *
 * Prereqs: API running; demo provisioned; Clerk reachable for sign-in-business.
 */
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const apiIdx = args.indexOf("--api");
const apiBase = (apiIdx >= 0 ? args[apiIdx + 1] : process.env.E2E_API_BASE ?? "http://127.0.0.1:3000").replace(
  /\/+$/,
  "",
);

const GUEST_SURFACE_KINDS = ["proof", "intake", "pay", "waitlist"];
const GUEST_SLUGS = {
  proof: "ink-anchor-galway",
  intake: "clarity-medspa-dublin",
  pay: "luxe-salon-spa",
  waitlist: "peak-fitness-dublin",
};

async function check(label, url, expectOk = true) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    const ok = expectOk ? r.ok : r.status < 500;
    console.log(`${ok ? "✓" : "✗"} ${label} — ${r.status}`);
    return ok;
  } catch (e) {
    console.log(`✗ ${label} — ${e instanceof Error ? e.message : "failed"}`);
    return false;
  }
}

console.log(`\n▶ R3 headless lifecycle (extends R1) — API ${apiBase}\n`);

const r1 = spawnSync("node", ["scripts/headless-lifecycle-r1.mjs", "--api", apiBase], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});
let ok = r1.status === 0;

for (const kind of GUEST_SURFACE_KINDS) {
  const slug = GUEST_SLUGS[kind];
  ok = (await check(`Guest token ${kind}`, `${apiBase}/api/demo/guest-surfaces/${slug}/${kind}`)) && ok;
}

try {
  const signIn = await fetch(`${apiBase}/api/demo/sign-in-business`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug: "luxe-salon-spa" }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!signIn.ok) {
    console.log(`✗ Support ticket path — sign-in ${signIn.status}`);
    ok = false;
  } else {
    const { token, businessId } = await signIn.json();
    const create = await fetch(`${apiBase}/api/businesses/${businessId}/support/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        category: "bug",
        severity: "annoying",
        description: "Headless R3 lifecycle — inbox surface smoke ticket.",
        context: { surfaceId: "tenant.inbox", route: "/inbox" },
        consentLogsAccess: true,
      }),
      signal: AbortSignal.timeout(20_000),
    });
    const created = create.status === 201;
    console.log(`${created ? "✓" : "✗"} Tenant support ticket create — ${create.status}`);
    ok = created && ok;

    if (created) {
      const list = await fetch(`${apiBase}/api/businesses/${businessId}/support/tickets?status=open`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(15_000),
      });
      const listOk = list.ok;
      console.log(`${listOk ? "✓" : "✗"} Tenant support ticket list — ${list.status}`);
      ok = listOk && ok;
    }
  }
} catch (e) {
  console.log(`✗ Support ticket path — ${e instanceof Error ? e.message : "failed"}`);
  ok = false;
}

console.log(ok ? "\n✓ R3 headless lifecycle passed\n" : "\n✗ R3 headless lifecycle had failures\n");
process.exit(ok ? 0 : 1);
