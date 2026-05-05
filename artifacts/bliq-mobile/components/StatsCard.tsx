import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface StatsCardProps {
  label: string;
  value: string | number;
  color?: string;
  subtitle?: string;
}

export function StatsCard({ label, value, color, subtitle }: StatsCardProps) {
  const colors = useColors();
  const accent = color ?? colors.primary;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.dot, { backgroundColor: accent + "33" }]}>
        <View style={[styles.dotInner, { backgroundColor: accent }]} />
      </View>
      <Text style={[styles.value, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: accent }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 4,
    minWidth: 100,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  dotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  value: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  subtitle: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
});
