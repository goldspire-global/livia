/**
 * Event-vendor quote deposit → first calendar booking credit.
 */
import { db, bookingsTable, quotesTable } from "@workspace/db";
import { and, desc, eq, gt } from "drizzle-orm";
import { quoteDepositCreditMinor } from "@workspace/policy";
import { confirmBookingAfterStripePayment } from "./wellness-ops.service";

type QuoteDaySheet = { depositCreditedBookingId?: string };

export async function applyEventQuoteDepositCreditOnBookingCreate(args: {
  businessId: string;
  customerId: string;
  bookingId: string;
  servicePriceMinor: number;
  vertical: string | null;
}): Promise<{ creditMinor: number; quoteId: string } | null> {
  if (args.vertical !== "event-vendors") return null;

  const [quote] = await db
    .select()
    .from(quotesTable)
    .where(
      and(
        eq(quotesTable.businessId, args.businessId),
        eq(quotesTable.customerId, args.customerId),
        eq(quotesTable.status, "accepted"),
        gt(quotesTable.depositPaidMinor, 0),
      ),
    )
    .orderBy(desc(quotesTable.acceptedAt))
    .limit(1);

  if (!quote) return null;

  const sheet = (quote.eventDaySheet ?? {}) as QuoteDaySheet;
  if (sheet.depositCreditedBookingId) return null;

  const creditMinor = quoteDepositCreditMinor({
    quoteDepositPaidMinor: quote.depositPaidMinor,
    quoteSubtotalMinor: args.servicePriceMinor,
  });
  if (creditMinor <= 0) return null;

  const [booking] = await db
    .select({
      depositPaidEurCents: bookingsTable.depositPaidEurCents,
      totalPaidEurCents: bookingsTable.totalPaidEurCents,
      status: bookingsTable.status,
      pendingReason: bookingsTable.pendingReason,
      source: bookingsTable.source,
      notes: bookingsTable.notes,
    })
    .from(bookingsTable)
    .where(
      and(eq(bookingsTable.id, args.bookingId), eq(bookingsTable.businessId, args.businessId)),
    )
    .limit(1);
  if (!booking) return null;

  const nextDeposit = (booking.depositPaidEurCents ?? 0) + creditMinor;
  const nextTotal = Math.max(booking.totalPaidEurCents ?? 0, nextDeposit);
  const creditNote = `Quote deposit credited (quote ${quote.id.slice(0, 8)})`;

  await db
    .update(bookingsTable)
    .set({
      depositPaidEurCents: nextDeposit,
      totalPaidEurCents: nextTotal,
      notes: [booking.notes, creditNote].filter(Boolean).join(" · "),
      updatedAt: new Date(),
    })
    .where(
      and(eq(bookingsTable.id, args.bookingId), eq(bookingsTable.businessId, args.businessId)),
    );

  await db
    .update(quotesTable)
    .set({
      eventDaySheet: { ...sheet, depositCreditedBookingId: args.bookingId },
      updatedAt: new Date(),
    })
    .where(eq(quotesTable.id, quote.id));

  void confirmBookingAfterStripePayment(args.businessId, args.bookingId).catch(() => undefined);

  return { creditMinor, quoteId: quote.id };
}
