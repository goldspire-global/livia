import { db, businessesTable, guestShopLinksTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { getPackageCreditSummary } from "./package-credits.service";
import { getWellnessReportsBundle } from "./wellness-reports.service";

/** Harbour + Havn style — businesses sharing org or wellness slugs in demo. */
export async function getWellnessChainGlance(rootBusinessId: string) {
  const [root] = await db
    .select({ slug: businessesTable.slug, name: businessesTable.name })
    .from(businessesTable)
    .where(eq(businessesTable.id, rootBusinessId))
    .limit(1);
  if (!root) return { sites: [] };

  const peers = await db
    .select({ id: businessesTable.id, name: businessesTable.name, slug: businessesTable.slug })
    .from(businessesTable)
    .where(
      inArray(businessesTable.slug, ["harbour-wellness-cork", "copenhagen-havn-wellness"]),
    );

  const sites = await Promise.all(
    peers.map(async (p) => {
      const [packs, stress] = await Promise.all([
        getPackageCreditSummary(p.id),
        getWellnessReportsBundle(p.id).then((b) => b.tomorrowStress),
      ]);
      return {
        businessId: p.id,
        name: p.name,
        slug: p.slug,
        packagesRemaining: packs.creditsRemaining,
        tomorrowStress: stress.score,
      };
    }),
  );

  const vaultLinks = await db
    .select({ guestId: guestShopLinksTable.guestId })
    .from(guestShopLinksTable)
    .where(eq(guestShopLinksTable.businessId, rootBusinessId))
    .limit(1);

  return {
    sites,
    guestVaultNote:
      vaultLinks.length > 0
        ? "Guests linked to multiple studios appear in My Livia — cross-site memory requires explicit consent."
        : "Link guests via bookings to populate vault.",
    brandGiftEnabled: peers.length > 1,
  };
}
