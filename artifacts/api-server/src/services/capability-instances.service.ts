import { db, businessesTable, EventType } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  applyManualCapabilityInstanceState,
  isCommerceCapabilityId,
  parseCapabilityInstancesStore,
  reconcileCapabilityInstances,
  type CapabilityInstancesStore,
  type ResolvedPlatformCapability,
} from "@workspace/policy";
import { logEvent } from "./events.service";

async function syncCommerceIfNeeded(businessId: string, capabilityIds: string[]): Promise<void> {
  if (!capabilityIds.some(isCommerceCapabilityId)) return;
  const { syncCommerceIntelligenceLoop } = await import("./commerce-signals.service");
  void syncCommerceIntelligenceLoop(businessId);
}

export async function syncCapabilityInstances(
  businessId: string,
  computed: ResolvedPlatformCapability[],
): Promise<{
  store: CapabilityInstancesStore;
  capabilities: ResolvedPlatformCapability[];
  changed: boolean;
}> {
  const [row] = await db
    .select({ capabilityInstances: businessesTable.capabilityInstances })
    .from(businessesTable)
    .where(eq(businessesTable.id, businessId))
    .limit(1);

  if (!row) {
    return { store: {}, capabilities: computed, changed: false };
  }

  const stored = parseCapabilityInstancesStore(row.capabilityInstances);
  const { store, transitions, mergedCapabilities } = reconcileCapabilityInstances({
    computed,
    stored,
  });

  if (transitions.length === 0) {
    return { store, capabilities: mergedCapabilities, changed: false };
  }

  await db
    .update(businessesTable)
    .set({
      capabilityInstances: store,
      updatedAt: new Date(),
    })
    .where(eq(businessesTable.id, businessId));

  for (const t of transitions) {
    void logEvent({
      type: EventType.CAPABILITY_STATE_CHANGED,
      businessId,
      entityType: "capability",
      entityId: t.capabilityId,
      context: {
        capabilityId: t.capabilityId,
        from: t.from,
        to: t.to,
      },
    });
  }

  void syncCommerceIfNeeded(
    businessId,
    transitions.map((t) => t.capabilityId),
  );

  return { store, capabilities: mergedCapabilities, changed: true };
}

export async function setCapabilityInstanceAction(
  businessId: string,
  capabilityId: string,
  action: "suspend" | "resume",
): Promise<{ ok: true } | { ok: false; error: string }> {
  const [row] = await db
    .select({ capabilityInstances: businessesTable.capabilityInstances })
    .from(businessesTable)
    .where(eq(businessesTable.id, businessId))
    .limit(1);

  if (!row) return { ok: false, error: "NOT_FOUND" };

  const stored = parseCapabilityInstancesStore(row.capabilityInstances);

  if (!stored[capabilityId] && action === "suspend") {
    const ts = new Date().toISOString();
    stored[capabilityId] = {
      capabilityId,
      state: "installed",
      installedAt: ts,
      updatedAt: ts,
    };
  } else if (!stored[capabilityId]) {
    return { ok: false, error: "NOT_FOUND" };
  }

  const { store, transition } = applyManualCapabilityInstanceState(
    stored,
    capabilityId,
    action,
  );

  await db
    .update(businessesTable)
    .set({ capabilityInstances: store, updatedAt: new Date() })
    .where(eq(businessesTable.id, businessId));

  if (transition) {
    void logEvent({
      type: EventType.CAPABILITY_STATE_CHANGED,
      businessId,
      entityType: "capability",
      entityId: capabilityId,
      context: {
        capabilityId,
        from: transition.from,
        to: transition.to,
        manual: action,
      },
    });
  }

  void syncCommerceIfNeeded(businessId, [capabilityId]);

  return { ok: true };
}
