/**
 * CI-only demo seed — full vertical showcase in Postgres without Clerk.
 * Satisfies getDemoPortalStatus().provisioned for guest-token API tests.
 */
import { eq } from "drizzle-orm";
import { db, usersTable, businessesTable } from "@workspace/db";
import { createBusiness } from "./businesses.service";
import { seedShopCore } from "./demo-portal.service";
import { seedVerticalShowcaseShops } from "./demo-vertical-shops.seed";
import { seedVerticalDemoExtras } from "./demo-vertical-extras.seed";
import { getDemoPortalStatus } from "./demo-portal.service";

export const CI_DEMO_FOUNDER_ID = process.env.SEED_DEMO_OWNER_ID ?? "ci-demo-founder";

export async function seedCiDemoWorld(): Promise<Awaited<ReturnType<typeof getDemoPortalStatus>>> {
  await db
    .insert(usersTable)
    .values({
      id: CI_DEMO_FOUNDER_ID,
      email: "ci-demo@livia.local",
      fullName: "CI Demo Founder",
      role: "OWNER",
    })
    .onConflictDoNothing();

  const [aurora] = await db
    .select({ id: businessesTable.id })
    .from(businessesTable)
    .where(eq(businessesTable.slug, "aurora-studio"))
    .limit(1);

  if (!aurora) {
    const biz = await createBusiness(CI_DEMO_FOUNDER_ID, {
      name: "Aurora Studio",
      slug: "aurora-studio",
      description: "CI demo flagship",
      category: "hair_salon",
      vertical: "hair",
      email: "hello@aurora-studio.ie",
      phone: "+353 1 555 0100",
      timezone: "Europe/Dublin",
      city: "Dublin",
      country: "IE",
      tier: "studio",
    });
    await seedShopCore(
      biz.id,
      [{ firstName: "Lara", lastName: "Byrne", displayName: "Lara Byrne", email: "lara@aurora.ie", color: "#6366f1" }],
      [
        { name: "Cut & Finish", durationMinutes: 60, priceMinor: 6500, sortOrder: 1 },
        { name: "Colour", durationMinutes: 90, priceMinor: 9500, sortOrder: 2 },
      ],
      "hair",
    );
  }

  await seedVerticalShowcaseShops(CI_DEMO_FOUNDER_ID);
  await seedVerticalDemoExtras();

  return getDemoPortalStatus();
}
