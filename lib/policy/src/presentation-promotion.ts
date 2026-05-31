import { businessVerticalSchema, type BusinessVertical } from "./types";
import {
  listPresentationPresets,
  presentationPresetsEnabled,
  PLATFORM_DEFAULT_PRESET_ID,
} from "./presentation-presets";

export type PresentationPromotionRow = {
  vertical: BusinessVertical;
  presetId: string;
  label: string;
  cssPreset: string;
  isDefault: boolean;
  /** Safe to enable in production when `LIVIA_PRESENTATION_PRESETS=true`. */
  productionReady: boolean;
};

/** 9 verticals × 4 presets — staging→prod promotion matrix (R3-E1). */
export function getPresentationPromotionMatrix(): PresentationPromotionRow[] {
  const rows: PresentationPromotionRow[] = [];
  for (const vertical of businessVerticalSchema.options) {
    for (const preset of listPresentationPresets(vertical)) {
      rows.push({
        vertical,
        presetId: preset.id,
        label: preset.label,
        cssPreset: preset.cssPreset,
        isDefault: preset.isDefault,
        productionReady: true,
      });
    }
  }
  return rows;
}

export function presentationPresetCountByVertical(): Record<BusinessVertical, number> {
  const out = {} as Record<BusinessVertical, number>;
  for (const vertical of businessVerticalSchema.options) {
    out[vertical] = listPresentationPresets(vertical).length;
  }
  return out;
}

/** Production gate: explicit env only (never staging hostname alone on prod). */
export function presentationPresetsProductionEnabled(
  env?: Record<string, string | undefined>,
): boolean {
  const e = env ?? (typeof process !== "undefined" ? process.env : {});
  return e.LIVIA_PRESENTATION_PRESETS === "true";
}

/** Combined gate for API + dashboard picker. */
export function presentationPresetsActive(env?: Record<string, string | undefined>): boolean {
  return presentationPresetsEnabled(env) || presentationPresetsProductionEnabled(env);
}

export const PRESENTATION_PRODUCTION_ALLOWLIST = {
  /** All catalog presets ship together when production flag is on. */
  allPresetIds: () =>
    getPresentationPromotionMatrix().map((r) => r.presetId),
  platformDefault: PLATFORM_DEFAULT_PRESET_ID,
} as const;
