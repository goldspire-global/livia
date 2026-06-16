/**
 * Guest balance at visit — Stripe checkout for remainder after deposit.
 */
import { getGuestBookingByToken } from "./booking-guest-access.service";
import { createBookingPaymentIntent } from "./payment.service";
import { resolveGuestTokenUrl } from "../lib/guest-public-urls";
import { buildPublicGuestExperienceSkin } from "../lib/experience-skin";
import { getStripe, isStripeConfigured, logStripeSkip, guestMaySimulatePayments } from "../lib/stripe";
import { db, bookingsTable, businessesTable, paymentIntentRecordsTable, paymentsTable, servicesTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { EventType } from "@workspace/db";
import { logEvent } from "./events.service";
import { generateId } from "../lib/id";
import { computeBalanceDueFromBooking, resolveTotalPaidMinor } from "@workspace/policy";

export type GuestBalancePayView = {
  bookingId: string;
  businessName: string;
  slug: string;
  vertical: string | null;
  status: string;
  startAt: string;
  serviceName: string;
  staffDisplayName: string | null;
  currency: string;
  priceMinor: number;
  totalPaidMinor: number;
  balanceDueMinor: number;
  checkoutAvailable: boolean;
  logoUrl: string | null;
  experienceSkin: ReturnType<typeof buildPublicGuestExperienceSkin>;
};

export async function getGuestBalancePayView(
  slug: string,
  token: string,
): Promise<GuestBalancePayView | null> {
  const view = await getGuestBookingByToken(slug, token);
  if (!view) return null;

  const [biz] = await db
    .select()
    .from(businessesTable)
    .where(eq(businessesTable.id, view.businessId))
    .limit(1);
  if (!biz) return null;

  const [bookingRow] = await db
    .select({ totalPaidEurCents: bookingsTable.totalPaidEurCents })
    .from(bookingsTable)
    .where(eq(bookingsTable.id, view.bookingId))
    .limit(1);

  const totalPaidMinor = resolveTotalPaidMinor({
    depositPaidEurCents: view.depositPaidEurCents,
    totalPaidEurCents: bookingRow?.totalPaidEurCents ?? 0,
  });
  const balanceDueMinor = computeBalanceDueFromBooking({
    priceMinor: view.priceMinor,
    depositPaidEurCents: view.depositPaidEurCents,
    totalPaidEurCents: totalPaidMinor,
  });

  const canPay =
    balanceDueMinor > 0 &&
    ["CONFIRMED", "PENDING", "COMPLETED"].includes(view.status.toUpperCase()) &&
    (isStripeConfigured() || guestMaySimulatePayments());

  return {
    bookingId: view.bookingId,
    businessName: view.businessName,
    slug: view.slug,
    vertical: view.vertical,
    status: view.status,
    startAt: view.startAt.toISOString(),
    serviceName: view.serviceName,
    staffDisplayName: view.staffDisplayName,
    currency: view.currency,
    priceMinor: view.priceMinor,
    totalPaidMinor,
    balanceDueMinor,
    checkoutAvailable: canPay,
    logoUrl: view.logoUrl,
    experienceSkin: buildPublicGuestExperienceSkin({
      vertical: biz.vertical,
      country: biz.country,
      presentationPresetId: biz.presentationPresetId,
      brandAccentHex: biz.brandAccentHex,
    }),
  };
}

export async function captureGuestBalancePayment(args: {
  businessId: string;
  bookingId: string;
  customerId?: string | null;
  amountMinor: number;
  currency?: string;
  paymentIntentRecordId?: string | null;
  providerChargeId?: string | null;
  checkoutSessionId?: string | null;
  paymentId?: string | null;
  simulated?: boolean;
}): Promise<{ ok: true; paymentId: string | null; applied: boolean } | { ok: false; reason: "booking_not_found" }> {
  const [row] = await db
    .select({
      depositPaidEurCents: bookingsTable.depositPaidEurCents,
      totalPaidEurCents: bookingsTable.totalPaidEurCents,
      customerId: bookingsTable.customerId,
      priceMinor: servicesTable.priceMinor,
      currency: servicesTable.currency,
    })
    .from(bookingsTable)
    .innerJoin(servicesTable, eq(bookingsTable.serviceId, servicesTable.id))
    .where(
      and(eq(bookingsTable.id, args.bookingId), eq(bookingsTable.businessId, args.businessId)),
    )
    .limit(1);
  if (!row) return { ok: false, reason: "booking_not_found" };

  const balanceDue = computeBalanceDueFromBooking({
    priceMinor: row.priceMinor,
    depositPaidEurCents: row.depositPaidEurCents,
    totalPaidEurCents: row.totalPaidEurCents,
  });

  if (balanceDue <= 0 && !args.paymentId) {
    return { ok: true, paymentId: null, applied: false };
  }

  const chargeKey =
    args.providerChargeId ??
    (args.checkoutSessionId ? `balance-checkout:${args.checkoutSessionId}` : null) ??
    (args.simulated ? `balance-sim:${args.bookingId}` : null);

  if (chargeKey && !args.paymentId) {
    const [existing] = await db
      .select({ id: paymentsTable.id })
      .from(paymentsTable)
      .where(eq(paymentsTable.providerChargeId, chargeKey))
      .limit(1);
    if (existing) return { ok: true, paymentId: existing.id, applied: false };
  }

  const creditMinor = Math.max(0, Math.min(args.amountMinor, balanceDue || args.amountMinor));
  let paymentId = args.paymentId ?? null;

  if (!paymentId && creditMinor > 0) {
    paymentId = generateId();
    let intentRecordId = args.paymentIntentRecordId ?? null;
    if (!intentRecordId && args.simulated) {
      intentRecordId = generateId();
      await db.insert(paymentIntentRecordsTable).values({
        id: intentRecordId,
        businessId: args.businessId,
        customerId: args.customerId ?? row.customerId,
        bookingId: args.bookingId,
        amountMinor: creditMinor,
        currency: (args.currency ?? row.currency ?? "EUR").toUpperCase(),
        status: "SUCCEEDED",
        metadata: { simulated: true, guestBalance: true },
      });
    } else if (intentRecordId) {
      await db
        .update(paymentIntentRecordsTable)
        .set({ status: "SUCCEEDED", updatedAt: new Date() })
        .where(eq(paymentIntentRecordsTable.id, intentRecordId));
    }

    await db.insert(paymentsTable).values({
      id: paymentId,
      businessId: args.businessId,
      customerId: args.customerId ?? row.customerId,
      bookingId: args.bookingId,
      paymentIntentId: intentRecordId,
      providerChargeId: chargeKey,
      amountMinor: creditMinor,
      currency: (args.currency ?? row.currency ?? "EUR").toUpperCase(),
      status: "SUCCEEDED",
      paidAt: new Date(),
      metadata: {
        guestBalance: true,
        simulated: args.simulated ?? false,
        checkoutSessionId: args.checkoutSessionId ?? null,
      },
    });
  }

  if (creditMinor > 0) {
    const prevTotal = resolveTotalPaidMinor(row);
    await db
      .update(bookingsTable)
      .set({
        totalPaidEurCents: prevTotal + creditMinor,
        updatedAt: new Date(),
      })
      .where(
        and(eq(bookingsTable.id, args.bookingId), eq(bookingsTable.businessId, args.businessId)),
      );

    await logEvent({
      businessId: args.businessId,
      type: EventType.PAYMENT_SUCCEEDED,
      entityType: "booking",
      entityId: args.bookingId,
      context: {
        paymentId,
        amountMinor: creditMinor,
        guestBalance: true,
        simulated: args.simulated ?? false,
      },
    });
  }

  return { ok: true, paymentId, applied: creditMinor > 0 };
}

export type GuestBalanceCheckoutResult =
  | { mode: "stripe"; checkoutUrl: string }
  | { mode: "dev"; message: string }
  | { mode: "error"; message: string };

export async function createGuestBalanceCheckout(
  slug: string,
  token: string,
): Promise<GuestBalanceCheckoutResult> {
  const view = await getGuestBalancePayView(slug, token);
  if (!view) return { mode: "error", message: "Payment link not found" };
  if (view.balanceDueMinor <= 0) return { mode: "error", message: "No balance due" };

  const guestView = await getGuestBookingByToken(slug, token);
  if (!guestView) return { mode: "error", message: "Booking not found" };

  const stripe = getStripe();
  if (!stripe || !isStripeConfigured()) {
    if (guestMaySimulatePayments()) {
      await captureGuestBalancePayment({
        businessId: guestView.businessId,
        bookingId: guestView.bookingId,
        customerId: guestView.customerId,
        amountMinor: view.balanceDueMinor,
        currency: view.currency,
        simulated: true,
      });
      return { mode: "dev", message: "Dev: balance recorded." };
    }
    logStripeSkip("guest-balance-checkout");
    return { mode: "error", message: "Card checkout is not available yet" };
  }

  const { paymentIntentRecordId } = await createBookingPaymentIntent({
    businessId: guestView.businessId,
    customerId: guestView.customerId,
    amountMinor: view.balanceDueMinor,
    currency: view.currency,
    description: `Balance — ${view.serviceName}`,
    metadata: {
      kind: "guest_balance",
      bookingId: view.bookingId,
    },
  });

  const baseReturn = resolveGuestTokenUrl(slug, "balance", token);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${baseReturn}?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseReturn}?status=cancel`,
    line_items: [
      {
        price_data: {
          currency: view.currency.toLowerCase(),
          unit_amount: view.balanceDueMinor,
          product_data: {
            name: `Balance — ${view.serviceName}`,
            description: "Remaining balance for your appointment",
          },
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      metadata: {
        kind: "guest_balance",
        businessId: guestView.businessId,
        customerId: guestView.customerId,
        bookingId: view.bookingId,
        paymentIntentRecordId,
      },
    },
  });

  if (!session.url) return { mode: "error", message: "Could not start checkout" };
  return { mode: "stripe", checkoutUrl: session.url };
}

export async function confirmGuestBalanceCheckout(
  slug: string,
  token: string,
  sessionId: string,
): Promise<{ mode: "applied" | "already_paid" | "error"; message?: string }> {
  const guestView = await getGuestBookingByToken(slug, token);
  if (!guestView) return { mode: "error", message: "Not found" };

  const stripe = getStripe();
  if (!stripe) return { mode: "error", message: "Stripe not configured" };

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const amountMinor = session.amount_total ?? 0;
  const result = await captureGuestBalancePayment({
    businessId: guestView.businessId,
    bookingId: guestView.bookingId,
    customerId: guestView.customerId,
    amountMinor,
    currency: session.currency?.toUpperCase() ?? "EUR",
    checkoutSessionId: sessionId,
    providerChargeId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
  });
  if (!result.ok) return { mode: "error", message: "Booking not found" };
  if (!result.applied) return { mode: "already_paid" };
  return { mode: "applied" };
}

export function guestBalancePayUrl(slug: string, token: string): string {
  return resolveGuestTokenUrl(slug, "balance", token);
}
