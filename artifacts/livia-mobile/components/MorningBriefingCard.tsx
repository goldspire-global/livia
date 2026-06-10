import { customFetch } from "@workspace/api-client-react";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { GlowPressable } from "@/components/ui/GlowPressable";
import { fonts, type } from "@/constants/typography";
import { useColors } from "@/hooks/useColors";
import { aurora } from "@/constants/colors";

type BriefingPayload = {
  briefingDate: string;
  content: {
    businessName?: string;
    verticalLabel?: string;
    source?: "liv" | "stats_fallback";
    summary: string;
    highlights: string[];
    intel?: {
      commerceSignals?: Array<{ id: string; title: string; severity: string }>;
      capabilityHealth?: { score: number; grade: string; headline: string };
      twinHeadline?: string | null;
      twinSubline?: string | null;
    };
    todayBookings: Array<{
      id: string;
      customerName: string;
      serviceName: string;
    }>;
  };
  live?: boolean;
};

export function MorningBriefingCard({
  businessId,
  businessName,
}: {
  businessId: string;
  businessName?: string;
}) {
  const colors = useColors();
  const router = useRouter();
  const [data, setData] = useState<BriefingPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const res = await customFetch<BriefingPayload>(
        `/api/businesses/${businessId}/morning-briefing`,
      );
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    setData(null);
    void load();
  }, [load, businessId]);

  if (!businessId) return null;

  const actSignals = (data?.content.intel?.commerceSignals ?? []).filter(
    (s) => s.severity === "act",
  );

  return (
    <Animated.View
      entering={FadeInDown.duration(360).springify()}
      style={[
        styles.card,
        {
          backgroundColor: colors.primary + "10",
          borderColor: colors.primary + "33",
        },
      ]}
    >
      <View style={styles.header}>
        <Feather name="sun" size={18} color={colors.primary} />
        <Text style={[styles.title, { color: colors.foreground }]}>
          Liv · {businessName ?? "Today"}
        </Text>
      </View>
      <Text style={[styles.date, { color: colors.mutedForeground }]}>
        {data?.briefingDate ?? "Today"}
        {data?.content.verticalLabel ? ` · ${data.content.verticalLabel}` : ""}
        {data?.content.source === "liv" ? " · written by Liv" : data?.live ? " · loading Liv…" : ""}
      </Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
      ) : data ? (
        <>
          <Text style={[styles.summary, { color: colors.foreground }]}>{data.content.summary}</Text>
          {data.content.highlights.slice(0, 3).map((h) => (
            <Text key={h} style={[styles.bullet, { color: colors.mutedForeground }]}>
              · {h}
            </Text>
          ))}
          {data.content.todayBookings.slice(0, 5).map((b) => (
            <GlowPressable
              key={b.id}
              onPress={() => router.push(`/booking/${b.id}` as never)}
              glowColor={colors.primary}
              haptic="tap"
              style={[styles.bookingRow, { borderColor: colors.border }]}
            >
              <Text style={[styles.bookingName, { color: colors.foreground }]} numberOfLines={1}>
                {b.customerName}
              </Text>
              <Text style={[styles.bookingSvc, { color: colors.mutedForeground }]} numberOfLines={1}>
                {b.serviceName}
              </Text>
            </GlowPressable>
          ))}
          {actSignals.map((s) => (
            <View
              key={s.id}
              style={[styles.actCallout, { borderColor: aurora.violet + "55", backgroundColor: aurora.violet + "14" }]}
            >
              <Feather name="zap" size={14} color={aurora.violet} />
              <Text style={[styles.actText, { color: colors.foreground }]}>{s.title}</Text>
            </View>
          ))}
          {data.content.intel?.twinHeadline ? (
            <Text style={[styles.intel, { color: colors.mutedForeground }]} numberOfLines={2}>
              {data.content.intel.twinHeadline}
              {data.content.intel.twinSubline ? ` — ${data.content.intel.twinSubline}` : ""}
            </Text>
          ) : null}
          {data.content.intel?.capabilityHealth ? (
            <Text style={[styles.intel, { color: colors.mutedForeground }]}>
              Setup {data.content.intel.capabilityHealth.score}% ·{" "}
              {data.content.intel.capabilityHealth.headline}
            </Text>
          ) : null}
          {(data.content.intel?.commerceSignals ?? [])
            .filter((s) => s.severity !== "act")
            .slice(0, 2)
            .map((s) => (
              <Text key={s.id} style={[styles.intel, { color: colors.mutedForeground }]}>
                · {s.title}
              </Text>
            ))}
          {data.content.source !== "liv" ? (
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>
              Liv is writing your briefing for this shop… pull to refresh on Today.
            </Text>
          ) : null}
        </>
      ) : (
        <Text style={[styles.bullet, { color: colors.mutedForeground }]}>Briefing unavailable.</Text>
      )}
      <GlowPressable onPress={() => void load()} glowColor={colors.primary} haptic="tap" style={styles.refresh}>
        <Text style={{ color: colors.primary, fontFamily: fonts.bodySemi, fontSize: 13 }}>
          Refresh
        </Text>
      </GlowPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12 },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontFamily: fonts.bodySemi, fontSize: 15 },
  date: { ...type.caption, marginTop: 4, marginBottom: 8 },
  summary: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  bullet: { fontFamily: fonts.body, fontSize: 13, marginTop: 4 },
  bookingRow: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    gap: 2,
  },
  bookingName: { fontFamily: fonts.bodySemi, fontSize: 13 },
  bookingSvc: { fontSize: 12 },
  actCallout: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  actText: { flex: 1, fontFamily: fonts.bodySemi, fontSize: 13 },
  intel: { fontFamily: fonts.body, fontSize: 12, marginTop: 6, lineHeight: 17 },
  hint: { ...type.caption, marginTop: 8 },
  refresh: { marginTop: 10, alignSelf: "flex-start" },
});
