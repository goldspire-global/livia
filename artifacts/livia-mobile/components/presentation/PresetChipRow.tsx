import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { fonts, type } from "@/constants/typography";
import { PRESENTATION_PRESET_SWATCH } from "@/lib/presentation-preset-swatch";
import type { PresentationPresetOption } from "@/hooks/usePresentationSettings";

type Props = {
  presets: PresentationPresetOption[];
  activePresetId: string;
  disabled?: boolean;
  onSelect: (presetId: string) => void;
};

export function PresetChipRow({ presets, activePresetId, disabled, onSelect }: Props) {
  const colors = useColors();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {presets.map((preset) => {
        const active = preset.id === activePresetId;
        const swatch = PRESENTATION_PRESET_SWATCH[preset.cssPreset] ?? colors.primary;
        return (
          <Pressable
            key={preset.id}
            onPress={() => onSelect(preset.id)}
            disabled={disabled}
            style={[
              styles.chip,
              {
                borderColor: active ? colors.primary : colors.border,
                backgroundColor: active ? colors.primary + "18" : colors.card,
                opacity: disabled ? 0.6 : 1,
              },
            ]}
          >
            <View style={[styles.swatch, { backgroundColor: swatch }]} />
            <Text
              style={[
                styles.label,
                { color: active ? colors.foreground : colors.mutedForeground },
              ]}
              numberOfLines={2}
            >
              {preset.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 4, paddingRight: 4 },
  chip: {
    width: 108,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  swatch: {
    width: "100%",
    height: 28,
    borderRadius: 6,
  },
  label: {
    ...type.caption,
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    minHeight: 32,
  },
});
