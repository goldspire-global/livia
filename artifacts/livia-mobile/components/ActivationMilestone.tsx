import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { useBusiness } from "@/contexts/BusinessContext";
import { useMembership } from "@/hooks/useMembership";
import { useColors } from "@/hooks/useColors";
import { Shimmer } from "@/components/brand/Shimmer";

/**
 * Sacred V1 metric banner — parity with dashboard ActivationMilestone.
 */
export function ActivationMilestone() {
  const colors = useColors();
  const { currentBusiness } = useBusiness();
  const { role } = useMembership();
  const bid = currentBusiness?.id ?? "";

  const { data, isLoading } = useGetDashboardSummary(bid, {
    query: { enabled: !!bid } as never,
  });

  if (!currentBusiness || !["OWNER", "ADMIN"].includes(role ?? "")) return null;

  if (isLoading) {
    return (
      <View style={styles.wrap} testID="activation-milestone-loading">
        <Shimmer width="100%" height={52} radius={12} />
      </View>
    );
  }

  const activation = data?.activation;
  if (!activation) return null;

  if (activation.sacredMetricMet && activation.timeToFirstBookingLabel) {
    return (
      <View
        style={[styles.card, styles.activated, { borderColor: colors.primary + "33" }]}
        testID="activation-milestone-activated"
      >
        <Feather name="check-circle" size={20} color={colors.primary} />
        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.foreground }]}>First booking received</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            Activated in {activation.timeToFirstBookingLabel}
            {activation.activationSource === "public" ? " via your booking page" : ""}.
          </Text>
        </View>
      </View>
    );
  }

  if (activation.status === "in_progress") {
    const remaining = activation.activationStepsTotal - activation.activationStepsComplete;
    return (
      <View
        style={[styles.card, styles.progress, { borderColor: "#d9770640" }]}
        testID="activation-milestone-in-progress"
      >
        <Feather name="zap" size={20} color="#d97706" />
        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.foreground }]}>Almost live</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            {remaining} setup step{remaining === 1 ? "" : "s"} left — your sacred metric is the first
            real booking.
          </Text>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  activated: { backgroundColor: "rgba(99, 102, 241, 0.06)" },
  progress: { backgroundColor: "rgba(217, 119, 6, 0.06)" },
  copy: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: "600" },
  sub: { fontSize: 13, lineHeight: 18 },
});
