/**
 * Guest pack purchase — Stripe checkout → grant ledger credits.
 */
import { db, businessesTable, servicesTable, customersTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import {
  inferPackageSessionCredits,
  isPackageCatalogService,
  verticalAllowsPackageCatalog,
} from "@workspace/policy";
import { createBookingPaymentIntent } from "./payment.service";
import { grantPackageCredits } from "./package-credits.service";
import { getStripe, isStripeConfigured, logStripeSkip, guestMaySimulatePayments } from "../lib/stripe";
import { resolveGuestBookUrl } from "../lib/guest-public-urls";
import { buildPublicGuestExperienceSkin } from "../lib/experience-skin";
import { generateId } from "../lib/id";

export type GuestPackagePurchaseView = {
  serviceId: string;
  serviceName: string;
  businessName: string;
  slug: string;
  vertical: string | null;
  priceMinor: number;
  currency: string;
  sessionCredits: number;
  checkoutAvailable: boolean;
  experienceSkin: ReturnType<typeof buildPublicGuestExperienceSkin>;
};

export async function getGuestPackagePurchaseView(
  slug: string,
  serviceId: string,
): Promise<GuestPackagePurchaseView | null> {
  const [row] = await db
    .select({
      businessId: businessesTable.id,
      businessName: businessesTable.name,
      slug: businessesTable.slug,
      vertical: businessesTable.vertical,
      country: businessesTable.country,
      presentationPresetId: businessesTable.presentationPresetId,
      brandAccentHex: businessesTable.brandAccentHex,
      serviceId: servicesTable.id,
      serviceName: servicesTable.name,
      category: servicesTable.category,
      serviceKind: servicesTable.serviceKind,
      description: servicesTable.description,
      priceMinor: servicesTable.priceMinor,
      currency: servicesTable.currency,
      durationMinutes: servicesTable.durationMinutes,
      isActive: servicesTable.isActive,
    })
    .from(businessesTable)
    .innerJoin(servicesTable, eq(servicesTable.businessId, businessesTable.id))
    .where(and(eq(businessesTable.slug, slug), eq(servicesTable.id, serviceId)))
    .limit(1);

  if (!row?.isActive || !verticalAllowsPackageCatalog(row.vertical)) return null;
  if (
    !isPackageCatalogService({
      name: row.serviceName,
      category: row.category,
      serviceKind: row.serviceKind,
      description: row.description,
      priceMinor: row.priceMinor,
      durationMinutes: row.durationMinutes,
    })
  ) {
    return null;
  }

  const sessionCredits = inferPackageSessionCredits({
    name: row.serviceName,
    description: row.description,
  });

  return {
    serviceId: row.serviceId,
    serviceName: row.serviceName,
    businessName: row.businessName,
    slug: row.slug,
    vertical: row.vertical,
    priceMinor: row.priceMinor,
    currency: row.currency,
    sessionCredits,
    checkoutAvailable:
      row.priceMinor > 0 && (isStripeConfigured() || guestMaySimulatePayments()),
    experienceSkin: buildPublicGuestExperienceSkin({
      vertical: row.vertical,
      country: row.country,
      presentationPresetId: row.presentationPresetId,
      brandAccentHex: row.brandAccentHex,
    }),
  };
}

export type GuestPackageCheckoutResult =
  | { mode: "stripe"; checkoutUrl: string }
  | { mode: "dev"; message: string }
  | { mode: "error"; message: string };

export async function createGuestPackageCheckout(args: {
  slug: string;
  serviceId: string;
  customerId: string;
  successUrl?: string;
  cancelUrl?: string;
}): Promise<GuestPackageCheckoutResult> {
  const view = await getGuestPackagePurchaseView(args.slug, args.serviceId);
  if (!view) return { mode: "error", message: "Package not available" };
  if (view.priceMinor <= 0) return { mode: "error", message: "Package price not set" };

  const [cust] = await db
    .select({ id: customersTable.id, businessId: customersTable.businessId })
    .from(customersTable)
    .where(eq(customersTable.id, args.customerId))
    .limit(1);
  if (!cust) return { mode: "error", message: "Customer not found" };

  const [biz] = await db
    .select({ id: businessesTable.id })
    .from(businessesTable)
    .where(eq(businessesTable.slug, args.slug))
    .limit(1);
  if (!biz || cust.businessId !== biz.id) return { mode: "error", message: "Customer not found" };

  const purchaseId = generateId();
  const credits = view.sessionCredits;

  if (!isStripeConfigured()) {
    if (guestMaySimulatePayments()) {
      await grantPackageCredits(biz.id, {
        customerId: args.customerId,
        packageName: view.serviceName,
        creditsTotal: credits,
      });
      return {
        mode: "dev",
        message: `Dev: granted ${credits} sessions to customer.`,
      };
    }
    logStripeSkip("guest package checkout");
    return { mode: "error", message: "Payments not configured" };
  }

  const stripe = getStripe();
  if (!stripe) {
    return { mode: "error", message: "Payments not configured" };
  }
  const { paymentIntentRecordId } = await createBookingPaymentIntent({
    businessId: biz.id,
    customerId: args.customerId,
    amountMinor: view.priceMinor,
    currency: view.currency,
    description: `${view.serviceName} (${credits} sessions)`,
    metadata: {
      kind: "guest_package_purchase",
      purchaseId,
      serviceId: args.serviceId,
      packageName: view.serviceName,
      creditsTotal: String(credits),
    },
  });

  const baseSuccess = args.successUrl ?? resolveGuestBookUrl(args.slug);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${baseSuccess}?pack_purchased=1`,
    cancel_url: args.cancelUrl ?? resolveGuestBookUrl(args.slug),
    line_items: [
      {
        price_data: {
          currency: view.currency.toLowerCase(),
          unit_amount: view.priceMinor,
          product_data: {
            name: view.serviceName,
            description: `${credits} sessions — redeem when you book`,
          },
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      metadata: {
        kind: "guest_package_purchase",
        purchaseId,
        businessId: biz.id,
        customerId: args.customerId,
        serviceId: args.serviceId,
        packageName: view.serviceName,
        creditsTotal: String(credits),
        paymentIntentRecordId,
      },
    },
  });

  if (!session.url) return { mode: "error", message: "Could not start checkout" };
  return { mode: "stripe", checkoutUrl: session.url };
}

export async function captureGuestPackagePurchaseFromWebhook(args: {
  businessId: string;
  customerId: string;
  serviceId: string;
  packageName: string;
  creditsTotal: number;
  purchaseId?: string;
}): Promise<void> {
  await grantPackageCredits(args.businessId, {
    customerId: args.customerId,
    packageName: args.packageName,
    creditsTotal: args.creditsTotal,
  });
}
