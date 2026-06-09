import {
  db,
  businessesTable,
  servicesTable,
  staffTable,
  availabilityRulesTable,
} from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import {
  resolveTenantCapabilityGraph,
  scoreCapabilityGraphHealth,
  summarizeCapabilityHealth,
  type TenantCapabilityGraph,
  type BusinessVertical,
  type CapabilityInstancesStore,
  type CapabilityReadinessFacts,
  type OnboardingActId,
} from "@workspace/policy";
import { getBusinessActivationSnapshot } from "./activation-metrics.service";
import { syncCapabilityInstances } from "./capability-instances.service";
import { syncOnboardingFromCapabilityReadiness } from "./capability-onboarding-sync.service";

export type TenantCapabilitiesResponse = TenantCapabilityGraph & {
  businessId: string;
  activation: Awaited<ReturnType<typeof getBusinessActivationSnapshot>>;
  capabilityInstances: CapabilityInstancesStore;
  readinessFacts: CapabilityReadinessFacts;
  capabilityHealth: ReturnType<typeof scoreCapabilityGraphHealth>;
  onboardingAutoAdvanced?: OnboardingActId[];
};

export async function getTenantCapabilities(
  businessId: string,
): Promise<TenantCapabilitiesResponse | null> {
  const [biz] = await db
    .select({
      vertical: businessesTable.vertical,
      slug: businessesTable.slug,
      stripeCustomerId: businessesTable.stripeCustomerId,
      twilioPhoneNumber: businessesTable.twilioPhoneNumber,
      messagingChannels: businessesTable.messagingChannels,
      aiEnabled: businessesTable.aiEnabled,
    })
    .from(businessesTable)
    .where(eq(businessesTable.id, businessId))
    .limit(1);

  if (!biz) return null;

  const [[serviceRow], [staffRow], [availRow], activation] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(servicesTable)
      .where(and(eq(servicesTable.businessId, businessId), eq(servicesTable.isActive, true))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(staffTable)
      .where(and(eq(staffTable.businessId, businessId), eq(staffTable.isActive, true))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(availabilityRulesTable)
      .where(eq(availabilityRulesTable.businessId, businessId)),
    getBusinessActivationSnapshot(businessId),
  ]);

  const messagingChannels = biz.messagingChannels as Record<string, unknown> | null;
  const messagingConfigured =
    Boolean(biz.twilioPhoneNumber) ||
    Boolean(messagingChannels && Object.keys(messagingChannels).length > 0);

  const facts: CapabilityReadinessFacts = {
    serviceCount: serviceRow?.count ?? 0,
    staffCount: staffRow?.count ?? 0,
    hasPublicSlug: Boolean(biz.slug),
    hasAvailabilityRules: (availRow?.count ?? 0) > 0,
    paymentsConnected: Boolean(biz.stripeCustomerId),
    messagingConfigured,
    aiEnabled: biz.aiEnabled !== "false" && biz.aiEnabled !== "0",
    sacredMetricMet: activation?.sacredMetricMet ?? false,
  };

  const graph = resolveTenantCapabilityGraph({
    vertical: biz.vertical as BusinessVertical,
    facts,
    activeCapabilityIds: activation?.sacredMetricMet
      ? ["bookings", "messaging"]
      : [],
  });

  const { store, capabilities } = await syncCapabilityInstances(
    businessId,
    graph.platformCapabilities,
  );

  const { advanced } = await syncOnboardingFromCapabilityReadiness(businessId, {
    facts,
    capabilities,
  });

  const capHealthSummary = summarizeCapabilityHealth(capabilities);

  return {
    businessId,
    ...graph,
    platformCapabilities: capabilities,
    activation,
    capabilityInstances: store,
    readinessFacts: facts,
    capabilityHealth: scoreCapabilityGraphHealth(capHealthSummary),
    ...(advanced.length > 0 ? { onboardingAutoAdvanced: advanced } : {}),
  };
}
