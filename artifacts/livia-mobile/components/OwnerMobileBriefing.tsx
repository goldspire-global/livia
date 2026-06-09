import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ownerHomeLivSuggestions } from "@workspace/policy";
import { useColors } from "@/hooks/useColors";
import { fonts } from "@/constants/typography";
import { getDashboardBaseUrl } from "@/lib/dashboard-url";
import * as Linking from "expo-linking";

type CommerceSlice = {
  capturedMinor30d?: number;
  captureRatePercent?: number | null;
  paymentCount30d?: number;
  capturedLabel?: string;
};

export function OwnerMobileBriefingChips({
  pendingCount,
  handedOffCount,
  atRiskCount = 0,
  lowFeedbackCount = 0,
  confirmedCount = 0,
  weekBookings = 0,
  commerce,
}: {
  pendingCount: number;
  handedOffCount: number;
  atRiskCount?: number;
  lowFeedbackCount?: number;
  confirmedCount?: number;
  weekBookings?: number;
  commerce?: CommerceSlice;
}) {
  const colors = useColors();
  const suggestions = ownerHomeLivSuggestions({
    pendingCount,
    handedOffCount,
    atRiskCount,
    lowFeedbackCount,
    commerce: {
      captureRatePercent: commerce?.captureRatePercent,
      paymentCount30d: commerce?.paymentCount30d,
      capturedMinor30d: commerce?.capturedMinor30d,
      demandBookings: pendingCount + confirmedCount,
      weekBookings,
    },
  });

  if (suggestions.length === 0) return null;

  const openHref = (href: string) => {
    void Linking.openURL(`${getDashboardBaseUrl()}${href}`);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.wrap}
    >
      {suggestions.map((s) => (
        <Pressable
          key={s.id}
          onPress={() => openHref(s.href)}
          style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.card }]}
          accessibilityRole="button"
        >
          <Text style={[styles.chipText, { color: colors.foreground }]}>{s.label}</Text>
          <Feather name="arrow-right" size={12} color={colors.mutedForeground} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

export function OwnerMobileRevenueStat({
  commerce,
  onPress,
}: {
  commerce?: CommerceSlice;
  onPress?: () => void;
}) {
  const colors = useColors();
  if (!commerce?.capturedLabel || (commerce.paymentCount30d ?? 0) <= 0) return null;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.revenueCard, { borderColor: colors.border, backgroundColor: colors.card }]}
      accessibilityRole={onPress ? "button" : "text"}
    >
      <Text style={[styles.revenueLabel, { color: colors.mutedForeground }]}>Revenue (30d)</Text>
      <Text style={[styles.revenueValue, { color: colors.success }]}>{commerce.capturedLabel}</Text>
      {commerce.captureRatePercent != null ? (
        <Text style={[styles.revenueSub, { color: colors.mutedForeground }]}>
          {commerce.captureRatePercent}% capture
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 8 },
  row: { gap: 8, paddingVertical: 2 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontFamily: fonts.bodySemi, fontSize: 12 },
  revenueCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    minHeight: 92,
    justifyContent: "center",
  },
  revenueLabel: { fontFamily: fonts.body, fontSize: 11, marginBottom: 4 },
  revenueValue: { fontFamily: fonts.bodySemi, fontSize: 22 },
  revenueSub: { fontFamily: fonts.body, fontSize: 10, marginTop: 4 },
});
