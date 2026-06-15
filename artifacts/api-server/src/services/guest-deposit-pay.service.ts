import { getGuestBookingByToken } from "./booking-guest-access.service";
import { policiesFromBusiness } from "./policies.service";
import { createBookingPaymentIntent } from "./payment.service";
import { resolveGuestTokenUrl } from "../lib/guest-public-urls";
import { buildPublicGuestExperienceSkin } from "../lib/experience-skin";
import { getStripe, isStripeConfigured, logStripeSkip, guestMaySimulatePayments } from "../lib/stripe";
import { db, bookingsTable, businessesTable, paymentIntentRecordsTable, paymentsTable, servicesTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { EventType } from "@workspace/db";
import { logEvent } from "./events.service";
import { generateId } from "../lib/id";
import { logger } from "../lib/logger";

export type GuestDepositPayView = {
  bookingId: string;
  businessName: string;
  slug: string;
  vertical: string | null;
  status: string;
  startAt: string;
  serviceName: string;
  staffDisplayName: string | null;
  customerFirstName: string | null;
  currency: string;
  priceMinor: number;
  depositPaidMinor: number;
  depositDueMinor: number;
  depositPercent: number;
  depositRequired: boolean;
  logoUrl: string | null;
  checkoutAvailable: boolean;
  experienceSkin: ReturnType<typeof buildPublicGuestExperienceSkin>;
};

export function computeDepositDueMinor(args: {
  priceMinor: number;
  depositPercent: number;
  depositRequired: boolean;
  depositPaidMinor: number;
}): number {
  if (!args.depositRequired) return 0;
  const target = Math.round((args.priceMinor * args.depositPercent) / 100);
  return Math.max(0, target - args.depositPaidMinor);
}

export async function getGuestDepositPayView(
  slug: string,
  token: string,
): Promise<GuestDepositPayView | null> {
  const view = await getGuestBookingByToken(slug, token);
  if (!view) return null;

  const [biz] = await db
    .select()
    .from(businessesTable)
    .where(eq(businessesTable.id, view.businessId))
    .limit(1);
  if (!biz) return null;

  const policies = policiesFromBusiness(biz);
  const depositRequired = policies.operational.depositRequired;
  const depositPercent = policies.operational.depositPercent ?? 0;
  const depositDueMinor = computeDepositDueMinor({
    priceMinor: view.priceMinor,
    depositPercent,
    depositRequired,
    depositPaidMinor: view.depositPaidEurCents,
  });

  const canPay =
    depositDueMinor > 0 &&
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
    customerFirstName: view.customerFirstName,
    currency: view.currency,
    priceMinor: view.priceMinor,
    depositPaidMinor: view.depositPaidEurCents,
    depositDueMinor,
    depositPercent,
    depositRequired,
    logoUrl: view.logoUrl,
    checkoutAvailable: canPay,
    experienceSkin: buildPublicGuestExperienceSkin({
      vertical: biz.vertical,
      country: biz.country,
      presentationPresetId: biz.presentationPresetId,
      brandAccentHex: biz.brandAccentHex,
    }),
  };
}

export type GuestDepositCaptureResult =
  | { ok: true; paymentId: string | null; applied: boolean }
  | { ok: false; reason: "booking_not_found" };

/**
 * Idempotent guest deposit capture — booking ledger + payments row (commerce signals source).
 * Safe for dev simulation, Stripe webhooks, and checkout return confirm.
 */
export async function captureGuestDepositPayment(args: {
  businessId: string;
  bookingId: string;
  customerId?: string | null;
  amountMinor: number;
  currency?: string;
  paymentIntentRecordId?: string | null;
  providerChargeId?: string | null;
  checkoutSessionId?: string | null;
  /** When payment_intent.succeeded webhook already inserted the row */
  paymentId?: string | null;
  simulated?: boolean;
}): Promise<GuestDepositCaptureResult> {
  const [row] = await db
    .select({
      depositPaidEurCents: bookingsTable.depositPaidEurCents,
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

  const [biz] = await db
    .select()
    .from(businessesTable)
    .where(eq(businessesTable.id, args.businessId))
    .limit(1);
  if (!biz) return { ok: false, reason: "booking_not_found" };

  const policies = policiesFromBusiness(biz);
  const depositDueMinor = computeDepositDueMinor({
    priceMinor: row.priceMinor,
    depositPercent: policies.operational.depositPercent ?? 0,
    depositRequired: policies.operational.depositRequired,
    depositPaidMinor: row.depositPaidEurCents,
  });

  if (depositDueMinor <= 0 && !args.paymentId) {
    return { ok: true, paymentId: null, applied: false };
  }

  const chargeKey =
    args.providerChargeId ??
    (args.checkoutSessionId ? `checkout:${args.checkoutSessionId}` : null) ??
    (args.simulated ? `sim:${args.bookingId}` : null);

  if (chargeKey && !args.paymentId) {
    const [existing] = await db
      .select({ id: paymentsTable.id })
      .from(paymentsTable)
      .where(eq(paymentsTable.providerChargeId, chargeKey))
      .limit(1);
    if (existing) {
      return { ok: true, paymentId: existing.id, applied: false };
    }
  }

  const creditMinor = Math.max(0, Math.min(args.amountMinor, depositDueMinor || args.amountMinor));
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
        metadata: { simulated: true, guestDeposit: true },
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
        guestDeposit: true,
        simulated: args.simulated ?? false,
        checkoutSessionId: args.checkoutSessionId ?? null,
      },
    });
  }

  if (creditMinor > 0) {
    await db
      .update(bookingsTable)
      .set({
        depositPaidEurCents: row.depositPaidEurCents + creditMinor,
        updatedAt: new Date(),
      })
      .where(
        and(eq(bookingsTable.id, args.bookingId), eq(bookingsTable.businessId, args.businessId)),
      );

    const { confirmBookingAfterStripePayment } = await import("./wellness-ops.service");
    await confirmBookingAfterStripePayment(args.businessId, args.bookingId);

    if (args.simulated || !args.paymentId) {
      await logEvent({
        businessId: args.businessId,
        type: EventType.PAYMENT_SUCCEEDED,
        entityType: "booking",
        entityId: args.bookingId,
        context: {
          paymentId,
          amountMinor: creditMinor,
          guestDeposit: true,
          simulated: args.simulated ?? false,
        },
      });
    }
  }

  return { ok: true, paymentId, applied: creditMinor > 0 };
}

export async function applySimulatedGuestDeposit(args: {
  businessId: string;
  bookingId: string;
  customerId?: string | null;
  amountMinor: number;
  currency?: string;
}): Promise<void> {
  await captureGuestDepositPayment({
    businessId: args.businessId,
    bookingId: args.bookingId,
    customerId: args.customerId,
    amountMinor: args.amountMinor,
    currency: args.currency,
    simulated: true,
  });
}

export type GuestDepositConfirmResult =
  | { mode: "applied" | "already_paid" | "pending" }
  | { mode: "error"; message: string };

/** Guest return URL — apply deposit if Stripe session is paid (webhook fallback). */
export async function confirmGuestDepositCheckout(
  slug: string,
  token: string,
  sessionId: string,
): Promise<GuestDepositConfirmResult> {
  const view = await getGuestDepositPayView(slug, token);
  if (!view) return { mode: "error", message: "Payment link not found" };
  if (view.depositDueMinor <= 0) return { mode: "already_paid" };

  const stripe = getStripe();
  if (!stripe || !isStripeConfigured()) {
    return { mode: "pending" };
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    logger.warn({ err, slug, token, sessionId }, "[guest-deposit-pay] session retrieve failed");
    return { mode: "error", message: "Could not verify payment" };
  }

  if (session.payment_status !== "paid") {
    return { mode: "pending" };
  }
  if (session.metadata?.kind !== "guest_deposit") {
    return { mode: "error", message: "Invalid checkout session" };
  }
  if (session.metadata.guestPayToken !== token || session.metadata.bookingId !== view.bookingId) {
    return { mode: "error", message: "Checkout does not match this booking" };
  }

  const businessId = session.metadata.businessId;
  if (!businessId) return { mode: "error", message: "Invalid checkout session" };

  const piRef = session.payment_intent;
  if (typeof piRef === "string") {
    const pi = await stripe.paymentIntents.retrieve(piRef);
    const { upsertPaymentFromStripeIntent } = await import("./payment.service");
    await upsertPaymentFromStripeIntent(pi);
    return { mode: "applied" };
  }

  const amountMinor = session.amount_total ?? view.depositDueMinor;
  const result = await captureGuestDepositPayment({
    businessId,
    bookingId: view.bookingId,
    amountMinor,
    currency: view.currency,
    checkoutSessionId: sessionId,
  });
  if (!result.ok) return { mode: "error", message: "Booking not found" };
  if (!result.applied) return { mode: "already_paid" };
  return { mode: "applied" };
}

export type GuestDepositCheckoutResult =
  | { mode: "stripe"; checkoutUrl: string }
  | { mode: "dev"; message: string }
  | { mode: "error"; message: string };

/** Start Stripe Checkout or simulate deposit in non-production when Stripe is off. */
export async function createGuestDepositCheckout(
  slug: string,
  token: string,
): Promise<GuestDepositCheckoutResult> {
  const view = await getGuestBookingByToken(slug, token);
  if (!view) return { mode: "error", message: "Payment link not found" };

  const [biz] = await db
    .select()
    .from(businessesTable)
    .where(eq(businessesTable.id, view.businessId))
    .limit(1);
  if (!biz) return { mode: "error", message: "Shop not found" };

  const policies = policiesFromBusiness(biz);
  const depositPercent = policies.operational.depositPercent ?? 0;
  const depositDueMinor = computeDepositDueMinor({
    priceMinor: view.priceMinor,
    depositPercent,
    depositRequired: policies.operational.depositRequired,
    depositPaidMinor: view.depositPaidEurCents,
  });

  if (depositDueMinor <= 0) {
    return { mode: "error", message: "No deposit due on this booking" };
  }

  const stripe = getStripe();
  if (!stripe || !isStripeConfigured()) {
    if (!guestMaySimulatePayments()) {
      return { mode: "error", message: "Card checkout is not available yet" };
    }
    logStripeSkip("guest-deposit-checkout");
    await applySimulatedGuestDeposit({
      businessId: view.businessId,
      bookingId: view.bookingId,
      customerId: view.customerId,
      amountMinor: depositDueMinor,
      currency: view.currency,
    });
    return {
      mode: "dev",
      message: "Deposit recorded — your booking is updated.",
    };
  }

  const intent = await createBookingPaymentIntent({
    businessId: view.businessId,
    bookingId: view.bookingId,
    customerId: view.customerId,
    amountMinor: depositDueMinor,
    currency: view.currency,
    description: `Deposit — ${view.serviceName}`,
  });

  const returnPath = resolveGuestTokenUrl(slug, "pay", token);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: view.currency.toLowerCase(),
          unit_amount: depositDueMinor,
          product_data: {
            name: `Deposit — ${view.serviceName}`,
            description: `${view.businessName} · ${view.startAt.toLocaleDateString("en-IE")}`,
          },
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      metadata: {
        businessId: view.businessId,
        bookingId: view.bookingId,
        customerId: view.customerId,
        paymentIntentRecordId: intent.paymentIntentRecordId,
        kind: "guest_deposit",
        guestPayToken: token,
      },
    },
    metadata: {
      businessId: view.businessId,
      bookingId: view.bookingId,
      kind: "guest_deposit",
      guestPayToken: token,
    },
    success_url: `${returnPath}?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnPath}?status=cancel`,
  });

  if (!session.url) {
    return { mode: "error", message: "Could not start checkout" };
  }

  return { mode: "stripe", checkoutUrl: session.url };
}
