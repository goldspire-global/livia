import { chromium } from "@playwright/test";
import path from "node:path";
import { mkdirSync } from "node:fs";

const base = process.env.MARKETING_URL ?? "http://127.0.0.1:5174";
const out = path.resolve(import.meta.dirname, "..", "visual-captures", "marketing-mobile");
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
});

await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForSelector('[data-testid="marketing-home-hero"]');
await page.waitForTimeout(800);

await page.screenshot({ path: path.join(out, "hero-full.png"), fullPage: false });

const map = page.locator(".constellation-map__core");
await page.locator(".constellation-map__core").screenshot({ path: path.join(out, "hero-lv-core.png") });

const navMark = page.locator('[data-testid="marketing-nav-home"] svg, .marketing-w1-nav a svg').first();
if (await navMark.count()) {
  await navMark.screenshot({ path: path.join(out, "nav-lv-mark.png") });
}

const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await desktop.goto(`${base}/`, { waitUntil: "networkidle", timeout: 60_000 });
await desktop.waitForSelector('[data-testid="marketing-home-hero"]');
await desktop.waitForTimeout(800);
await desktop.locator(".constellation-map__core").screenshot({
  path: path.join(out, "hero-lv-core-desktop.png"),
});

await browser.close();
console.log(`Saved → ${out}`);
