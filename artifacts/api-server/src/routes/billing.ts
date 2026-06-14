import { Router, type IRouter } from "express";

import { requireAuth, requireRole, getUserId, resolveMembership } from "../lib/auth";

import {

  resolveBillingState,

  setBusinessPlanForDev,

  syncBusinessPlanFromStripe,

} from "../services/billing.service";

import { getBusinessById, updateBusiness } from "../services/businesses.service";
import { getDashboardUrl } from "../lib/public-urls";

import { getOrCreateUser } from "../services/users.service";

import {

  getStripe,

  isStripeConfigured,

  logStripeSkip,

  priceIdForPlan,

  stripePriceEnvKeyForPlan,

  billingMayGrantWithoutStripe,

  billingLocalGrantMode,

} from "../lib/stripe";

import { CHECKOUT_PLAN_IDS } from "@workspace/entitlements";
import { sendError, logRouteError, safeClientMessage } from "../lib/http-errors";
import { replyDomainError } from "../lib/domain-errors";
import { DEMO_WORLD_SLUGS, isDemoPortalEnabled } from "../lib/demo-portal-config";



const router: IRouter = Router();

const getBizId = (param: string | string[]) =>

  Array.isArray(param) ? param[0] : param;



router.get(

  "/businesses/:businessId/billing",

  requireAuth,

  requireRole("ADMIN"),

  async (req, res): Promise<void> => {

    const businessId = getBizId(req.params.businessId);

    try {

      const state = await resolveBillingState(businessId);

      res.json(state);

    } catch (err: unknown) {
      if (replyDomainError(req, res, err)) return;
      throw err;
    }

  },

);



router.post(

  "/businesses/:businessId/billing/checkout-session",

  requireAuth,

  requireRole("ADMIN"),

  async (req, res): Promise<void> => {

    const userId = getUserId(req);

    const businessId = getBizId(req.params.businessId);

    const planId = (req.body?.planId as string | undefined)?.trim() ?? "solo";

    const shopCount = Math.max(2, Number(req.body?.shopCount) || 2);

    const renterCount = Math.max(1, Number(req.body?.renterCount) || 1);



    if (!CHECKOUT_PLAN_IDS.includes(planId as (typeof CHECKOUT_PLAN_IDS)[number])) {

      sendError(res, req, 400, "planId must be one of: solo, studio, chain, chair-host",);

      return;

    }



    const role = await resolveMembership(userId, businessId);

    if (!role || role === "STAFF") {

      sendError(res, req, 404, "Business not found");

      return;

    }



    const biz = await getBusinessById(businessId);

    if (!biz) {

      sendError(res, req, 404, "Business not found");

      return;

    }



    const stripe = getStripe();

    const priceId = priceIdForPlan(planId);

    if (!stripe || !priceId) {

      logStripeSkip("checkout-session");

      const mayGrantLocally =
        billingMayGrantWithoutStripe() ||
        (isDemoPortalEnabled() &&
          biz.slug &&
          (DEMO_WORLD_SLUGS as readonly string[]).includes(biz.slug));

      if (mayGrantLocally) {

        await setBusinessPlanForDev(businessId, planId);

        const state = await resolveBillingState(businessId);

        const mode = billingLocalGrantMode() ?? "demo-override";

        res.json({

          mode,

          message:
            mode === "staging-demo"
              ? "Plan applied for staging demo."
              : "Stripe not configured — plan applied locally for development.",

          billing: state,

        });

        return;

      }

      const priceEnv = stripePriceEnvKeyForPlan(planId);

      if (stripe && !priceId && priceEnv) {

        sendError(

          res,

          req,

          503,

          `Billing price is not configured. Set ${priceEnv} in the API environment.`,

          { code: "STRIPE_PRICE_NOT_CONFIGURED", planId, priceEnv },

        );

        return;

      }

      sendError(res, req, 503, "Billing is not configured in this environment.", { code: "STRIPE_NOT_CONFIGURED", });

      return;

    }



    try {

      const user = await getOrCreateUser(userId);

      let customerId = biz.stripeCustomerId;

      if (!customerId) {

        const customer = await stripe.customers.create({

          email: user.email ?? undefined,

          name: biz.name,

          metadata: { businessId, ownerId: biz.ownerId },

        });

        customerId = customer.id;

        await updateBusiness(businessId, { stripeCustomerId: customerId });

      }



      const baseUrl = getDashboardUrl();



      const quantity =

        planId === "chain" ? shopCount : planId === "chair-host" ? renterCount : 1;



      const session = await stripe.checkout.sessions.create({

        mode: "subscription",

        customer: customerId,

        line_items: [{ price: priceId, quantity }],

        success_url: `${baseUrl}/settings?tab=billing&billing=success`,

        cancel_url: `${baseUrl}/settings?tab=billing&billing=cancel`,

        metadata: { businessId, planId, shopCount: String(shopCount), renterCount: String(renterCount) },

        subscription_data: {

          metadata: { businessId, planId },

        },

      });



      res.json({ url: session.url, sessionId: session.id });

    } catch (err: unknown) {

      logRouteError(req, err, "billing checkout-session failed", { businessId, planId });

      sendError(res, req, 502, safeClientMessage(err, "Could not start Stripe checkout."), {

        code: "STRIPE_CHECKOUT_FAILED",

      });

    }

  },

);



/** Dev-only: set plan without Stripe (e.g. trial without voice). */

router.post(

  "/businesses/:businessId/billing/dev-plan",

  requireAuth,

  requireRole("OWNER"),

  async (req, res): Promise<void> => {

    if (process.env.NODE_ENV === "production") {

      sendError(res, req, 403, "Not available in production");

      return;

    }

    const businessId = getBizId(req.params.businessId);

    const planId = (req.body?.planId as string) ?? "trial";

    const denylist = Array.isArray(req.body?.entitlementDenylist)

      ? (req.body.entitlementDenylist as string[])

      : planId === "trial"

        ? ["voice_receptionist"]

        : [];

    await setBusinessPlanForDev(businessId, planId, denylist);

    res.json(await resolveBillingState(businessId));

  },

);



export default router;

