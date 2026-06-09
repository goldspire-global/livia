import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Linking from "expo-linking";
import { Feather } from "@expo/vector-icons";
import { useGetActivityFeed } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { fonts } from "@/constants/typography";
import { getDashboardBaseUrl } from "@/lib/dashboard-url";

function relativeTime(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.round(mins / 60)}h`;
  return `${Math.round(mins / 1440)}d`;
}

export function ActivityFeedCard({ businessId }: { businessId: string }) {
  const colors = useColors();
  const { data, isLoading } = useGetActivityFeed(
    businessId,
    { limit: 8 },
    { query: { enabled: !!businessId, staleTime: 60_000 } as never },
  );

  const rows = data ?? [];
  if (!isLoading && rows.length === 0) return null;

  const openHref = (href: string) => {
    void Linking.openURL(`${getDashboardBaseUrl()}${href}`);
  };

  return (
    <View
      style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}
      testID="activity-feed-card"
    >
      <View style={styles.head}>
        <Feather name="clock" size={14} color={colors.primary} />
        <Text style={[styles.title, { color: colors.foreground }]}>Recent activity</Text>
      </View>
      {isLoading ? (
        <Text style={[styles.muted, { color: colors.mutedForeground }]}>Loading…</Text>
      ) : (
        rows.slice(0, 6).map((row) => {
          const label = row.label ?? row.type.replace(/_/g, " ").toLowerCase();
          const content = (
            <View
              style={[
                styles.row,
                { borderColor: colors.border },
                row.priority === "act" && { borderLeftWidth: 3, borderLeftColor: "#ef4444" },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.foreground }]} numberOfLines={1}>
                  {label}
                </Text>
                {row.detail ? (
                  <Text style={[styles.muted, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {row.detail}
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.time, { color: colors.mutedForeground }]}>
                {relativeTime(row.createdAt)}
              </Text>
            </View>
          );
          if (row.href) {
            return (
              <Pressable key={row.id} onPress={() => openHref(row.href!)}>
                {content}
              </Pressable>
            );
          }
          return <View key={row.id}>{content}</View>;
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12, gap: 6 },
  head: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  title: { fontFamily: fonts.bodySemi, fontSize: 15 },
  muted: { fontSize: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    marginTop: 4,
  },
  rowTitle: { fontSize: 13, fontFamily: fonts.bodySemi },
  time: { fontSize: 10, fontFamily: fonts.mono },
});
