import {
  resolvePresentationLayoutMorph,
  type BusinessVertical,
  type PresentationLayoutMorph,
} from "@workspace/policy";

const BUSINESS_VERTICALS = new Set<string>([
  "hair",
  "beauty",
  "body-art",
  "wellness",
  "fitness",
  "medspa",
  "allied-health",
  "pet-grooming",
  "automotive-detailing",
]);

/** Guard — policy preset lookup throws when vertical is missing/invalid. */
export function resolvePresentationLayoutMorphSafe(
  vertical?: string | null,
  cssPreset?: string | null,
): PresentationLayoutMorph {
  if (!vertical || !BUSINESS_VERTICALS.has(vertical)) return "standard";
  return resolvePresentationLayoutMorph(vertical as BusinessVertical, cssPreset);
}

export const WELLNESS_NATIVE_MORPHS = ["atrium", "timeline-rail", "ledger"] as const;
export const BEAUTY_NATIVE_MORPHS = ["split-inbox", "atrium", "menu-card", "cockpit"] as const;

const WELLNESS_CSS = new Set(["harbour-light", "session-rail", "evening-ledger"]);
const BEAUTY_CSS = new Set(["noir-dusk", "soft-studio", "editorial", "premium-dark"]);

export function isWellnessNativeMorph(
  morph?: string | null,
): morph is (typeof WELLNESS_NATIVE_MORPHS)[number] {
  return morph != null && (WELLNESS_NATIVE_MORPHS as readonly string[]).includes(morph);
}

export function isBeautyNativeMorph(
  morph?: string | null,
): morph is (typeof BEAUTY_NATIVE_MORPHS)[number] {
  return morph != null && (BEAUTY_NATIVE_MORPHS as readonly string[]).includes(morph);
}

export function wellnessNativeMorphForVertical(
  vertical?: string | null,
  morph?: string | null,
): PresentationLayoutMorph | null {
  if (vertical !== "wellness" || !isWellnessNativeMorph(morph)) return null;
  return morph;
}

export function beautyNativeMorphForVertical(
  vertical?: string | null,
  morph?: string | null,
): PresentationLayoutMorph | null {
  if (vertical !== "beauty" || !isBeautyNativeMorph(morph)) return null;
  return morph;
}

export function isBeautyPresentationPreset(preset?: string | null): boolean {
  return preset != null && BEAUTY_CSS.has(preset);
}

export function isWellnessPresentationPreset(preset?: string | null): boolean {
  return preset != null && WELLNESS_CSS.has(preset);
}
