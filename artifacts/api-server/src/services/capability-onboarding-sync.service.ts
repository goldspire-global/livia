import { db, businessesTable, EventType } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  completeOnboardingAct,
  deriveOnboardingAdvancesFromReadiness,
  mergeOnboardingState,
  mergePercentWithBlocking,
  onboardingChecklistSchema,
  onboardingStateSchema,
  type CapabilityReadinessFacts,
  type OnboardingActId,
  type ResolvedPlatformCapability,
} from "@workspace/policy";
import { updateBusiness } from "./businesses.service";
import { recordOnboardingStateChange } from "./onboarding-analytics.service";
import { logEvent } from "./events.service";

/** Auto-complete onboarding acts when capability readiness blockers clear. */
export async function syncOnboardingFromCapabilityReadiness(
  businessId: string,
  args: {
    facts: CapabilityReadinessFacts;
    capabilities: ResolvedPlatformCapability[];
  },
): Promise<{ advanced: OnboardingActId[] }> {
  const [biz] = await db
    .select({ onboardingState: businessesTable.onboardingState })
    .from(businessesTable)
    .where(eq(businessesTable.id, businessId))
    .limit(1);
  if (!biz) return { advanced: [] };

  const parsed = onboardingStateSchema.safeParse(biz.onboardingState);
  const base = parsed.success ? parsed.data : mergeOnboardingState(null, {});

  const { acts, checklist } = deriveOnboardingAdvancesFromReadiness({
    facts: args.facts,
    capabilities: args.capabilities,
    state: base,
  });

  const toApply = acts.filter((act) => !(base.completedActs ?? []).includes(act));
  const hasChecklist = Object.keys(checklist).length > 0;
  if (toApply.length === 0 && !hasChecklist) return { advanced: [] };

  let state = base;
  for (const act of toApply) {
    state = completeOnboardingAct(state, act);
  }
  if (hasChecklist) {
    state = mergeOnboardingState(state, {
      checklist: onboardingChecklistSchema.parse({
        ...state.checklist,
        ...checklist,
      }),
    });
  }
  state = mergePercentWithBlocking(state);

  const before = biz.onboardingState;
  await updateBusiness(businessId, {
    onboardingState: state as unknown as Record<string, unknown>,
  });
  await recordOnboardingStateChange({
    businessId,
    before,
    after: state,
  });

  for (const act of toApply) {
    void logEvent({
      type: EventType.ONBOARDING_ACT_COMPLETED,
      businessId,
      entityType: "onboarding_act",
      entityId: act,
      context: { act, source: "capability_readiness" },
    });
  }

  return { advanced: toApply };
}
