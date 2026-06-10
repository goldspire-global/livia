# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: v3-preflight-auth.spec.ts >> v3 pre-flight — owner (authenticated) >> dashboard shows activation welcome or maturity guidance
- Location: tests\v3-preflight-auth.spec.ts:135:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('activation-welcome').or(getByTestId('activation-welcome-done')).or(getByTestId(/^operator-maturity-/)).first()
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for getByTestId('activation-welcome').or(getByTestId('activation-welcome-done')).or(getByTestId(/^operator-maturity-/)).first()

```

```yaml
- dialog "Quick tour + optional video":
  - heading "Quick tour + optional video" [level=2]
  - paragraph: Step 1 of 7 — Watch the short overview, then step through where bookings, inbox, and Liv live. Skip anytime.
  - paragraph: Quick tour + optional video
  - paragraph: Watch the short overview, then step through where bookings, inbox, and Liv live. Skip anytime.
  - button "Skip tour"
  - button "Next"
  - button "Close"
```

# Test source

```ts
  48  |   });
  49  | 
  50  |   test("inbox queue lenses (manager ritual)", async ({ page }) => {
  51  |     const res = await page.goto("/inbox", { waitUntil: "domcontentloaded" });
  52  |     expect(res?.status()).toBeLessThan(500);
  53  |     await expect(page.locator("body")).not.toContainText(/sign in to your command center/i);
  54  |     await expect(page.locator("body")).not.toContainText(/internal server error/i);
  55  |   });
  56  | 
  57  |   test("settings policy tab", async ({ page }) => {
  58  |     const res = await page.goto("/settings?tab=policy", { waitUntil: "domcontentloaded" });
  59  |     expect(res?.status()).toBeLessThan(500);
  60  |     await expect(page.locator("body")).not.toContainText(/sign in to your command center/i);
  61  |     await expect(page.locator("body")).not.toContainText(/internal server error/i);
  62  |   });
  63  | 
  64  |   test("settings communications tab", async ({ page }) => {
  65  |     const res = await page.goto("/settings?tab=comms", { waitUntil: "domcontentloaded" });
  66  |     expect(res?.status()).toBeLessThan(500);
  67  |     await expect(page.locator("body")).not.toContainText(/sign in to your command center/i);
  68  |     await expect(page.locator("body")).not.toContainText(/internal server error/i);
  69  |   });
  70  | 
  71  |   test("customers list and new client entry", async ({ page }) => {
  72  |     const res = await page.goto("/customers", { waitUntil: "domcontentloaded" });
  73  |     expect(res?.status()).toBeLessThan(500);
  74  |     await expect(page.locator("body")).not.toContainText(/sign in to your command center/i);
  75  |     await expect(page.locator("body")).not.toContainText(/internal server error/i);
  76  |   });
  77  | 
  78  |   test("chain glance (org admin)", async ({ page }) => {
  79  |     const res = await page.goto("/chain", { waitUntil: "domcontentloaded" });
  80  |     expect(res?.status()).toBeLessThan(500);
  81  |     await expect(page.locator("body")).not.toContainText(/sign in to your command center/i);
  82  |     await expect(page.locator("body")).not.toContainText(/internal server error/i);
  83  |   });
  84  | 
  85  |   test("audit log owner view", async ({ page }) => {
  86  |     const res = await page.goto("/audit", { waitUntil: "domcontentloaded" });
  87  |     expect(res?.status()).toBeLessThan(500);
  88  |     await expect(page.locator("body")).not.toContainText(/sign in to your command center/i);
  89  |     await expect(page.locator("body")).not.toContainText(/internal server error/i);
  90  |   });
  91  | 
  92  |   test("medspa hub shows vertical gate for hair demo", async ({ page }) => {
  93  |     const res = await page.goto("/medspa", { waitUntil: "domcontentloaded" });
  94  |     expect(res?.status()).toBeLessThan(500);
  95  |     await expect(page.locator("body")).not.toContainText(/sign in to your command center/i);
  96  |     await expect(page.locator("body")).not.toContainText(/internal server error/i);
  97  |   });
  98  | 
  99  |   test("demo gateway still reachable when signed in", async ({ page }) => {
  100 |     const res = await page.goto("/demo", { waitUntil: "domcontentloaded" });
  101 |     expect(res?.status()).toBeLessThan(500);
  102 |   });
  103 | 
  104 |   test("tenant experience API returns vocabulary + playbook", async ({ page }) => {
  105 |     await page.goto("/dashboard", { waitUntil: "networkidle" });
  106 |     const businessId = await page.evaluate(() =>
  107 |       window.localStorage.getItem("livia.currentBusinessId"),
  108 |     );
  109 |     test.skip(!businessId, "No business in founder session");
  110 |     const res = await authedApiGet(
  111 |       page,
  112 |       `/api/me/tenant-experience?businessId=${encodeURIComponent(businessId!)}`,
  113 |     );
  114 |     if (res.status() === 404) {
  115 |       test.skip(true, "Restart API — route /me/tenant-experience not loaded");
  116 |     }
  117 |     expect(res.ok(), await res.text()).toBeTruthy();
  118 |     const body = await res.json();
  119 |     expect(body.vocabulary?.clientNoun).toBeTruthy();
  120 |     expect(body.playbook?.publicCta).toBeTruthy();
  121 |     expect(body.onboarding?.activationSteps?.length).toBeGreaterThan(0);
  122 |   });
  123 | 
  124 |   test("onboarding catalog lists all vertical packs", async ({ page }) => {
  125 |     await page.goto("/dashboard", { waitUntil: "networkidle" });
  126 |     const res = await authedApiGet(page, "/api/onboarding/catalog");
  127 |     expect(res.ok(), await res.text()).toBeTruthy();
  128 |     const body = await res.json();
  129 |     expect(body.verticals?.length).toBeGreaterThanOrEqual(9);
  130 |     expect(body.verticals.some((v: { vertical: string }) => v.vertical === "pet-grooming")).toBe(
  131 |       true,
  132 |     );
  133 |   });
  134 | 
  135 |   test("dashboard shows activation welcome or maturity guidance", async ({ page }) => {
  136 |     await page.goto("/dashboard", { waitUntil: "networkidle" });
  137 |     await page.evaluate(() => {
  138 |       try {
  139 |         window.localStorage.removeItem("livia.activationWelcomeDismissed");
  140 |       } catch {
  141 |         /* ignore */
  142 |       }
  143 |     });
  144 |     await page.reload({ waitUntil: "networkidle" });
  145 |     const activation = page.getByTestId("activation-welcome");
  146 |     const activationDone = page.getByTestId("activation-welcome-done");
  147 |     const maturity = page.getByTestId(/^operator-maturity-/);
> 148 |     await expect(activation.or(activationDone).or(maturity).first()).toBeVisible({
      |                                                                      ^ Error: expect(locator).toBeVisible() failed
  149 |       timeout: 20_000,
  150 |     });
  151 |   });
  152 | });
  153 | 
  154 | 
```