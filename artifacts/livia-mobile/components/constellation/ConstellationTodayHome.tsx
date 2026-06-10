import { Feather } from "@expo/vector-icons";
import type { ConversationListItem } from "@workspace/api-client-react";
import { resolveOwnerHomeBriefingCta } from "@workspace/policy";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { BookingCard } from "@/components/BookingCard";
import { LivPulse } from "@/components/brand/LivPulse";
import { ConstellationGlassCard } from "@/components/constellation/ConstellationGlassCard";
import { ConstellationGradientTitle } from "@/components/constellation/ConstellationGradientTitle";
import { InboxThreadRow } from "@/components/inbox/InboxThreadRow";
import { GlowPressable } from "@/components/ui/GlowPressable";
import { fonts, type } from "@/constants/typography";
import { useColors } from "@/hooks/useColors";
import { useHaptics } from "@/hooks/useHaptics";
import { morphOwnerGreeting } from "@/lib/briefing-display";
import { usePersonaBriefing } from "@/hooks/usePersonaBriefing";
import { formatRelativeIso, useRelativeTime } from "@/hooks/useRelativeTime";
import { openBriefingHref } from "@/lib/mobile-briefing-nav";
import { resolveConstellationVerticalChrome } from "@/lib/constellation-preset";
import { gatewayTheme } from "@/lib/gateway-theme";
import { useOperationalChrome } from "@/lib/operational-chrome";
import { asHref } from "@/lib/navigation";

type BookingPreview = {
  id: string;
  startAt: string;
  endAt?: string;
  status: string;
  customer?: { displayName?: string | null; firstName?: string | null } | null;
  service?: { name?: string | null } | null;
  staff?: { displayName?: string | null } | null;
};

type Props = {
  businessId: string;
  businessName?: string;
  businessTz?: string;
  vertical?: string | null;
  category?: string | null;
  headerDate: string;
  livLine: string;
  livLoading?: boolean;
  livPulse?: string;
  pendingCount: number;
  handoffCount: number;
  todayCount: number;
  completedToday: number;
  isLoading: boolean;
  heroPending: BookingPreview | null;
  next: BookingPreview | null;
  schedulePreview: BookingPreview[];
  inboxThreads: ConversationListItem[];
  inboxLoading?: boolean;
  onPending: () => void;
  onNewBooking: () => void;
  onConfirmBooking?: (id: string) => void;
};

function formatTime(iso: string, tz: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: tz,
  });
}

const SIGNAL_AMBER = "#c9a227";
const SUCCESS_TEAL = "#34d399";

function KpiOrbit({
  label,
  value,
  sub,
  tone,
  onPress,
  shellAccent,
}: {
  label: string;
  value: number;
  sub?: string;
  tone?: "warn" | "good" | "neutral";
  onPress?: () => void;
  shellAccent: string;
}) {
  const colors = useColors();
  const accent =
    tone === "warn" ? SIGNAL_AMBER : tone === "good" ? SUCCESS_TEAL : shellAccent;
  const body = (
    <View
      style={[
        styles.kpi,
        {
          borderColor: tone === "warn" ? accent + "55" : "rgba(217,195,154,0.19)",
          backgroundColor: "rgba(42,45,58,0.52)",
          borderLeftWidth: tone === "warn" || tone === "good" ? 2 : 1,
          borderLeftColor: tone === "warn" || tone === "good" ? accent : "rgba(217,195,154,0.19)",
        },
      ]}
    >
      <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.kpiValue, { color: colors.foreground }]}>{value}</Text>
      {sub ? <Text style={[styles.kpiSub, { color: accent }]}>{sub}</Text> : null}
    </View>
  );
  if (!onPress) return body;
  return (
    <GlowPressable onPress={onPress} glowColor={accent} haptic="selection">
      {body}
    </GlowPressable>
  );
}

export function ConstellationTodayHome({
  businessId,
  businessName,
  businessTz = Intl.DateTimeFormat().resolvedOptions().timeZone,
  vertical,
  category,
  headerDate,
  livLine,
  livLoading,
  livPulse,
  pendingCount,
  handoffCount,
  todayCount,
  completedToday,
  isLoading,
  heroPending,
  next,
  schedulePreview,
  inboxThreads,
  inboxLoading,
  onPending,
  onNewBooking,
  onConfirmBooking,
}: Props) {
  const colors = useColors();
  const router = useRouter();
  const haptics = useHaptics();
  const chrome = useOperationalChrome(businessId);
  const { firstName, ritual } = usePersonaBriefing();
  const greeting = morphOwnerGreeting(firstName);
  const [signalsOpen, setSignalsOpen] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const nextRelative = useRelativeTime(next?.startAt);
  const preset = resolveConstellationVerticalChrome(vertical, category);
  const accent = preset.ritualAccent;
  const shellAccent = preset.shellAccent;
  const briefingCta = resolveOwnerHomeBriefingCta({
    pendingCount,
    handedOffCount: handoffCount,
    fallbackHref: ritual.primaryAction?.href ?? "/bookings",
    fallbackLabel: ritual.primaryAction?.label ?? "View calendar",
  });

  const weekAvgHint = useMemo(() => {
    if (isLoading) return undefined;
    return todayCount > 0 ? `${completedToday} done` : "—";
  }, [isLoading, todayCount, completedToday]);

  const allClear = !isLoading && pendingCount === 0 && handoffCount === 0 && !heroPending;
  const inboxPeek = inboxThreads.slice(0, 2);
  const pulseState: "idle" | "active" =
    livPulse === "act" || livPulse === "watch" ? "active" : "idle";

  return (
    <View style={styles.root} testID="constellation-today-home">
      <Animated.View entering={FadeInDown.duration(260).springify()} style={styles.greetRow}>
        <View style={{ flex: 1 }}>
          <ConstellationGradientTitle>{greeting}</ConstellationGradientTitle>
          {businessName ? (
            <Text style={styles.bizName} numberOfLines={1}>
              {businessName}
            </Text>
          ) : null}
        </View>
        <Text style={styles.dateMono}>{headerDate}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(40).duration(240).springify()}>
        <ConstellationGlassCard
          accentBar={!preset.beautyBriefing}
          accentColor={accent}
          variant={preset.beautyBriefing ? "beauty" : preset.wellnessBriefing ? "wellness" : "default"}
          testID="constellation-briefing"
        >
          <View style={styles.briefingTop}>
            {preset.beautyBriefing ? (
              <View style={[styles.beautyIcon, { borderColor: accent + "73" }]}>
                <Feather name="feather" size={15} color={accent} />
              </View>
            ) : (
              <Feather name={preset.wellnessBriefing ? "activity" : "star"} size={14} color={shellAccent} />
            )}
            <Text style={[styles.briefingEyebrow, { color: accent + "cc" }]}>{preset.briefingEyebrow}</Text>
            <LivPulse size={8} state={pulseState} />
          </View>
          {livLoading ? (
            <ActivityIndicator color={accent} style={{ alignSelf: "flex-start", marginVertical: 8 }} />
          ) : (
            <Text style={styles.briefingLine} numberOfLines={3}>
              {livLine}
            </Text>
          )}
          {preset.beautyBriefing || preset.wellnessBriefing ? (
            <GlowPressable
              onPress={() => openBriefingHref(briefingCta.href, router)}
              glowColor={accent}
              haptic="tap"
              style={[styles.briefingCtaSolid, { backgroundColor: accent }]}
            >
              <Text style={[styles.briefingCtaSolidText, { color: "#fff" }]}>{briefingCta.label}</Text>
              <Feather name="arrow-right" size={14} color="#fff" />
            </GlowPressable>
          ) : (
            <GlowPressable
              onPress={() => openBriefingHref(briefingCta.href, router)}
              glowColor={shellAccent}
              haptic="tap"
              style={styles.briefingCtaWrap}
            >
              <LinearGradient
                colors={["#d9c39a", "#a88f5c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.briefingCtaGradient}
              >
                <Text style={styles.briefingCtaSolidText}>{briefingCta.label}</Text>
                <Feather name="arrow-right" size={14} color={gatewayTheme.platformInk} />
              </LinearGradient>
            </GlowPressable>
          )}
        </ConstellationGlassCard>
      </Animated.View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.kpiRow}
        style={styles.kpiScroll}
      >
        <KpiOrbit label="Today" value={todayCount} sub={weekAvgHint} shellAccent={shellAccent} />
        <KpiOrbit
          label="To confirm"
          value={pendingCount}
          sub={pendingCount === 1 ? "pending" : pendingCount > 0 ? "pending" : undefined}
          tone={pendingCount > 0 ? "warn" : "neutral"}
          onPress={pendingCount > 0 ? onPending : undefined}
          shellAccent={shellAccent}
        />
        <KpiOrbit
          label="Handoffs"
          value={handoffCount}
          tone={handoffCount > 0 ? "warn" : "neutral"}
          onPress={handoffCount > 0 ? () => router.push(asHref("/inbox")) : undefined}
          shellAccent={shellAccent}
        />
        <KpiOrbit label="Done" value={completedToday} tone="good" shellAccent={shellAccent} />
      </ScrollView>

      {heroPending && !isLoading ? (
        <Animated.View entering={FadeInDown.delay(80).duration(240).springify()}>
          <ConstellationGlassCard style={{ marginBottom: 12 }}>
            <View style={styles.focalHead}>
              <Text style={[styles.focalEyebrow, { color: "#f59e0b" }]}>
                Needs your yes{pendingCount > 1 ? ` · ${pendingCount} total` : ""}
              </Text>
              <Pressable onPress={onPending}>
                <Text style={[styles.focalLink, { color: accent }]}>All</Text>
              </Pressable>
            </View>
            <BookingCard
              booking={heroPending as Parameters<typeof BookingCard>[0]["booking"]}
              timeZone={businessTz}
              showDate
              index={0}
              onPress={() => router.push(`/booking/${heroPending.id}`)}
            />
            {onConfirmBooking ? (
              <View style={styles.focalActions}>
                <GlowPressable
                  onPress={() => {
                    if (confirmingId) return;
                    setConfirmingId(heroPending.id);
                    void Promise.resolve(onConfirmBooking(heroPending.id)).finally(() =>
                      setConfirmingId(null),
                    );
                  }}
                  glowColor={accent}
                  haptic="impact"
                  style={[
                    styles.confirmBtn,
                    {
                      backgroundColor: preset.beautyBriefing ? accent : shellAccent,
                      opacity: confirmingId === heroPending.id ? 0.7 : 1,
                    },
                  ]}
                >
                  {confirmingId === heroPending.id ? (
                    <ActivityIndicator size="small" color={gatewayTheme.platformInk} />
                  ) : (
                    <Feather name="check" size={16} color={gatewayTheme.platformInk} />
                  )}
                  <Text style={styles.confirmText}>
                    {confirmingId === heroPending.id ? "Confirming…" : "Confirm"}
                  </Text>
                </GlowPressable>
                <Pressable onPress={() => router.push(`/booking/${heroPending.id}`)} style={styles.reviewBtn}>
                  <Text style={[styles.reviewText, { color: colors.mutedForeground }]}>Review</Text>
                </Pressable>
              </View>
            ) : null}
          </ConstellationGlassCard>
        </Animated.View>
      ) : !isLoading && next ? (
        <Animated.View entering={FadeInDown.delay(80).duration(240).springify()}>
          <GlowPressable
            onPress={() => router.push(`/booking/${next.id}`)}
            glowColor={accent}
            haptic="tap"
          >
            <ConstellationGlassCard>
              <View style={styles.focalHead}>
                <Text style={[styles.focalEyebrow, { color: shellAccent }]}>Next up</Text>
                {nextRelative ? (
                  <Text style={[styles.focalLink, { color: shellAccent }]}>{nextRelative}</Text>
                ) : null}
              </View>
              <Text style={[styles.nextTime, { color: colors.foreground }]}>
                {formatTime(next.startAt, businessTz)}
              </Text>
              <Text style={[styles.nextName, { color: colors.foreground }]} numberOfLines={1}>
                {next.customer?.displayName ?? next.customer?.firstName ?? "Walk-in"}
              </Text>
              <Text style={[styles.nextSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                {next.service?.name ?? "Service"}
                {next.staff?.displayName ? ` · ${next.staff.displayName}` : ""}
              </Text>
            </ConstellationGlassCard>
          </GlowPressable>
        </Animated.View>
      ) : allClear ? (
        <ConstellationGlassCard style={{ marginBottom: 12 }} testID="constellation-all-clear">
          <View style={styles.allClearRow}>
            <Feather name="check-circle" size={18} color="#34d399" />
            <Text style={[styles.allClearText, { color: colors.mutedForeground }]}>
              All clear — inbox and confirmations are up to date.
            </Text>
            <Pressable onPress={() => router.push(asHref("/bookings"))}>
              <Text style={[styles.focalLink, { color: accent }]}>Calendar</Text>
            </Pressable>
          </View>
        </ConstellationGlassCard>
      ) : null}

      {schedulePreview.length > 0 && !isLoading ? (
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Later today</Text>
            <Pressable onPress={() => router.push(asHref("/bookings"))}>
              <Text style={[styles.focalLink, { color: accent }]}>Full schedule</Text>
            </Pressable>
          </View>
          {schedulePreview.map((b, i) => (
            <BookingCard
              key={b.id}
              booking={b as Parameters<typeof BookingCard>[0]["booking"]}
              timeZone={businessTz}
              showDate
              index={i}
              onPress={() => router.push(`/booking/${b.id}`)}
            />
          ))}
        </View>
      ) : null}

      {handoffCount > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Inbox signals</Text>
            <Pressable onPress={() => router.push(asHref("/inbox"))}>
              <Text style={[styles.focalLink, { color: accent }]}>Open inbox</Text>
            </Pressable>
          </View>
          {inboxLoading ? (
            <ActivityIndicator color={accent} />
          ) : (
            inboxPeek.map((t, i) => (
              <InboxThreadRow
                key={t.id}
                thread={t}
                index={i}
                accent={accent}
                chrome={chrome}
                formatRelative={(iso) => formatRelativeIso(iso)}
                needsYouHighlight
              />
            ))
          )}
        </View>
      ) : null}

      <Pressable
        onPress={() => {
          haptics.selection();
          setSignalsOpen((o) => !o);
        }}
        style={[styles.signalsToggle, { borderColor: "rgba(217,195,154,0.14)" }]}
      >
        <Text style={[styles.signalsToggleText, { color: colors.mutedForeground }]}>
          {signalsOpen ? "Hide Liv signals" : "Liv signals & quick links"}
        </Text>
        <Feather name={signalsOpen ? "chevron-up" : "chevron-down"} size={16} color={shellAccent} />
      </Pressable>

      {signalsOpen ? (
        <View style={styles.signalsBody}>
          <GlowPressable
            onPress={onNewBooking}
            glowColor={accent}
            haptic="impact"
            style={[styles.newBookingBtn, { backgroundColor: preset.beautyBriefing ? accent : shellAccent }]}
          >
            <Feather name="plus" size={16} color={gatewayTheme.platformInk} />
            <Text style={styles.newBookingText}>New booking</Text>
          </GlowPressable>
          <Pressable onPress={() => router.push(asHref("/more"))} style={styles.moreLink}>
            <Text style={[type.caption, { color: colors.mutedForeground }]}>
              Demo guide, staff, settings — in More
            </Text>
            <Feather name="arrow-right" size={12} color={shellAccent} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 10, paddingBottom: 8 },
  greetRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 4,
  },
  greeting: {
    fontFamily: fonts.serif,
    fontSize: 22,
    lineHeight: 28,
    color: "#f7f5f0",
    letterSpacing: -0.3,
  },
  bizName: {
    fontFamily: fonts.serifMedium,
    fontSize: 26,
    lineHeight: 30,
    color: "#fff",
    letterSpacing: -0.4,
    marginTop: 2,
  },
  dateMono: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: "rgba(247,245,240,0.45)",
    letterSpacing: 0.3,
  },
  briefingTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  briefingEyebrow: {
    flex: 1,
    fontSize: 10,
    fontFamily: fonts.mono,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "rgba(217,195,154,0.8)",
  },
  briefingLine: {
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(247,245,240,0.88)",
    fontFamily: fonts.body,
    marginBottom: 12,
  },
  beautyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(236,72,153,0.12)",
  },
  briefingCtaWrap: { alignSelf: "flex-start", borderRadius: 12, overflow: "hidden" },
  briefingCtaGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  briefingCtaSolid: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
  },
  briefingCtaSolidText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: gatewayTheme.platformInk,
  },
  kpiScroll: { marginHorizontal: -4 },
  kpiRow: { gap: 10, paddingHorizontal: 4, paddingVertical: 2 },
  kpi: {
    minWidth: 96,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  kpiLabel: { fontSize: 10, fontFamily: fonts.mono, letterSpacing: 0.5, textTransform: "uppercase" },
  kpiValue: { fontSize: 22, fontFamily: fonts.serifMedium, lineHeight: 26 },
  kpiSub: { fontSize: 10, fontFamily: fonts.mono },
  focalHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  focalEyebrow: {
    fontSize: 10,
    fontFamily: fonts.mono,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  focalLink: { fontSize: 12, fontFamily: fonts.bodySemi },
  focalActions: { flexDirection: "row", gap: 10, marginTop: 12, alignItems: "center" },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: "flex-start",
  },
  confirmText: { fontFamily: fonts.bodySemi, fontSize: 13, color: gatewayTheme.platformInk },
  reviewBtn: { paddingVertical: 8, paddingHorizontal: 8 },
  reviewText: { fontFamily: fonts.bodySemi, fontSize: 13 },
  nextTime: { fontSize: 20, fontFamily: fonts.serifMedium, marginBottom: 4 },
  nextName: { fontSize: 17, fontFamily: fonts.bodySemi },
  nextSub: { fontSize: 13, marginTop: 2 },
  allClearRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  allClearText: { flex: 1, fontSize: 13, lineHeight: 18 },
  section: { gap: 8, marginTop: 4 },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontFamily: fonts.serifMedium, fontSize: 17 },
  signalsToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 8,
  },
  signalsToggleText: { fontSize: 12, fontFamily: fonts.bodySemi },
  signalsBody: { gap: 10, marginTop: 4 },
  newBookingBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 12,
  },
  newBookingText: { fontFamily: fonts.bodySemi, fontSize: 14, color: gatewayTheme.platformInk },
  moreLink: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4 },
});
