import {
  resolveTenantExperience,
  resolvePresentationPreset,
  resolveWellnessOperatorCssPreset,
  presentationPresetsActive,
  PLATFORM_DEFAULT_PRESET_ID,
  type BusinessVertical,
  type OnboardingState,
} from "@workspace/policy";
import { getBusinessById } from "./businesses.service";

export async function getTenantExperienceForBusiness(businessId: string) {
  const biz = await getBusinessById(businessId);
  if (!biz) return null;

  const onboardingState = biz.onboardingState as OnboardingState | null | undefined;
  const vertical = biz.vertical as BusinessVertical;
  const presetId = biz.presentationPresetId ?? PLATFORM_DEFAULT_PRESET_ID;
  const preset = resolvePresentationPreset(vertical, presetId);
  const cssPreset =
    vertical === "wellness"
      ? resolveWellnessOperatorCssPreset(preset.cssPreset)
      : preset.cssPreset;

  return {
    ...resolveTenantExperience({
      vertical: biz.vertical,
      category: biz.category,
      country: biz.country,
      businessName: biz.name,
      onboardingState: onboardingState ?? null,
    }),
    presentation: {
      presetId: preset.id,
      cssPreset,
      label: preset.label,
      tokens: preset.tokens,
      brandAccentHex: biz.brandAccentHex ?? null,
      presetsEnabled: presentationPresetsActive(),
    },
    publicAppearance: {
      slug: biz.slug,
      publicPreviewUrl: `/b/${biz.slug}`,
      logoUrl: biz.logoUrl ?? null,
      coverImageUrl: biz.coverImageUrl ?? null,
      brandAccentHex: biz.brandAccentHex ?? null,
      presentationPresetId: preset.id,
    },
  };
}
