import { useBusiness } from "@/contexts/BusinessContext";
import { usePresentationCssPreset } from "@/contexts/PresentationThemeContext";
import {
  beautyMobileUsesLightChrome,
  resolveBeautyMobileLayout,
  type BeautyMobileLayout,
} from "@/lib/beauty-mobile-preset";

export function useBeautyMobileLayout(): {
  layout: BeautyMobileLayout | null;
  cssPreset: string | null;
  lightChrome: boolean;
} {
  const { currentBusiness } = useBusiness();
  const cssPreset = usePresentationCssPreset();
  const vertical = (currentBusiness as { vertical?: string } | undefined)?.vertical;
  return {
    layout: resolveBeautyMobileLayout(vertical, cssPreset),
    cssPreset,
    lightChrome: beautyMobileUsesLightChrome(vertical, cssPreset),
  };
}
