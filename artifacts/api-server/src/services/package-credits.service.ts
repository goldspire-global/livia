import {
  db,
  packageCreditLedgerTable,
  customersTable,
  businessesTable,
  guestShopLinksTable,
} from "@workspace/db";
import { eq, and, gt, or, isNull, asc, inArray } from "drizzle-orm";
import { generateId } from "../lib/id";

export async function listPackageCredits(businessId: string, customerId?: string) {
  const conditions = [eq(packageCreditLedgerTable.businessId, businessId)];
  if (customerId) conditions.push(eq(packageCreditLedgerTable.customerId, customerId));
  return db
    .select()
    .from(packageCreditLedgerTable)
    .where(and(...conditions))
    .orderBy(packageCreditLedgerTable.createdAt);
}

export async function grantPackageCredits(
  businessId: string,
  input: {
    customerId: string;
    packageName: string;
    creditsTotal: number;
    expiresAt?: string;
    redemptionCode?: string;
    giftedByCustomerId?: string;
  },
) {
  const id = generateId();
  const [row] = await db
    .insert(packageCreditLedgerTable)
    .values({
      id,
      businessId,
      customerId: input.customerId,
      packageName: input.packageName.trim(),
      creditsTotal: input.creditsTotal,
      creditsRemaining: input.creditsTotal,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      redemptionCode: input.redemptionCode ?? null,
      giftedByCustomerId: input.giftedByCustomerId ?? null,
    })
    .returning();
  return row;
}

export async function findPackageCreditByRedemptionCode(
  businessId: string,
  code: string,
) {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;
  const [row] = await db
    .select()
    .from(packageCreditLedgerTable)
    .where(
      and(
        eq(packageCreditLedgerTable.businessId, businessId),
        eq(packageCreditLedgerTable.redemptionCode, normalized),
      ),
    )
    .limit(1);
  if (row) return row;
  const { findBrandWideRedemptionCode } = await import("./wellness-guest-vault.service");
  const brand = await findBrandWideRedemptionCode(normalized);
  if (brand && brand.businessId === businessId) return brand.ledger;
  if (brand) return { ...brand.ledger, _redeemAtBusinessId: brand.businessId } as typeof row;
  return null;
}

export type GuestPackageCreditRow = {
  ledgerId: string;
  businessId: string;
  businessName: string;
  slug: string;
  packageName: string;
  creditsRemaining: number;
  creditsTotal: number;
  expiresAt: string | null;
  redemptionCode: string | null;
};

export async function listGuestPackageCreditsForGuest(
  guestId: string,
  phoneE164: string,
): Promise<GuestPackageCreditRow[]> {
  const links = await db
    .select({ businessId: guestShopLinksTable.businessId })
    .from(guestShopLinksTable)
    .where(eq(guestShopLinksTable.guestId, guestId));
  const businessIds = [...new Set(links.map((l) => l.businessId))];
  if (!businessIds.length) return [];

  const customerRows = await db
    .select({ id: customersTable.id })
    .from(customersTable)
    .where(
      and(
        inArray(customersTable.businessId, businessIds),
        eq(customersTable.phone, phoneE164),
      ),
    );

  const customerIds = customerRows.map((c) => c.id);
  if (!customerIds.length) return [];

  const now = new Date();
  const rows = await db
    .select({
      ledger: packageCreditLedgerTable,
      businessName: businessesTable.name,
      slug: businessesTable.slug,
    })
    .from(packageCreditLedgerTable)
    .innerJoin(businessesTable, eq(packageCreditLedgerTable.businessId, businessesTable.id))
    .where(
      and(
        inArray(packageCreditLedgerTable.customerId, customerIds),
        gt(packageCreditLedgerTable.creditsRemaining, 0),
        or(
          isNull(packageCreditLedgerTable.expiresAt),
          gt(packageCreditLedgerTable.expiresAt, now),
        ),
      ),
    )
    .orderBy(asc(packageCreditLedgerTable.expiresAt));

  return rows.map((r) => ({
    ledgerId: r.ledger.id,
    businessId: r.ledger.businessId,
    businessName: r.businessName,
    slug: r.slug,
    packageName: r.ledger.packageName,
    creditsRemaining: r.ledger.creditsRemaining,
    creditsTotal: r.ledger.creditsTotal,
    expiresAt: r.ledger.expiresAt?.toISOString() ?? null,
    redemptionCode: r.ledger.redemptionCode,
  }));
}

export async function burnPackageCredit(businessId: string, ledgerId: string, amount = 1) {
  const [row] = await db
    .select()
    .from(packageCreditLedgerTable)
    .where(
      and(
        eq(packageCreditLedgerTable.id, ledgerId),
        eq(packageCreditLedgerTable.businessId, businessId),
      ),
    );
  if (!row || row.creditsRemaining < amount) return { error: "insufficient" as const };
  const [updated] = await db
    .update(packageCreditLedgerTable)
    .set({
      creditsRemaining: row.creditsRemaining - amount,
      updatedAt: new Date(),
    })
    .where(eq(packageCreditLedgerTable.id, ledgerId))
    .returning();
  return { ledger: updated };
}

/** Best active ledger row for a customer (FIFO by expiry). */
export async function findActivePackageCredit(
  businessId: string,
  customerId: string,
): Promise<(typeof packageCreditLedgerTable.$inferSelect) | null> {
  const now = new Date();
  const rows = await db
    .select()
    .from(packageCreditLedgerTable)
    .where(
      and(
        eq(packageCreditLedgerTable.businessId, businessId),
        eq(packageCreditLedgerTable.customerId, customerId),
        gt(packageCreditLedgerTable.creditsRemaining, 0),
        or(
          isNull(packageCreditLedgerTable.expiresAt),
          gt(packageCreditLedgerTable.expiresAt, now),
        ),
      ),
    )
    .orderBy(asc(packageCreditLedgerTable.expiresAt));
  return rows[0] ?? null;
}

export type PackageCreditSummary = {
  ledgerCount: number;
  activePackages: number;
  creditsSold: number;
  creditsRedeemed: number;
  creditsRemaining: number;
};

export async function getPackageCreditSummary(businessId: string): Promise<PackageCreditSummary> {
  const rows = await listPackageCredits(businessId);
  let creditsSold = 0;
  let creditsRemaining = 0;
  let activePackages = 0;
  for (const row of rows) {
    creditsSold += row.creditsTotal;
    creditsRemaining += row.creditsRemaining;
    if (row.creditsRemaining > 0) activePackages += 1;
  }
  return {
    ledgerCount: rows.length,
    activePackages,
    creditsSold,
    creditsRedeemed: creditsSold - creditsRemaining,
    creditsRemaining,
  };
}
