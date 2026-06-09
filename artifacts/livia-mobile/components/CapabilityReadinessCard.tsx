import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import {
  useGetTenantCapabilities,
  usePatchTenantCapabilityInstance,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { resolveCommerceCapabilityBlockers, type ResolvedPlatformCapability } from "@workspace/policy";
import { useColors } from "@/hooks/useColors";
import { useHaptics } from "@/hooks/useHaptics";
import { fonts } from "@/constants/typography";
import { getDashboardBaseUrl } from "@/lib/dashboard-url";
import * as Linking from "expo-linking";

export function CapabilityReadinessCard({ businessId }: { businessId: string }) {
  const colors = useColors();
  const haptics = useHaptics();
  const qc = useQueryClient();
  const { data } = useGetTenantCapabilities(businessId, {
    query: { enabled: !!businessId } as never,
  });

  const patch = usePatchTenantCapabilityInstance({
    mutation: {
      onSuccess: () => {
        void qc.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/capabilities`] });
        void qc.invalidateQueries({ queryKey: ["owner-intelligence", businessId] });
      },
    },
  });

  if (!data) return null;

  const commerceBlockers = resolveCommerceCapabilityBlockers(
    data.platformCapabilities as ResolvedPlatformCapability[],
  );
  const blocked = data.platformCapabilities.filter((c) => c.readinessBlockers.length > 0);
  const suspended = data.platformCapabilities.filter((c) => c.state === "suspended");
  const health = data.capabilityHealth;

  if (
    commerceBlockers.length === 0 &&
    blocked.length === 0 &&
    suspended.length === 0 &&
    (!health || health.score >= 85)
  ) {
    return null;
  }

  return (
    <View
      style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}
      testID="capability-readiness-card"
    >
      <View style={styles.head}>
        <Feather name="layers" size={14} color={colors.primary} />
        <Text style={[styles.title, { color: colors.foreground }]}>Setup to finish</Text>
        {health && health.score < 85 ? (
          <Text style={[styles.score, { color: colors.mutedForeground }]}>
            {health.score}% · {health.grade}
          </Text>
        ) : null}
      </View>

      {commerceBlockers.slice(0, 2).map((b) => (
        <Pressable
          key={`${b.capabilityId}-${b.blocker}`}
          onPress={() => void Linking.openURL(`${getDashboardBaseUrl()}${b.href}`)}
          style={[styles.row, { borderColor: colors.border }]}
        >
          <Feather name="credit-card" size={12} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: colors.foreground }]}>{b.capabilityName}</Text>
            <Text style={[styles.rowBody, { color: colors.mutedForeground }]} numberOfLines={2}>
              {b.blocker}
            </Text>
          </View>
          <Feather name="external-link" size={12} color={colors.mutedForeground} />
        </Pressable>
      ))}

      {suspended.slice(0, 2).map((c) => (
        <View key={c.id} style={[styles.row, { borderColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: colors.foreground }]}>{c.name}</Text>
            <Text style={[styles.rowBody, { color: colors.mutedForeground }]}>Paused</Text>
          </View>
          <Pressable
            onPress={() => {
              haptics.tap();
              patch.mutate({
                businessId,
                capabilityId: c.id,
                data: { action: "resume" },
              });
            }}
            disabled={patch.isPending}
            style={[styles.actionBtn, { borderColor: colors.primary }]}
            testID={`capability-resume-${c.id}`}
          >
            {patch.isPending ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={[styles.actionText, { color: colors.primary }]}>Resume</Text>
            )}
          </Pressable>
        </View>
      ))}

      {blocked
        .filter((c) => !commerceBlockers.some((b) => b.capabilityId === c.id))
        .slice(0, 2)
        .map((c) => (
          <View key={c.id} style={[styles.row, { borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.foreground }]}>{c.name}</Text>
              <Text style={[styles.rowBody, { color: colors.mutedForeground }]} numberOfLines={2}>
                {c.readinessBlockers[0]}
              </Text>
            </View>
            {c.state !== "defined" && c.state !== "suspended" ? (
              <Pressable
                onPress={() => {
                  haptics.tap();
                  patch.mutate({
                    businessId,
                    capabilityId: c.id,
                    data: { action: "suspend" },
                  });
                }}
                disabled={patch.isPending}
                style={[styles.actionBtn, { borderColor: colors.border }]}
                testID={`capability-pause-${c.id}`}
              >
                <Text style={[styles.actionText, { color: colors.mutedForeground }]}>Pause</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 8, marginBottom: 8 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontFamily: fonts.bodySemi, fontSize: 13, flex: 1 },
  score: { fontFamily: fonts.body, fontSize: 11 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowTitle: { fontFamily: fonts.bodySemi, fontSize: 12 },
  rowBody: { fontFamily: fonts.body, fontSize: 11, lineHeight: 15, marginTop: 2 },
  actionBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 64,
    alignItems: "center",
  },
  actionText: { fontFamily: fonts.bodySemi, fontSize: 11 },
});
