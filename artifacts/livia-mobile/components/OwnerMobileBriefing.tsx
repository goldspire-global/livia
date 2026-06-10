import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ownerHomeLivSuggestions } from "@workspace/policy";
import { useColors } from "@/hooks/useColors";
import { useOperationalChrome } from "@/lib/operational-chrome";
import { fonts } from "@/constants/typography";
import { GlowPressable } from "@/components/ui/GlowPressable";
import { openBriefingHref } from "@/lib/mobile-briefing-nav";
import { useBusiness } from "@/contexts/BusinessContext";

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
  const router = useRouter();
  const { currentBusiness } = useBusiness();
  const chrome = useOperationalChrome(currentBusiness?.id);
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

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.wrap}
    >
      {suggestions.map((s) => (
        <GlowPressable
          key={s.id}
          onPress={() => openBriefingHref(s.href, router)}
          glowColor={colors.primary}
          haptic="selection"
          style={[
            styles.chip,
            chrome.native
              ? chrome.chip()
              : { borderColor: colors.border, backgroundColor: colors.card },
          ]}
          accessibilityRole="button"
        >
          <Text style={[styles.chipText, { color: colors.foreground }]}>{s.label}</Text>
          <Feather name="arrow-right" size={12} color={colors.mutedForeground} />
        </GlowPressable>
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
  const chrome = useOperationalChrome();
  if (!commerce?.capturedLabel || (commerce.paymentCount30d ?? 0) <= 0) return null;

  return (
    <GlowPressable
      onPress={onPress}
      glowColor={colors.success}
      haptic="tap"
      disabled={!onPress}
      style={[
        styles.revenueCard,
        chrome.native
          ? chrome.panel()
          : { borderColor: colors.border, backgroundColor: colors.card },
      ]}
      accessibilityRole={onPress ? "button" : "text"}
    >
      <Text style={[styles.revenueLabel, { color: colors.mutedForeground }]}>Revenue (30d)</Text>
      <Text style={[styles.revenueValue, { color: colors.success }]}>{commerce.capturedLabel}</Text>
      {commerce.captureRatePercent != null ? (
        <Text style={[styles.revenueSub, { color: colors.mutedForeground }]}>
          {commerce.captureRatePercent}% capture
        </Text>
      ) : null}
    </GlowPressable>
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
