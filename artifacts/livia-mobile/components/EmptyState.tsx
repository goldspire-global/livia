import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Shimmer } from "@/components/brand/Shimmer";
import { EmptyVignette } from "@/components/EmptyVignette";
import { elevation } from "@/constants/elevation";
import { fonts, type } from "@/constants/typography";
import { useColors } from "@/hooks/useColors";
import { useHaptics } from "@/hooks/useHaptics";

interface EmptyStateProps {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  isLoading?: boolean;
}

export function EmptyState({
  icon = "inbox",
  title,
  subtitle,
  actionLabel,
  onAction,
  isLoading,
}: EmptyStateProps) {
  const colors = useColors();
  const haptics = useHaptics();

  if (isLoading) {
    return (
      <View style={styles.skeletonWrap}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.skeletonRow}>
            <Shimmer width={42} height={42} radius={21} />
            <View style={{ flex: 1, gap: 8 }}>
              <Shimmer width="65%" height={14} />
              <Shimmer width="40%" height={11} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.vignetteWrap}>
        <EmptyVignette size={170} />
        <View pointerEvents="none" style={styles.iconCenter}>
          <Feather name={icon} size={22} color={colors.mutedForeground} />
        </View>
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }, elevation.floating]}
          onPress={() => {
            haptics.tap();
            onAction();
          }}
          activeOpacity={0.85}
        >
          <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 14,
    minHeight: 240,
  },
  vignetteWrap: {
    width: 170,
    height: 170,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  iconCenter: {
    position: "absolute",
    width: 170,
    height: 170,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: fonts.serifMedium,
    fontSize: 22,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  subtitle: { ...type.body, textAlign: "center", maxWidth: 260 },
  button: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: { ...type.label, fontSize: 14 },
  skeletonWrap: { padding: 16, gap: 14 },
  skeletonRow: { flexDirection: "row", alignItems: "center", gap: 12 },
});
