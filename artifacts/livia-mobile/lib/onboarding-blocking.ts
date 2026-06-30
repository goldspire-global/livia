import {
  blockingOnboardingActsForSession,
  blockingOnboardingActsForVertical,
  mergePercentWithBlocking,
  nextRecommendedActWithReadiness,
  type OnboardingActId,
  type OnboardingChecklist,
  type OnboardingState,
} from "@workspace/policy";
import { customFetch } from "@workspace/api-client-react";

import type { WeekdayAvailabilityRule } from "@workspace/policy";
import { DEFAULT_WEEKDAY_AVAILABILITY } from "@workspace/policy";

export type AvailRule = WeekdayAvailabilityRule;

export { DEFAULT_WEEKDAY_AVAILABILITY as DEFAULT_WEEKDAY_HOURS };

export function blockingActsForMobile(
  state: OnboardingState | null | undefined,
  vertical?: string | null,
): OnboardingActId[] {
  return blockingOnboardingActsForSession(vertical, state?.checklist);
}

export function nextBlockingAct(
  state: OnboardingState | null | undefined,
  readinessActHints: OnboardingActId[] = [],
  vertical?: string | null,
): OnboardingActId {
  if (readinessActHints.length > 0) {
    return nextRecommendedActWithReadiness(state, readinessActHints);
  }
  const blocking = blockingActsForMobile(state, vertical);
  const completed = new Set(state?.completedActs ?? []);
  for (const act of blocking) {
    if (!completed.has(act)) return act;
  }
  return blocking[blocking.length - 1] ?? "a8_public_link";
}

type OnboardingStatePatch = Omit<Partial<OnboardingState>, "checklist"> & {
  checklist?: Partial<OnboardingChecklist>;
};

export async function persistOnboardingState(
  businessId: string,
  patch: OnboardingStatePatch,
  existing: OnboardingState | null | undefined,
): Promise<OnboardingState> {
  const merged = mergePercentWithBlocking({
    currentAct: patch.currentAct ?? existing?.currentAct ?? "a2_shop_profile",
    completedActs: patch.completedActs ?? existing?.completedActs ?? [],
    percentComplete: patch.percentComplete ?? existing?.percentComplete ?? 0,
    checklist: { ...existing?.checklist, ...patch.checklist } as OnboardingChecklist,
    updatedAt: new Date().toISOString(),
  });
  await customFetch(`/api/businesses/${businessId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ onboardingState: merged }),
  });
  return merged;
}

export async function completeBlockingAct(
  businessId: string,
  act: OnboardingActId,
  existing: OnboardingState | null | undefined,
  checklistPatch?: Partial<OnboardingChecklist>,
  vertical?: string | null,
): Promise<OnboardingState> {
  const completed = [...new Set([...(existing?.completedActs ?? []), act])] as OnboardingActId[];
  const blocking = blockingActsForMobile(existing, vertical);
  const idx = blocking.indexOf(act);
  const nextAct = idx >= 0 && idx < blocking.length - 1 ? blocking[idx + 1]! : act;
  return persistOnboardingState(
    businessId,
    {
      currentAct: nextAct,
      completedActs: completed,
      ...(checklistPatch ? { checklist: checklistPatch } : {}),
    },
    existing,
  );
}

/** @deprecated use blockingActsForMobile */
export { blockingOnboardingActsForVertical };
