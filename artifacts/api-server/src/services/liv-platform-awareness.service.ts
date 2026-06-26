import {
  buildPlatformAwarenessPromptBlock,
  resolveTenantAwarenessGraph,
  type LivAwarenessProfile,
} from "@workspace/policy";
import { getBusinessById } from "./businesses.service";
import { listServices } from "./services.service";
import { listStaff } from "./staff.service";

async function loadTenantReadinessFacts(businessId: string) {
  const [services, staff, biz] = await Promise.all([
    listServices(businessId, true),
    listStaff(businessId, { isActive: true }),
    getBusinessById(businessId),
  ]);
  return {
    serviceCount: services.length,
    staffCount: staff.length,
    hasPublicSlug: Boolean(biz?.slug?.trim()),
    hasAvailabilityRules: staff.length > 0,
    paymentsConnected: Boolean(biz?.stripeSubscriptionStatus),
    messagingConfigured: true,
    aiEnabled: (biz?.aiEnabled ?? "true") === "true",
  };
}

export async function buildLivPlatformAwarenessPromptBlock(args: {
  businessId?: string;
  profile: LivAwarenessProfile;
}): Promise<string> {
  if (args.profile === "livia_internal") {
    return buildPlatformAwarenessPromptBlock({
      profile: "livia_internal",
      vertical: null,
      tenantGraph: null,
    });
  }

  if (!args.businessId) return "";

  const biz = await getBusinessById(args.businessId);
  if (!biz) return "";

  const facts = await loadTenantReadinessFacts(args.businessId);
  const tenantGraph = resolveTenantAwarenessGraph({
    vertical: biz.vertical,
    facts,
    activeCapabilityIds: facts.serviceCount > 0 ? ["bookings"] : [],
  });

  return buildPlatformAwarenessPromptBlock({
    profile: args.profile,
    vertical: biz.vertical,
    tenantGraph,
  });
}
