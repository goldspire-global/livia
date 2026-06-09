/**
 * Guest deposit pay token — demo pending booking with deposit due.
 *
 *   pnpm --filter @workspace/e2e exec playwright test --project=guest-pay
 */
import { test, expect } from "@playwright/test";
import { ensureDemoProvisioned, apiBase } from "../helpers/demo-auth";

const SLUG = process.env.E2E_DEPOSIT_SLUG ?? "luxe-salon-spa";

test.describe("Guest deposit pay", () => {
  test.describe.configure({ mode: "serial", timeout: 180_000 });

  test.beforeAll(async ({ request }) => {
    await ensureDemoProvisioned(request);
  });

  test("demo API exposes pay token", async ({ request }) => {
    let res = await request.get(`${apiBase}/api/demo/guest-surfaces/${SLUG}/pay`);
    if (res.status() === 404) {
      await request.post(`${apiBase}/api/demo/sync-vertical-showcase`, { timeout: 120_000 });
      res = await request.get(`${apiBase}/api/demo/guest-surfaces/${SLUG}/pay`);
    }
    if (!res.ok()) {
      test.skip(true, "No deposit booking in demo seed for this slug");
    }
    const body = (await res.json()) as { token?: string; path?: string };
    expect(body.token?.length).toBeGreaterThan(8);
    expect(body.path).toMatch(new RegExp(`/book/${SLUG}/pay/`));
  });

  test("pay page shows checkout CTA or complete state", async ({ page, request }) => {
    const res = await request.get(`${apiBase}/api/demo/guest-surfaces/${SLUG}/pay`);
    if (!res.ok()) {
      test.skip(true, "No deposit booking in demo seed");
    }
    const { path } = (await res.json()) as { path: string };

    await page.goto(path, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await expect(page.getByTestId("guest-pay-page")).toBeVisible({ timeout: 20_000 });
    const checkout = page.getByTestId("guest-pay-checkout");
    const complete = page.getByTestId("guest-pay-complete");
    await expect(checkout.or(complete)).toBeVisible();
  });
});
