/**
 * GTM Wave 1 — Innovation P0 API smoke (no Playwright).
 *
 *   pnpm smoke:innovation-p0
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env");

function loadEnv() {
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

loadEnv();

const apiBase = (process.argv[2] ?? process.env.API_PUBLIC_URL ?? "http://localhost:3000").replace(
  /\/+$/,
  "",
);

const SHOWCASE = [
  "luxe-salon-spa",
  "bloom-beauty-dublin",
  "harbour-wellness-cork",
  "ink-anchor-galway",
  "clarity-medspa-dublin",
  "motion-physio-cork",
  "peak-fitness-dublin",
  "paws-parlour-dublin",
  "shine-studio-belfast",
];

const DEMO_PHONE = "+353 87 100 0001";
const MAGIC_OTP = process.env.LIVIA_STAGING_GUEST_OTP_MAGIC?.trim() || "000000";

let failed = 0;
const pass = (n, d = "") => console.log(`  [OK] ${n}${d ? ` — ${d}` : ""}`);
const fail = (n, d) => {
  failed += 1;
  console.log(`  [FAIL] ${n} — ${d}`);
};

console.log(`\nInnovation P0 smoke @ ${apiBase}\n`);

try {
  const h = await fetch(`${apiBase}/api/healthz`);
  if (!h.ok) fail("healthz", String(h.status));
  else pass("healthz");
} catch (e) {
  fail("healthz", e instanceof Error ? e.message : String(e));
}

for (const slug of SHOWCASE) {
  try {
    const r = await fetch(`${apiBase}/api/public/b/${slug}`);
    if (!r.ok) fail(`book ${slug}`, String(r.status));
    else pass(`book ${slug}`);
  } catch (e) {
    fail(`book ${slug}`, e instanceof Error ? e.message : String(e));
  }
}

try {
  const otpReq = await fetch(`${apiBase}/api/public/guest-hub/otp/request`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ phone: DEMO_PHONE, country: "IE" }),
  });
  if (!otpReq.ok) fail("hub otp", await otpReq.text());
  else {
    const otpBody = await otpReq.json();
    const { sessionToken, magicOtpCode, devOtp } = otpBody;
    const code = devOtp ?? magicOtpCode ?? MAGIC_OTP;
    const verify = await fetch(`${apiBase}/api/public/guest-hub/otp/verify`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionToken, code }),
    });
    if (!verify.ok) fail("hub verify", await verify.text());
    else {
      const { hubToken } = await verify.json();
      const me = await fetch(`${apiBase}/api/public/guest-hub/me`, {
        headers: { "X-Guest-Hub-Token": hubToken },
      });
      if (!me.ok) fail("hub /me", await me.text());
      else {
        const view = await me.json();
        const slugs = new Set((view.shops ?? []).map((s) => s.slug));
        const missing = SHOWCASE.filter((s) => !slugs.has(s));
        if (missing.length) fail("hub shops", `missing: ${missing.join(", ")}`);
        else pass("hub /me", `${slugs.size} shops`);
        for (const shop of view.shops ?? []) {
          if (String(shop.bookUrl).startsWith("/b/")) {
            fail("bookUrl legacy", shop.slug);
          }
          if (!String(shop.shopRelationshipUrl).includes(`/my/${shop.slug}`)) {
            fail("shopRelationshipUrl", shop.slug);
          }
        }
        if ((view.shops ?? []).every((s) => !String(s.bookUrl).startsWith("/b/"))) {
          pass("bookUrl not /b/");
        }
      }
    }
  }
} catch (e) {
  fail("hub flow", e instanceof Error ? e.message : String(e));
}

const tokenSurfaces = [
  ["ink-anchor-galway", "proof"],
  ["clarity-medspa-dublin", "intake"],
  ["peak-fitness-dublin", "waitlist"],
];
for (const [slug, surface] of tokenSurfaces) {
  try {
    const r = await fetch(`${apiBase}/api/demo/guest-surfaces/${slug}/${surface}`);
    if (!r.ok) fail(`demo ${surface} ${slug}`, String(r.status));
    else {
      const body = await r.json();
      if (!String(body.path).includes("/book/")) fail(`${surface} path`, body.path);
      else pass(`demo ${surface} ${slug}`);
    }
  } catch (e) {
    fail(`demo ${surface} ${slug}`, e instanceof Error ? e.message : String(e));
  }
}

try {
  const r = await fetch(`${apiBase}/api/public/b/peak-fitness-dublin/classes`);
  if (!r.ok) fail("fitness classes", String(r.status));
  else {
    const { classes } = await r.json();
    if (!Array.isArray(classes) || classes.length === 0) fail("fitness classes", "empty");
    else pass("fitness classes", `${classes.length} sessions`);
  }
} catch (e) {
  fail("fitness classes", e instanceof Error ? e.message : String(e));
}

try {
  const phone = encodeURIComponent(DEMO_PHONE);
  const r = await fetch(`${apiBase}/api/public/b/paws-parlour-dublin/guest-context?phone=${phone}`);
  if (!r.ok) fail("pet guest-context", String(r.status));
  else {
    const body = await r.json();
    if (!body.recognized || !(body.pets?.length > 0)) fail("pet guest-context", "no pets");
    else pass("pet guest-context", `${body.pets.length} pet(s)`);
  }
} catch (e) {
  fail("pet guest-context", e instanceof Error ? e.message : String(e));
}

if (failed) {
  console.log(`\n${failed} check(s) failed.\n`);
} else {
  console.log("\nAll innovation P0 API checks passed.\n");
}
process.exitCode = failed ? 1 : 0;
