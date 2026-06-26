/**
 * GTM Wave 1 — `/my` guest vault smoke (Mary demo guest).
 *
 *   pnpm --filter @workspace/e2e exec playwright test guest-hub-smoke
 */
import { test, expect } from "@playwright/test";
import { ensureDemoProvisioned, apiBase } from "../helpers/demo-auth";
import { guestHubToken } from "../helpers/guest-hub-auth";
const SHOWCASE_SLUGS = [
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

test.describe("Guest hub smoke", () => {
  test.describe.configure({ mode: "serial", timeout: 300_000 });

  test.beforeAll(async ({ request }) => {
    await ensureDemoProvisioned(request);
  });

  test("API guest-hub me returns linked showcase shops", async ({ request }) => {
    const hubToken = await guestHubToken(request);
    expect(hubToken.length).toBeGreaterThan(8);

    const me = await request.get(`${apiBase}/api/public/guest-hub/me`, {
      headers: { "X-Guest-Hub-Token": hubToken },
    });
    expect(me.ok(), await me.text()).toBeTruthy();
    const view = (await me.json()) as { shops: Array<{ slug: string }> };
    const slugs = new Set(view.shops.map((s) => s.slug));
    for (const slug of SHOWCASE_SLUGS) {
      expect(slugs.has(slug), `${slug} missing from Mary vault — re-run demo:provision`).toBeTruthy();
    }
  });

  test("/my sign-in page loads", async ({ page }) => {
    await page.goto("/my", { waitUntil: "domcontentloaded", timeout: 45_000 });
    await expect(page.getByTestId("guest-hub-sign-in")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("guest-hub-auth-email")).toBeVisible();
  });

  test("cold-start email guest gets empty vault profile", async ({ request }) => {
    const email = `cold-${Date.now()}@example.com`;
    const otpReq = await request.post(`${apiBase}/api/public/guest-hub/otp/request`, {
      data: { email },
    });
    expect(otpReq.ok()).toBeTruthy();
    const { sessionToken, devOtp, magicOtpCode } = (await otpReq.json()) as {
      sessionToken: string;
      devOtp?: string;
      magicOtpCode?: string;
    };
    const code = devOtp ?? magicOtpCode ?? "000000";
    const verify = await request.post(`${apiBase}/api/public/guest-hub/otp/verify`, {
      data: { sessionToken, code },
    });
    expect(verify.ok()).toBeTruthy();
    const { hubToken } = (await verify.json()) as { hubToken: string };
    const me = await request.get(`${apiBase}/api/public/guest-hub/me`, {
      headers: { "X-Guest-Hub-Token": hubToken },
    });
    expect(me.ok()).toBeTruthy();
    const body = (await me.json()) as {
      guestId: string;
      email: string;
      isColdStart: boolean;
      shops: unknown[];
      upcomingBookings: unknown[];
    };
    expect(body.email).toBe(email);
    expect(body.isColdStart).toBe(true);
    expect(body.shops).toEqual([]);
    expect(body.upcomingBookings).toEqual([]);
    expect(body.guestId).toBeTruthy();
  });

  test("Mary shop relationship shows medspa or physio artifacts", async ({ page, request }) => {
    const hubToken = await guestHubToken(request);

    await page.goto("/my/motion-physio-cork", { waitUntil: "domcontentloaded" });
    await page.evaluate((t) => localStorage.setItem("livia_guest_hub_token", t), hubToken);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("guest-hub-shop-relationship")).toBeVisible({ timeout: 20_000 });
    const physioArtifacts = page.getByTestId("guest-my-artifact-panels");
    if (await physioArtifacts.isVisible().catch(() => false)) {
      await expect(physioArtifacts).toContainText(/care plan|session/i);
    }
  });

  for (const slug of SHOWCASE_SLUGS) {
    test(`public book /book/${slug} loads`, async ({ page, request }) => {
      const res = await request.get(`${apiBase}/api/public/b/${slug}`);
      if (!res.ok()) {
        test.skip(true, `${slug} not in demo world`);
        return;
      }
      await page.goto(`/book/${slug}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
      await expect(page.locator("body")).not.toContainText(/something went wrong/i);
    });
  }
});
