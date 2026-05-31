/**
 * W6 guest hub — sign-in shell and optional staging OTP flow.
 *
 *   pnpm --filter @workspace/e2e exec playwright test --project=guest-hub
 */
import { test, expect } from "@playwright/test";

test.describe("Guest hub /my", () => {
  test("sign-in shell renders", async ({ page }) => {
    await page.goto("/my", { waitUntil: "domcontentloaded", timeout: 45_000 });
    await expect(page.getByTestId("guest-hub-sign-in")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("guest-hub-phone")).toBeVisible();
  });
});
