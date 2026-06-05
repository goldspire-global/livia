import type { BusinessVertical } from "./types";
import type { OnboardingActId, OnboardingChecklist, OnboardingState } from "./onboarding-state";
import {
  ONBOARDING_ACT_IDS,
  onboardingChecklistSchema,
  percentFromCompletedActs,
} from "./onboarding-state";

/** Acts required before the owner can use the full app (App Store / self-serve path). */
export const BLOCKING_ONBOARDING_ACTS: OnboardingActId[] = [
  "a2_shop_profile",
  "a5_hours",
  "a6_liv",
  "a8_public_link",
];

/** Seeded on create — no click-through required. */
export const AUTO_COMPLETED_ON_CREATE_ACTS: OnboardingActId[] = [
  "a1_create_business",
  "a3_service_menu",
  "a4_team",
];

export function blockingOnboardingPercent(completed: OnboardingActId[]): number {
  const done = new Set(completed);
  const n = BLOCKING_ONBOARDING_ACTS.filter((a) => done.has(a)).length;
  return Math.min(100, Math.round((n / BLOCKING_ONBOARDING_ACTS.length) * 100));
}

/** Owner can use the product (dashboard/mobile) — essentials done; test booking is activation, not a hard lock. */
export function isOnboardingAppUnlocked(state: OnboardingState | null | undefined): boolean {
  if (!state) return true;
  const completed = new Set(state.completedActs ?? []);
  if (BLOCKING_ONBOARDING_ACTS.every((a) => completed.has(a))) return true;
  if ((state.percentComplete ?? 0) >= 100) return true;
  return false;
}

function menuActivationLabel(vertical?: string | null): string {
  if (vertical === "beauty") return "Build your treatment menu";
  if (vertical === "hair") return "Build your service menu";
  if (vertical === "wellness") return "Set up your session menu";
  return "Set up your service menu";
}

/** Heartland verticals must configure menu — do not auto-complete a3 on create. */
export function verticalRequiresMenuSetup(vertical?: string | null): boolean {
  return vertical === "beauty" || vertical === "hair";
}

export function activationStepsFromState(
  state: OnboardingState | null | undefined,
  vertical?: string | null,
): {
  id: string;
  label: string;
  done: boolean;
  href: string;
}[] {
  const completed = new Set(state?.completedActs ?? []);
  const checklist = state?.checklist ?? ({} as OnboardingChecklist);
  const menuDone =
    completed.has("a3_service_menu") || checklist.servicesConfirmed === true;
  return [
    {
      id: "menu",
      label: menuActivationLabel(vertical),
      done: menuDone,
      href: "/services",
    },
    {
      id: "profile",
      label: "Location profile",
      done: completed.has("a2_shop_profile"),
      href: "/onboarding",
    },
    {
      id: "hours",
      label: "Opening hours",
      done: completed.has("a5_hours") || checklist.hoursConfirmed === true,
      href: "/onboarding",
    },
    {
      id: "liv",
      label: "Liv voice & booking",
      done: completed.has("a6_liv") || checklist.livEnabled === true,
      href: "/settings?tab=liv",
    },
    {
      id: "test-booking",
      label: "Test booking",
      done: checklist.testBooking === true,
      href: "/bookings/new",
    },
    {
      id: "channels",
      label: "Connect WhatsApp or SMS",
      done: completed.has("a7_channels") || checklist.smsOrVoiceConnected === true,
      href: "/settings?tab=comms",
    },
    {
      id: "team",
      label: "Invite your team",
      done: completed.has("a10_invite_team") || checklist.teamInvited === true,
      href: "/staff",
    },
  ];
}

export function mergePercentWithBlocking(state: OnboardingState): OnboardingState {
  const tourPercent = percentFromCompletedActs(state.completedActs);
  const blockingPercent = blockingOnboardingPercent(state.completedActs);
  return {
    ...state,
    percentComplete: Math.max(tourPercent, blockingPercent),
  };
}

/** Onboarding after POST /businesses — menu act blocked for beauty/hair heartland. */
export function afterBusinessCreatedStateForVertical(
  vertical: BusinessVertical,
): OnboardingState {
  const needsMenu = verticalRequiresMenuSetup(vertical);
  const completed = [
    "a1_create_business",
    "a4_team",
    ...(needsMenu ? [] : (["a3_service_menu"] as OnboardingActId[])),
  ] as OnboardingActId[];
  return mergePercentWithBlocking({
    currentAct: needsMenu ? "a3_service_menu" : "a2_shop_profile",
    completedActs: completed,
    percentComplete: 0,
    checklist: onboardingChecklistSchema.parse({
      servicesConfirmed: !needsMenu,
    }),
    updatedAt: new Date().toISOString(),
  });
}

/** API + dashboard create path — pass business vertical when known. */
export function afterBusinessCreatedState(vertical?: BusinessVertical): OnboardingState {
  return afterBusinessCreatedStateForVertical(vertical ?? "hair");
}

/** Generic demo seed — menu auto-completed (not beauty/hair heartland). */
export function afterBusinessCreatedStateWithSeed(): OnboardingState {
  return afterBusinessCreatedStateForVertical("fitness");
}

export function nextRecommendedAct(state: OnboardingState): OnboardingActId {
  const completed = new Set(state.completedActs);
  for (const act of BLOCKING_ONBOARDING_ACTS) {
    if (!completed.has(act)) return act;
  }
  for (const act of ONBOARDING_ACT_IDS) {
    if (!completed.has(act)) return act;
  }
  return "a12_go_live";
}
