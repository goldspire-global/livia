import { Feather } from "@expo/vector-icons";
import type { PresentationLayoutMorph } from "@workspace/policy";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { BeautyTodayHandoffStrip } from "@/components/beauty/BeautyTodayHandoffStrip";
import { BookingCard } from "@/components/BookingCard";
import { StatsCard } from "@/components/StatsCard";
import { GlowPressable } from "@/components/ui/GlowPressable";
import { aurora } from "@/constants/colors";
import { elevation } from "@/constants/elevation";
import { fonts, type } from "@/constants/typography";
import { useColors } from "@/hooks/useColors";
import { useHaptics } from "@/hooks/useHaptics";
import { MobileTodayMorphStrip } from "@/components/today/MobileTodayMorphStrip";

type BookingPreview = {
  id: string;
  startAt: string;
  endAt?: string;
  status: string;
  customer?: { displayName?: string | null; firstName?: string | null } | null;
  service?: { name?: string | null } | null;
  staff?: { displayName?: string | null } | null;
  notes?: string | null;
};

type Props = {
  morph: PresentationLayoutMorph;
  accent: string;
  vertical?: string | null;
  category?: string | null;
  cssPreset?: string | null;
  livLine: string;
  pendingCount: number;
  handoffCount: number;
  pendingPreview: BookingPreview[];
  pendingHidden: number;
  next: BookingPreview | null;
  nextRelative?: string | null;
  nextTimeLabel?: string;
  todayCount: number;
  confirmedCount: number;
  completedToday: number;
  isLoading: boolean;
  businessTz?: string;
  businessName?: string;
  onPending: () => void;
  onNewBooking: () => void;
  onNextLongPress?: () => void;
};

export function BeautyMorphTodayHome({
  morph,
  accent,
  vertical,
  category,
  cssPreset,
  livLine,
  pendingCount,
  handoffCount,
  pendingPreview,
  pendingHidden,
  next,
  nextRelative,
  nextTimeLabel,
  todayCount,
  confirmedCount,
  completedToday,
  isLoading,
  businessTz,
  businessName,
  onPending,
  onNewBooking,
  onNextLongPress,
}: Props) {
  const colors = useColors();
  const router = useRouter();
  const haptics = useHaptics();
  const isSplitInbox = morph === "split-inbox";
  const isCockpit = morph === "cockpit";
  const isMenuCard = morph === "menu-card";
  const heroRadius = isMenuCard ? 8 : isCockpit ? 14 : 18;

  return (
    <View style={styles.root} testID={`beauty-morph-today-${morph}`}>
      <MobileTodayMorphStrip
        vertical={vertical}
        category={category}
        cssPreset={cssPreset}
      />

      <Animated.View
        entering={FadeInDown.duration(360).springify()}
        style={[
          styles.hero,
          {
            borderRadius: heroRadius,
            borderColor: accent + (isCockpit ? "44" : "33"),
            backgroundColor: isCockpit ? accent + "12" : accent + "08",
          },
          elevation.resting,
        ]}
      >
        <Text style={[styles.heroEyebrow, { color: accent }]}>
          {isSplitInbox ? "Inbox + chair" : isCockpit ? "Floor cockpit" : isMenuCard ? "Editorial menu" : "Studio atrium"}
        </Text>
        <Text style={[styles.livLine, { color: colors.foreground }]} numberOfLines={3}>
          {livLine}
        </Text>
        {businessName ? (
          <Text style={[styles.bizMeta, { color: colors.mutedForeground }]}>
            {businessName} · {todayCount} today
          </Text>
        ) : null}
      </Animated.View>

      {(isSplitInbox || handoffCount > 0 || pendingCount > 0) ? (
        <BeautyTodayHandoffStrip handoffCount={handoffCount} pendingCount={pendingCount} />
      ) : null}

      {pendingCount > 0 ? (
        <View style={[styles.pendingShell, { borderColor: accent + "44", borderRadius: heroRadius }]}>
          <Pressable onPress={onPending} style={styles.pendingHead}>
            <Text style={[styles.pendingTitle, { color: colors.foreground, fontFamily: isMenuCard ? fonts.serif : fonts.bodySemi }]}>
              Needs your yes ({pendingCount})
            </Text>
            <Text style={{ color: accent, fontFamily: fonts.bodySemi, fontSize: 13 }}>Review all</Text>
          </Pressable>
          {isSplitInbox ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pendingScroll}>
              {pendingPreview.map((b, i) => (
                <View key={b.id} style={[styles.pendingCardWide, { borderColor: accent + "44", backgroundColor: colors.card }]}>
                  <BookingCard
                    booking={{ ...b, endAt: b.endAt ?? b.startAt }}
                    timeZone={businessTz}
                    showDate
                    index={i}
                    onPress={() => router.push(`/booking/${b.id}`)}
                  />
                </View>
              ))}
            </ScrollView>
          ) : (
            pendingPreview.slice(0, isMenuCard ? 4 : 2).map((b, i) => (
              <BookingCard
                key={b.id}
                booking={{ ...b, endAt: b.endAt ?? b.startAt }}
                timeZone={businessTz}
                showDate
                index={i}
                onPress={() => router.push(`/booking/${b.id}`)}
              />
            ))
          )}
          {pendingHidden > 0 ? (
            <Pressable onPress={onPending}>
              <Text style={{ color: accent, fontFamily: fonts.bodySemi, marginTop: 4 }}>+{pendingHidden} more</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {!isLoading && next ? (
        <GlowPressable
          onPress={() => {
            haptics.tap();
            router.push(`/booking/${next.id}`);
          }}
          onLongPress={onNextLongPress}
          delayLongPress={350}
          glowColor={aurora.cyan}
          haptic="tap"
        >
          <View style={[styles.nextCard, { backgroundColor: colors.card, borderColor: aurora.cyan + "44" }, elevation.floating]}>
            <View style={styles.nextRow}>
              <Text style={[styles.nextEyebrow, { color: aurora.cyan }]}>NEXT UP</Text>
              <Text style={[styles.nextTime, { color: colors.foreground }]}>{nextRelative ?? nextTimeLabel}</Text>
            </View>
            <Text style={[styles.nextName, { color: colors.foreground }]} numberOfLines={1}>
              {next.customer?.displayName ?? next.customer?.firstName ?? "Walk-in"}
            </Text>
            <Text style={[styles.nextSub, { color: colors.mutedForeground }]} numberOfLines={1}>
              {next.service?.name ?? "Service"}
            </Text>
          </View>
        </GlowPressable>
      ) : null}

      <GlowPressable
        onPress={onNewBooking}
        glowColor={accent}
        haptic="impact"
        style={[styles.ctaBtn, { backgroundColor: colors.primary }, elevation.floating]}
        testID="new-booking-button"
      >
        <Feather name="plus" size={16} color={colors.primaryForeground} />
        <Text style={[styles.ctaText, { color: colors.primaryForeground }]}>New booking</Text>
      </GlowPressable>

      <View style={styles.statsRow}>
        {isLoading ? null : (
          <>
            <StatsCard label="Today" value={todayCount} color={colors.primary} variant="hero" index={0} />
            <StatsCard label="Pending" value={pendingCount} color={colors.warning} index={1} onPress={pendingCount > 0 ? onPending : undefined} />
            <StatsCard label={isCockpit ? "Confirmed" : "Done"} value={isCockpit ? confirmedCount : completedToday} color={colors.success} index={2} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 14 },
  hero: { borderWidth: 1, padding: 16, gap: 6 },
  heroEyebrow: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.9, textTransform: "uppercase" },
  livLine: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  bizMeta: { ...type.caption, marginTop: 2 },
  pendingShell: { borderWidth: 1, padding: 12, gap: 8 },
  pendingHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pendingTitle: { fontSize: 16 },
  pendingScroll: { gap: 10, paddingVertical: 4 },
  pendingCardWide: { width: 280, borderWidth: 1, borderRadius: 14, padding: 8 },
  nextCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 4 },
  nextRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  nextEyebrow: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1 },
  nextTime: { fontFamily: fonts.bodySemi, fontSize: 14 },
  nextName: { fontFamily: fonts.serifMedium, fontSize: 24, marginTop: 4 },
  nextSub: { ...type.body, fontSize: 14 },
  ctaBtn: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 999 },
  ctaText: { fontFamily: fonts.bodySemi, fontSize: 15 },
  statsRow: { flexDirection: "row", gap: 10 },
});
