import { db, paymentsTable, paymentIntentRecordsTable, refundsTable, bookingsTable } from "@workspace/db";
import { and, eq, gte, sql } from "drizzle-orm";

export type CommerceSnapshot = {
  currency: string;
  capturedMinor30d: number;
  refundMinor30d: number;
  paymentCount30d: number;
  succeededIntentCount30d: number;
  failedPaymentCount30d: number;
  /** 0–100 when enough payment attempts exist */
  captureRatePercent: number | null;
  avgTicketMinor30d: number | null;
};

export async function getCommerceSnapshot(businessId: string): Promise<CommerceSnapshot> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [[captured], [refunds], [failed], [intents]] = await Promise.all([
    db
      .select({
        total: sql<number>`coalesce(sum(${paymentsTable.amountMinor}), 0)::int`,
        count: sql<number>`count(*)::int`,
        currency: sql<string>`coalesce(max(${paymentsTable.currency}), 'EUR')`,
      })
      .from(paymentsTable)
      .where(
        and(
          eq(paymentsTable.businessId, businessId),
          eq(paymentsTable.status, "SUCCEEDED"),
          gte(paymentsTable.createdAt, since),
        ),
      ),
    db
      .select({
        total: sql<number>`coalesce(sum(${refundsTable.amountMinor}), 0)::int`,
      })
      .from(refundsTable)
      .where(
        and(
          eq(refundsTable.businessId, businessId),
          eq(refundsTable.status, "SUCCEEDED"),
          gte(refundsTable.createdAt, since),
        ),
      ),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(paymentsTable)
      .where(
        and(
          eq(paymentsTable.businessId, businessId),
          eq(paymentsTable.status, "FAILED"),
          gte(paymentsTable.createdAt, since),
        ),
      ),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(paymentIntentRecordsTable)
      .where(
        and(
          eq(paymentIntentRecordsTable.businessId, businessId),
          eq(paymentIntentRecordsTable.status, "SUCCEEDED"),
          gte(paymentIntentRecordsTable.createdAt, since),
        ),
      ),
  ]);

  const paymentCount = captured?.count ?? 0;
  let capturedMinor = captured?.total ?? 0;
  const failedCount = failed?.count ?? 0;
  let effectivePaymentCount = paymentCount;

  // Guest deposits may land on booking before payments ledger (simulated / webhook gap).
  if (effectivePaymentCount === 0) {
    const [bookingDeposits] = await db
      .select({
        count: sql<number>`count(*)::int`,
        total: sql<number>`coalesce(sum(${bookingsTable.depositPaidEurCents}), 0)::int`,
      })
      .from(bookingsTable)
      .where(
        and(
          eq(bookingsTable.businessId, businessId),
          sql`${bookingsTable.depositPaidEurCents} > 0`,
          gte(bookingsTable.updatedAt, since),
        ),
      );
    if ((bookingDeposits?.count ?? 0) > 0) {
      effectivePaymentCount = bookingDeposits!.count;
      capturedMinor = bookingDeposits!.total;
    }
  }

  const attempts = effectivePaymentCount + failedCount;
  const captureRatePercent =
    attempts >= 3 ? Math.round((effectivePaymentCount / attempts) * 100) : null;

  return {
    currency: captured?.currency ?? "EUR",
    capturedMinor30d: capturedMinor,
    refundMinor30d: refunds?.total ?? 0,
    paymentCount30d: effectivePaymentCount,
    succeededIntentCount30d: intents?.count ?? 0,
    failedPaymentCount30d: failedCount,
    captureRatePercent,
    avgTicketMinor30d: effectivePaymentCount > 0 ? Math.round(capturedMinor / effectivePaymentCount) : null,
  };
}

export async function getCommerceSnapshotForApi(businessId: string) {
  const snapshot = await getCommerceSnapshot(businessId);
  return {
    capturedMinor30d: snapshot.capturedMinor30d,
    captureRatePercent: snapshot.captureRatePercent,
    paymentCount30d: snapshot.paymentCount30d,
    currency: snapshot.currency,
    capturedLabel: formatCommerceMinor(snapshot.capturedMinor30d, snapshot.currency),
  };
}

export function formatCommerceMinor(amountMinor: number, currency: string): string {
  const major = amountMinor / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(major);
  } catch {
    return `${major.toFixed(0)} ${currency}`;
  }
}
