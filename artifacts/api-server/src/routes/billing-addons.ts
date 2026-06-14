import { Router, type IRouter } from "express";
import { requireAuth, requireRole, getUserId } from "../lib/auth";
import {
  grantAddonBundle,
  tenantHasEntitlementForBusiness,
} from "../services/billing.service";
import {
  getStripe,
  logStripeSkip,
  priceIdForAddon,
  stripePriceEnvKeyForAddon,
  billingMayGrantWithoutStripe,
  billingLocalGrantMode,
} from "../lib/stripe";
import { getBusinessById, updateBusiness } from "../services/businesses.service";
import { getDashboardUrl } from "../lib/public-urls";
import { getOrCreateUser } from "../services/users.service";
import { lookupAddon, type EntitlementKey } from "@workspace/entitlements";
import { sendError } from "../lib/http-errors";
import { DEMO_WORLD_SLUGS, isDemoPortalEnabled } from "../lib/demo-portal-config";

const router: IRouter = Router();
const getBizId = (p: string | string[]) => (Array.isArray(p) ? p[0] : p);

function mayGrantAddonLocally(slug: string | null | undefined): boolean {
  if (billingMayGrantWithoutStripe()) return true;
  if (!isDemoPortalEnabled() || !slug) return false;
  return (DEMO_WORLD_SLUGS as readonly string[]).includes(slug);
}

router.post(
  "/businesses/:businessId/billing/checkout-addon",
  requireAuth,
  requireRole("OWNER"),
  async (req, res): Promise<void> => {
    const userId = getUserId(req);
    const businessId = getBizId(req.params.businessId);
    const addonId = (req.body?.addonId as string | undefined)?.trim() ?? "";
    const returnPath =
      typeof req.body?.returnPath === "string" && req.body.returnPath.startsWith("/")
        ? req.body.returnPath
        : "/settings?tab=billing";

    const addon = lookupAddon(addonId);
    if (!addon) {
      sendError(res, req, 400, "Unknown add-on. Use addonId from ADDON_CATALOGUE.");
      return;
    }

    const biz = await getBusinessById(businessId);
    if (!biz) {
      sendError(res, req, 404, "Business not found");
      return;
    }

    const primaryGrant = addon.grants[0] as EntitlementKey;
    const already = await tenantHasEntitlementForBusiness(businessId, primaryGrant);
    if (already) {
      res.json({ message: `${addon.name} is already active.`, active: true });
      return;
    }

    const stripe = getStripe();
    const priceId = priceIdForAddon(addonId);
    if (!stripe || !priceId) {
      logStripeSkip(`checkout-addon:${addonId}`);
      if (mayGrantAddonLocally(biz.slug)) {
        await grantAddonBundle(businessId, addonId);
        const mode = billingLocalGrantMode() ?? "demo-override";
        res.json({
          mode,
          message:
            mode === "staging-demo"
              ? `${addon.name} unlocked for staging demo.`
              : `${addon.name} granted locally for development.`,
          active: true,
        });
        return;
      }
      const priceEnv = stripePriceEnvKeyForAddon(addonId);
      if (priceEnv) {
        sendError(res, req, 503, `Billing price is not configured. Set ${priceEnv} in the API environment.`, {
          code: "STRIPE_PRICE_NOT_CONFIGURED",
          addonId,
          priceEnv,
        });
        return;
      }
      sendError(res, req, 503, "Billing is not configured in this environment.", {
        code: "STRIPE_NOT_CONFIGURED",
      });
      return;
    }

    const user = await getOrCreateUser(userId);
    let customerId = biz.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        name: biz.name,
        metadata: { businessId, ownerId: userId },
      });
      customerId = customer.id;
      await updateBusiness(businessId, { stripeCustomerId: customerId });
    }

    const baseUrl = getDashboardUrl();
    const successUrl = `${baseUrl}${returnPath}${returnPath.includes("?") ? "&" : "?"}addon=${addonId}&addon_status=success`;
    const cancelUrl = `${baseUrl}${returnPath}${returnPath.includes("?") ? "&" : "?"}addon=${addonId}&addon_status=cancel`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { businessId, addon: addonId },
      subscription_data: {
        metadata: { businessId, addon: addonId },
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  },
);

export default router;
