import { isBeautyLightPreset, isBeautyPublicSurface } from "@/lib/beauty-public";

/** Layout variants for locked W4m beauty targets — maps to existing components only. */
export type BeautyMobileLayout = "default" | "premium-glow" | "editorial-menu";

export function resolveBeautyMobileLayout(
  vertical?: string | null,
  cssPreset?: string | null,
): BeautyMobileLayout | null {
  if (!isBeautyPublicSurface(vertical, cssPreset)) return null;
  if (cssPreset === "premium-dark") return "premium-glow";
  if (cssPreset === "editorial") return "editorial-menu";
  return "default";
}

export function beautyMobileUsesLightChrome(
  vertical?: string | null,
  cssPreset?: string | null,
): boolean {
  return isBeautyPublicSurface(vertical, cssPreset) && isBeautyLightPreset(cssPreset);
}
