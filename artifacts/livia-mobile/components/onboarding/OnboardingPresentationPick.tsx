import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { listPresentationPresetsForTenantPicker, type BusinessVertical } from "@workspace/policy";
import { PresetChipRow } from "@/components/presentation/PresetChipRow";
import { useColors } from "@/hooks/useColors";
import { useHaptics } from "@/hooks/useHaptics";
import { usePresentationSettings } from "@/hooks/usePresentationSettings";
import { presentationPresetsUiEnabled } from "@/lib/presentation-presets-enabled";
import { fonts, type } from "@/constants/typography";

type Props = {
  businessId: string;
  vertical?: string | null;
};

/**
 * Onboarding appearance step — same PATCH as web `OnboardingPresentationPick`.
 * Tap a preset to apply instantly; skin updates via tenant-experience invalidation.
 */
export function OnboardingPresentationPick({ businessId, vertical }: Props) {
  const colors = useColors();
  const haptics = useHaptics();
  const { data, isLoading, patch } = usePresentationSettings(businessId);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (data?.presetId) setActiveId(data.presetId);
  }, [data?.presetId]);

  const presets = useMemo(() => {
    if (vertical && data?.availablePresets?.length) {
      const verticalPresets = listPresentationPresetsForTenantPicker(vertical as BusinessVertical);
      if (verticalPresets.length > 0) {
        return verticalPresets.map((p) => ({
          id: p.id,
          label: p.label,
          description: p.description,
          cssPreset: p.cssPreset,
        }));
      }
    }
    return data?.availablePresets ?? [];
  }, [vertical, data?.availablePresets]);

  if (!presentationPresetsUiEnabled() || !data?.presetsEnabled) return null;
  if (!isLoading && presets.length === 0) return null;

  async function pickPreset(presetId: string) {
    if (!presetId || presetId === data?.presetId || patch.isPending) return;
    haptics.tap();
    setActiveId(presetId);
    try {
      await patch.mutateAsync({ presentationPresetId: presetId });
      haptics.success();
    } catch {
      haptics.warning();
      setActiveId(data?.presetId ?? presetId);
    }
  }

  return (
    <View
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Choose your look</Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>
        Same preset on mobile, web dashboard, and your public booking link. Tap to preview
        live on this device.
      </Text>
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />
      ) : (
        <PresetChipRow
          presets={presets}
          activePresetId={activeId || data?.presetId || ""}
          disabled={patch.isPending}
          onSelect={(id) => void pickPreset(id)}
        />
      )}
      {data?.preset.label ? (
        <Text style={[styles.active, { color: colors.mutedForeground }]}>
          Active:{" "}
          <Text style={{ color: colors.foreground, fontFamily: fonts.bodyMed }}>
            {data.preset.label}
          </Text>
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    gap: 6,
  },
  title: {
    ...type.label,
    fontSize: 16,
    fontFamily: fonts.bodySemi,
  },
  body: {
    ...type.caption,
    lineHeight: 18,
  },
  active: {
    ...type.caption,
    marginTop: 4,
  },
});
