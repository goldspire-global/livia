#!/usr/bin/env node
/**
 * Persona UAT probe — public + API paths without Clerk sign-in.
 *   node scripts/persona-uat-probe.mjs
 *   node scripts/persona-uat-probe.mjs --api https://api.livia-hq.com --app https://app.livia-hq.com --marketing https://livia-hq.com
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const appBase = (arg("--app") ?? "https://app.livia-hq.com").replace(/\/+$/, "");
const apiBase = (arg("--api") ?? "https://api.livia-hq.com").replace(/\/+$/, "");
const marketingBase = (arg("--marketing") ?? "https://livia-hq.com").replace(/\/+$/, "");

function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const DEMO_SLUGS = [
  "luxe-salon-spa",
  "clarity-medspa-dublin",
  "bloom-beauty-dublin",
  "harbour-wellness-cork",
  "peak-fitness-dublin",
];

const results = [];

async function probe(persona, name, fn) {
  try {
    const detail = await fn();
    results.push({ persona, name, ok: true, detail: detail ?? "ok" });
    console.log(`✓ [${persona}] ${name}${detail ? ` — ${detail}` : ""}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    results.push({ persona, name, ok: false, detail: msg });
    console.log(`✗ [${persona}] ${name} — ${msg}`);
  }
}

async function get(url, init) {
  const res = await fetch(url, { ...init, redirect: "manual" });
  const text = await res.text().catch(() => "");
  return { res, text };
}

console.log("\n══ Persona UAT probe ══\n");
console.log(`  marketing: ${marketingBase}`);
console.log(`  app:       ${appBase}`);
console.log(`  api:       ${apiBase}\n`);

await probe("platform", "API healthz", async () => {
  const { res, text } = await get(`${apiBase}/api/healthz`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (!text.includes("ok")) throw new Error(text.slice(0, 80));
  return "200";
});

for (const path of ["/", "/pricing", "/how-it-works", "/verticals", "/get-started", "/contact"]) {
  await probe("marketing", path, async () => {
    const { res } = await get(`${marketingBase}${path}`);
    if (res.status >= 400) throw new Error(`HTTP ${res.status}`);
    return String(res.status);
  });
}

for (const path of ["/sign-in", "/sign-up", "/demo", "/onboarding", "/my-livia", "/my"]) {
  await probe("founder/guest app", path, async () => {
    const { res } = await get(`${appBase}${path}`);
    if (res.status >= 400) throw new Error(`HTTP ${res.status}`);
    return String(res.status);
  });
}

await probe("gateway", "demo launcher shell", async () => {
  const { res, text } = await get(`${appBase}/demo`);
  if (!res.ok && res.status !== 302) throw new Error(`HTTP ${res.status}`);
  if (res.status === 302) return `redirect ${res.headers.get("location")?.slice(0, 60)}`;
  if (!text.includes("/assets/")) throw new Error("missing Vite bundle");
  return "200 SPA shell";
});

for (const slug of DEMO_SLUGS) {
  await probe("guest book", `/b/${slug}`, async () => {
    const { res, text } = await get(`${appBase}/b/${slug}`);
    if (res.status >= 400) throw new Error(`HTTP ${res.status}`);
    if (res.status >= 300 && res.status < 400) {
      return `redirect → ${res.headers.get("location")?.slice(0, 70)}`;
    }
    if (!text.includes("root") && text.length < 200) throw new Error("empty shell");
    return "200";
  });

  await probe("guest API", `public profile ${slug}`, async () => {
    const { res, text } = await get(`${apiBase}/api/public/businesses/${slug}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = JSON.parse(text);
    if (!json.slug || !json.name) throw new Error("missing business profile");
    return json.name;
  });
}

await probe("guest hub", "OTP request endpoint", async () => {
  const { res, text } = await get(`${apiBase}/api/public/guest-hub/otp/request`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ phone: "+353 87 100 0001", country: "IE" }),
  });
  if (res.status === 404) throw new Error("route missing");
  if (res.status === 201) return "201 OTP session created";
  if (res.status === 503) return "503 delivery not configured (route live)";
  if (res.status === 400) throw new Error(`bad request: ${text.slice(0, 80)}`);
  if (res.status >= 500) throw new Error(`HTTP ${res.status}`);
  return `HTTP ${res.status}`;
});

await probe("Liv", "public chat AI disclosure (first turn)", async () => {
  const { res, text } = await get(`${apiBase}/api/public/b/${DEMO_SLUGS[0]}/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: "Hello, I'd like to book" }),
  });
  if ([429, 503].includes(res.status)) return `${res.status} rate limit or AI unavailable`;
  if (res.status === 500) {
    const err = JSON.parse(text || "{}");
    if (String(err?.message ?? "").includes("Anthropic")) {
      return "500 AI provider unavailable (route live)";
    }
    throw new Error(`HTTP 500: ${text.slice(0, 80)}`);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 80)}`);
  const body = JSON.parse(text);
  if (!/AI assistant/i.test(String(body.reply ?? ""))) {
    throw new Error("first reply missing AI disclosure");
  }
  if (!body.conversationId) throw new Error("missing conversationId");
  return "disclosure in first reply";
});

const failed = results.filter((r) => !r.ok);
const byPersona = [...new Set(results.map((r) => r.persona))];
console.log("\n── Summary ──");
for (const p of byPersona) {
  const rows = results.filter((r) => r.persona === p);
  const bad = rows.filter((r) => !r.ok).length;
  console.log(`  ${p}: ${rows.length - bad}/${rows.length} pass`);
}
console.log(`\nTotal: ${results.length - failed.length}/${results.length} pass\n`);

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "artifacts");
mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, "persona-uat-report.json"),
  JSON.stringify({ at: new Date().toISOString(), appBase, apiBase, marketingBase, results }, null, 2),
);
console.log("Report: artifacts/persona-uat-report.json");

process.exit(failed.length ? 1 : 0);
