import type { PresentationLayoutMorph } from "@workspace/policy";
import {
  guestPublicHeroTagline,
  guestPublicCatalogLayout,
  resolveWellnessOperatorCssPreset,
} from "@workspace/policy";

export const BEAUTY_CSS_PRESETS = ["noir-dusk", "soft-studio", "editorial", "premium-dark"] as const;
export type BeautyCssPreset = (typeof BEAUTY_CSS_PRESETS)[number];

export const WELLNESS_CSS_PRESETS = ["harbour-light", "session-rail", "evening-ledger"] as const;
export type WellnessCssPreset = (typeof WELLNESS_CSS_PRESETS)[number];

const BEAUTY_PRESETS = new Set<string>(BEAUTY_CSS_PRESETS);
const WELLNESS_PRESETS = new Set<string>(WELLNESS_CSS_PRESETS);

/** Read active presentation preset from document (W4/W5). */
export function readCssPresentation(): string | null {
  if (typeof document === "undefined") return null;
  return document.documentElement.dataset.presentation ?? null;
}

export function isBeautyPresentationPreset(preset?: string | null): boolean {
  const p = preset ?? readCssPresentation();
  return p != null && BEAUTY_PRESETS.has(p);
}

export function isBeautyVertical(vertical?: string | null): boolean {
  return vertical === "beauty";
}

export function isWellnessPresentationPreset(preset?: string | null): boolean {
  const p = preset ?? readCssPresentation();
  return p != null && WELLNESS_PRESETS.has(p);
}

export function isWellnessVertical(vertical?: string | null): boolean {
  return vertical === "wellness";
}

export function useBeautyChrome(vertical?: string | null): boolean {
  return isBeautyVertical(vertical) && isBeautyPresentationPreset();
}

/** W4 list/inbox shells — any wellness tenant (operator preset resolves platform-default → harbour-light). */
export function useWellnessChrome(vertical?: string | null): boolean {
  return isWellnessVertical(vertical);
}

/** Effective CSS after wellness operator defaulting (for public /b when API still stores platform-default). */
export function wellnessEffectiveCssPreset(cssPreset?: string | null): string | null {
  if (!cssPreset) return null;
  return resolveWellnessOperatorCssPreset(cssPreset);
}

export const WELLNESS_NATIVE_MORPHS = ["atrium", "timeline-rail", "ledger"] as const;
export const BEAUTY_NATIVE_MORPHS = ["split-inbox", "atrium", "menu-card", "cockpit"] as const;

export function readLayoutMorph(): PresentationLayoutMorph | null {
  if (typeof document === "undefined") return null;
  const raw = document.documentElement.dataset.layoutMorph;
  return raw ? (raw as PresentationLayoutMorph) : null;
}

export function isWellnessNativeMorph(
  morph?: string | null,
): morph is (typeof WELLNESS_NATIVE_MORPHS)[number] {
  return morph != null && (WELLNESS_NATIVE_MORPHS as readonly string[]).includes(morph);
}

/** Wellness presets with distinct layout shells (not platform-default / constellation). */
export function wellnessNativeMorphForVertical(
  vertical?: string | null,
  morph?: string | null,
): PresentationLayoutMorph | null {
  if (!isWellnessVertical(vertical) || !isWellnessNativeMorph(morph)) return null;
  return morph;
}

export function isBeautyNativeMorph(
  morph?: string | null,
): morph is (typeof BEAUTY_NATIVE_MORPHS)[number] {
  return morph != null && (BEAUTY_NATIVE_MORPHS as readonly string[]).includes(morph);
}

/** Beauty presets with distinct Today shells (not platform-default / constellation). */
export function beautyNativeMorphForVertical(
  vertical?: string | null,
  morph?: string | null,
): PresentationLayoutMorph | null {
  if (!isBeautyVertical(vertical) || !isBeautyNativeMorph(morph)) return null;
  return morph;
}

export function wellnessPanel(wellnessChrome: boolean): string {
  return wellnessChrome ? "wellness-panel border bg-card" : "border bg-card";
}

export function wellnessPublicHeroTagline(cssPreset?: string | null): string {
  return guestPublicHeroTagline("wellness", null, cssPreset) ?? "MIND · CALM · REST";
}

export function wellnessPublicCatalogLayout(cssPreset?: string | null): "wellness-grid" | "list" {
  const layout = guestPublicCatalogLayout("wellness", null);
  return layout === "grid-2x2" ? "wellness-grid" : "list";
}

/** W5 catalog layout — editorial preset uses list per policy `layout: list`. */
export function resolveBeautyPublicCatalogLayout(
  cssPreset?: string | null,
): "beauty-grid" | "list" {
  if (cssPreset === "editorial") return "list";
  return "beauty-grid";
}

/** W5 hero H1 — singular service noun from tenant vocabulary. */
export function beautyPublicHeroTitle(serviceNoun: string): string {
  const raw = serviceNoun.trim().toLowerCase();
  if (!raw) return "Book now";
  const singular =
    raw.endsWith("ies") && raw.length > 3
      ? `${raw.slice(0, -3)}y`
      : raw.endsWith("s") && raw.length > 1
        ? raw.slice(0, -1)
        : raw;
  return `Book a ${singular}`;
}

export function beautyPublicHeroTagline(cssPreset?: string | null): string {
  switch (cssPreset) {
    case "soft-studio":
      return "SOFT · CALM · STUDIO";
    case "editorial":
      return "CURATED · TREATMENTS";
    case "premium-dark":
      return "PREMIUM · EXPERIENCE";
    case "noir-dusk":
    default:
      return "BEAUTY · CONFIDENCE · BLOOM";
  }
}

/** Preset swatch for settings cards (HSL triplets matching index.css). */
export const WELLNESS_PRESET_SWATCH: Record<WellnessCssPreset, { a: string; b: string }> = {
  "harbour-light": { a: "174 60% 38%", b: "158 35% 94%" },
  "session-rail": { a: "222 47% 18%", b: "220 16% 96%" },
  "evening-ledger": { a: "38 55% 58%", b: "220 25% 8%" },
};

export const BEAUTY_PRESET_SWATCH: Record<BeautyCssPreset, { a: string; b: string }> = {
  "noir-dusk": { a: "330 45% 72%", b: "228 18% 9%" },
  "soft-studio": { a: "330 81% 60%", b: "330 40% 98%" },
  editorial: { a: "16 52% 48%", b: "40 33% 97%" },
  "premium-dark": { a: "36 55% 62%", b: "30 8% 7%" },
};
