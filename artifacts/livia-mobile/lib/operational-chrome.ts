import { useMemo } from "react";
import { StyleSheet, type ViewStyle, type TextStyle } from "react-native";
import { useTenantPresentation } from "@/contexts/PresentationThemeContext";
import { useTenantExperience } from "@/hooks/useTenantExperience";
import { isBeautyPublicSurface } from "@/lib/beauty-public";
import { gatewayTheme } from "@/lib/gateway-theme";
import { verticalAccentHex } from "@/lib/vertical-theme";

export type OperationalChrome = {
  beauty: boolean;
  wellness: boolean;
  constellation: boolean;
  native: boolean;
  panel: (extra?: ViewStyle) => ViewStyle;
  row: (attention?: boolean, extra?: ViewStyle) => ViewStyle;
  avatarRing: (extra?: ViewStyle) => ViewStyle;
  primaryButton: (extra?: ViewStyle) => ViewStyle;
  chip: (active?: boolean, extra?: ViewStyle) => ViewStyle;
  chipText: (active?: boolean, extra?: TextStyle) => TextStyle;
};

export function useOperationalChrome(businessId?: string): OperationalChrome {
  const { data: tenantXp } = useTenantExperience(businessId);
  const presentation = useTenantPresentation();
  const vertical = tenantXp?.vertical;
  const cssPreset =
    (tenantXp as { presentation?: { cssPreset?: string } } | null)?.presentation?.cssPreset ??
    "platform-default";
  const accent =
    (presentation.ritualAccentFromVertical && presentation.vertical
      ? verticalAccentHex(presentation.vertical, presentation.category)
      : null) ??
    presentation.colorOverrides.primary ??
    (tenantXp as { presentation?: { brandAccentHex?: string } } | null)?.presentation
      ?.brandAccentHex ??
    gatewayTheme.aurumChampagne;

  return useMemo(() => {
    const constellation = presentation.isConstellation;
    const beauty = isBeautyPublicSurface(vertical, cssPreset) && !constellation;
    const wellness = vertical === "wellness" && presentation.isWellnessNative;

    return {
      beauty,
      wellness,
      constellation,
      native: beauty || wellness || constellation,
      panel: (extra) => ({
        borderRadius: beauty ? 18 : wellness ? 20 : 16,
        borderWidth: 1,
        borderColor: beauty
          ? accent + "33"
          : wellness
            ? "rgba(13,148,136,0.25)"
            : constellation
              ? "rgba(217,195,154,0.16)"
              : "rgba(255,255,255,0.1)",
        backgroundColor: beauty
          ? accent + "08"
          : wellness
            ? "rgba(6,78,59,0.12)"
            : constellation
              ? "rgba(42,45,58,0.55)"
              : "rgba(255,255,255,0.04)",
        ...extra,
      }),
      row: (attention, extra) => ({
        borderRadius: 16,
        borderWidth: 1,
        borderColor: attention
          ? accent + "55"
          : constellation
            ? "rgba(217,195,154,0.14)"
            : "rgba(255,255,255,0.1)",
        borderLeftWidth: attention ? 3 : constellation ? 2 : 1,
        borderLeftColor: attention || constellation ? accent : undefined,
        backgroundColor: attention
          ? accent + "0c"
          : constellation
            ? "rgba(42,45,58,0.48)"
            : "rgba(255,255,255,0.03)",
        ...extra,
      }),
      avatarRing: (extra) => ({
        borderRadius: 22,
        backgroundColor: accent + "22",
        ...extra,
      }),
      primaryButton: (extra) => ({
        borderRadius: 999,
        backgroundColor: accent,
        ...extra,
      }),
      chip: (active, extra) => ({
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active
          ? accent
          : constellation
            ? "rgba(217,195,154,0.18)"
            : "rgba(255,255,255,0.12)",
        backgroundColor: active
          ? accent + "22"
          : constellation
            ? "rgba(42,45,58,0.42)"
            : "rgba(255,255,255,0.04)",
        ...extra,
      }),
      chipText: (active, extra) => ({
        fontFamily: "Inter_500Medium",
        color: active ? accent : "rgba(255,255,255,0.55)",
        ...extra,
      }),
      staffHero: (extra?: ViewStyle) => ({
        borderRadius: beauty ? 20 : wellness ? 22 : 18,
        borderWidth: 1,
        borderColor: beauty
          ? accent + "33"
          : wellness
            ? "rgba(13,148,136,0.3)"
            : "rgba(217,195,154,0.22)",
        backgroundColor: beauty
          ? accent + "10"
          : wellness
            ? "rgba(6,78,59,0.15)"
            : "rgba(255,255,255,0.04)",
        ...extra,
      }),
      outlineButton: (extra?: ViewStyle) => ({
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.14)",
        backgroundColor: "rgba(255,255,255,0.04)",
        ...extra,
      }),
    };
  }, [
    vertical,
    cssPreset,
    accent,
    presentation.isConstellation,
    presentation.isWellnessNative,
    presentation.vertical,
    presentation.category,
  ]);
}
