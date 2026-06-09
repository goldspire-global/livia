import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Linking from "expo-linking";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { fonts } from "@/constants/typography";
import { aurora } from "@/constants/colors";
import { getDashboardBaseUrl } from "@/lib/dashboard-url";
import type { ChainRollup } from "@/lib/chain-rollup";

export function ChainCommerceCard({ rollup }: { rollup: ChainRollup }) {
  const colors = useColors();
  const alerts = rollup.commerceAlerts ?? [];
  const summary = rollup.commerceSummary;
  if (alerts.length === 0 && !summary?.shopsWithActSignal) return null;

  const openBilling = (href: string) => {
    void Linking.openURL(`${getDashboardBaseUrl()}${href}`);
  };

  return (
    <View
      style={[
        styles.card,
        { borderColor: aurora.violet + "44", backgroundColor: aurora.violet + "10" },
      ]}
      testID="chain-commerce-card"
    >
      <View style={styles.head}>
        <Feather name="trending-up" size={16} color={aurora.violet} />
        <Text style={[styles.title, { color: colors.foreground }]}>Portfolio commerce</Text>
      </View>
      {summary ? (
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          {summary.shopsWithActSignal} act · {summary.shopsWithWatchSignal} watch across locations
        </Text>
      ) : null}
      {alerts.slice(0, 3).map((a) => (
        <Pressable
          key={`${a.businessId}-${a.code}`}
          onPress={() => openBilling(a.href)}
          style={[styles.row, { borderColor: colors.border }]}
        >
          <Text style={[styles.rowText, { color: colors.foreground }]} numberOfLines={2}>
            {a.message}
          </Text>
          <Feather name="external-link" size={14} color={colors.primary} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12, gap: 8 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontFamily: fonts.bodySemi, fontSize: 15 },
  sub: { fontSize: 12, lineHeight: 17 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    marginTop: 4,
  },
  rowText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
