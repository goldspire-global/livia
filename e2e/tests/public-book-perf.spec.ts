/**
 * Public book page load budget — catches regressions on guest booking path.
 */
import { test, expect } from "@playwright/test";
import { ensureDemoProvisioned } from "../helpers/demo-auth";

const BOOK_SLUG = "luxe-salon-spa";
const MAX_DOM_MS = 8000;

test.describe("Public book performance", () => {
  test.beforeAll(async ({ request }) => {
    await ensureDemoProvisioned(request);
  });

  test("/book/{slug} DOMContentLoaded under budget", async ({ page }) => {
    const started = Date.now();
    await page.goto(`/book/${BOOK_SLUG}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
    const elapsed = Date.now() - started;
    expect(elapsed, `DOMContentLoaded ${elapsed}ms`).toBeLessThan(MAX_DOM_MS);
    await expect(page.locator("body")).not.toContainText(/something went wrong/i);
  });

  test("/book/{slug} interactive shell visible quickly", async ({ page }) => {
    await page.goto(`/book/${BOOK_SLUG}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
    const t0 = Date.now();
    await expect(
      page.getByRole("button", { name: /book|choose|select|continue/i }).first(),
    ).toBeVisible({ timeout: 12_000 });
    const visibleMs = Date.now() - t0;
    expect(visibleMs, `primary CTA visible in ${visibleMs}ms`).toBeLessThan(12_000);
  });
});
