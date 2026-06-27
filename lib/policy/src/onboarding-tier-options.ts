import type { BusinessTier } from "./types";

export type OnboardingTierOption = {
  value: BusinessTier | string;
  label: string;
  description: string;
};

/** Alphabetical by label — onboarding org-shape / plan picker (web + mobile). */
export const ONBOARDING_TIER_OPTIONS: OnboardingTierOption[] = [
  {
    value: "franchise",
    label: "Franchise",
    description: "Franchise network with HQ rollup and location-level owners.",
  },
  {
    value: "mid-chain",
    label: "Mid-Chain",
    description: "Regional group — several brands or sites under one operator.",
  },
  {
    value: "chain",
    label: "Multi-Location",
    description: "Two or more locations under one brand with chain glance.",
  },
  {
    value: "white-label",
    label: "Multi-Brand Portfolio",
    description: "Separate brands with strict customer isolation between them.",
  },
  {
    value: "solo",
    label: "Solo Practitioner",
    description: "Just you — Liv runs bookings and guest comms while you work.",
  },
  {
    value: "studio",
    label: "Small Studio",
    description: "A team with managers or front desk on the Studio plan.",
  },
];

/**
 * Self-serve signup tiers — excludes chair-host (Host is a billing upgrade after you link renters).
 * Full BusinessTier enum still includes chair-host for billing, demo, and API.
 */
export const ONBOARDING_SELF_SERVE_TIER_IDS = [
  "solo",
  "studio",
  "chain",
  "mid-chain",
  "franchise",
  "white-label",
] as const;

export function onboardingCatalogTierIds(): string[] {
  return [...ONBOARDING_SELF_SERVE_TIER_IDS];
}

/** Field label for tier picker — org shape and plan, not headcount. */
export function onboardingTierFieldLabel(): string {
  return "How you're set up";
}

/** Helper under the tier picker. */
export function onboardingTierFieldDescription(): string {
  return "Solo, team, or multi-location — sets your plan. Chair hosting is enabled later in Settings.";
}

function titleCaseTierSlug(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
}

/** Resolve catalog tier ids to labelled, alphabetised options. */
export function resolveOnboardingTierOptions(catalogTiers: string[]): OnboardingTierOption[] {
  const byValue = new Map(ONBOARDING_TIER_OPTIONS.map((o) => [o.value, o]));
  return [...catalogTiers]
    .map(
      (value) =>
        byValue.get(value) ?? {
          value,
          label: titleCaseTierSlug(value),
          description: "",
        },
    )
    .sort((a, b) => a.label.localeCompare(b.label, "en"));
}
