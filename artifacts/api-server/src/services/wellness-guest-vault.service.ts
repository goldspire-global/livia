import {
  db,
  guestIdentitiesTable,
  guestShopLinksTable,
  businessesTable,
  staffTable,
  packageCreditLedgerTable,
} from "@workspace/db";
import { and, eq, inArray } from "drizzle-orm";

const WELLNESS_CHAIN_SLUGS = ["harbour-wellness-cork", "copenhagen-havn-wellness"];

export async function getGuestVaultProfile(businessId: string, phoneE164: string) {
  const normalized = phoneE164.trim();
  if (!normalized) return { linkedShops: [], consentRequired: true };

  const [guest] = await db
    .select()
    .from(guestIdentitiesTable)
    .where(eq(guestIdentitiesTable.phoneE164, normalized))
    .limit(1);

  if (!guest) {
    return { guestId: null, linkedShops: [], consentRequired: true };
  }

  const links = await db
    .select({
      businessId: guestShopLinksTable.businessId,
      slug: businessesTable.slug,
      name: businessesTable.name,
    })
    .from(guestShopLinksTable)
    .innerJoin(businessesTable, eq(guestShopLinksTable.businessId, businessesTable.id))
    .where(eq(guestShopLinksTable.guestId, guest.id));

  const chainPeers = links.filter((l) => WELLNESS_CHAIN_SLUGS.includes(l.slug ?? ""));

  return {
    guestId: guest.id,
    linkedShops: links,
    chainPeers,
    crossSiteMemoryEnabled: chainPeers.length > 1,
    consentRequired: chainPeers.length > 1,
    note:
      chainPeers.length > 1
        ? "Guest appears at multiple studios — transfer memory only with explicit consent."
        : "Single-studio guest vault link active.",
  };
}

export async function transferGuestMemoryConsent(
  businessId: string,
  input: { phoneE164: string; targetBusinessId: string; consent: boolean },
) {
  if (!input.consent) {
    return { ok: false, message: "Consent declined — memory stays at origin studio." };
  }
  const profile = await getGuestVaultProfile(businessId, input.phoneE164);
  if (!profile.guestId) {
    return { ok: false, message: "Guest not found in vault." };
  }
  const [target] = await db
    .select({ id: businessesTable.id, slug: businessesTable.slug })
    .from(businessesTable)
    .where(eq(businessesTable.id, input.targetBusinessId))
    .limit(1);
  if (!target) return { ok: false, message: "Target studio not found." };

  const existing = await db
    .select({ guestId: guestShopLinksTable.guestId })
    .from(guestShopLinksTable)
    .where(
      and(
        eq(guestShopLinksTable.guestId, profile.guestId),
        eq(guestShopLinksTable.businessId, input.targetBusinessId),
      ),
    )
    .limit(1);

  if (!existing.length) {
    await db.insert(guestShopLinksTable).values({
      guestId: profile.guestId,
      businessId: input.targetBusinessId,
      consentAt: new Date(),
    });
  }

  return {
    ok: true,
    message: `Memory consent recorded for ${target.slug ?? "studio"}.`,
  };
}

export async function listFloatRoster(businessId: string) {
  const [biz] = await db
    .select({ slug: businessesTable.slug })
    .from(businessesTable)
    .where(eq(businessesTable.id, businessId))
    .limit(1);
  if (!biz || !WELLNESS_CHAIN_SLUGS.includes(biz.slug ?? "")) {
    return { staff: [], note: "Float roster available for multi-site wellness demo." };
  }

  const peers = await db
    .select({ id: businessesTable.id, name: businessesTable.name })
    .from(businessesTable)
    .where(inArray(businessesTable.slug, WELLNESS_CHAIN_SLUGS));

  const rows = await db
    .select({
      id: staffTable.id,
      displayName: staffTable.displayName,
      businessId: staffTable.businessId,
      isActive: staffTable.isActive,
    })
    .from(staffTable)
    .where(
      and(
        inArray(
          staffTable.businessId,
          peers.map((p) => p.id),
        ),
        eq(staffTable.isActive, true),
      ),
    );

  return {
    staff: rows.map((r) => ({
      ...r,
      siteName: peers.find((p) => p.id === r.businessId)?.name ?? "Studio",
    })),
    note: "Central float roster across Harbour + Havn.",
  };
}

export async function findBrandWideRedemptionCode(code: string) {
  const normalized = code.trim().toUpperCase();
  const peers = await db
    .select({ id: businessesTable.id, slug: businessesTable.slug })
    .from(businessesTable)
    .where(inArray(businessesTable.slug, WELLNESS_CHAIN_SLUGS));

  for (const p of peers) {
    const [row] = await db
      .select()
      .from(packageCreditLedgerTable)
      .where(
        and(
          eq(packageCreditLedgerTable.businessId, p.id),
          eq(packageCreditLedgerTable.redemptionCode, normalized),
        ),
      )
      .limit(1);
    if (row) return { ledger: row, businessId: p.id, slug: p.slug };
  }
  return null;
}
