/**
 * Inbox channel routing — authenticated owner (requires founder-auth-setup).
 */
import { test, expect } from "@playwright/test";

test.describe("Inbox channel routing", () => {
  test("thread detail shows reply channel hint", async ({ page }) => {
    const res = await page.goto("/inbox", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("body")).not.toContainText(/sign in to your command center/i);
    await expect(page.getByTestId("inbox-three-pane")).toBeVisible({ timeout: 30_000 });

    const firstThread = page.locator("[data-testid^='conversation-']").first();
    const hasThread = await firstThread.isVisible().catch(() => false);
    if (!hasThread) {
      test.skip(true, "No demo conversations in inbox");
      return;
    }

    await firstThread.click();
    await expect(page.getByTestId("inbox-reply-channel-hint")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("inbox-reply-channel-hint")).toContainText(/Replies send on/i);
  });
});
