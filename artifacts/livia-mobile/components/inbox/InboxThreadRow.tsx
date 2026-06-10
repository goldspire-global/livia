import { Feather } from "@expo/vector-icons";
import type { ConversationListItem } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { GlowPressable } from "@/components/ui/GlowPressable";
import { aurora } from "@/constants/colors";
import { elevation } from "@/constants/elevation";
import { fonts, type } from "@/constants/typography";
import { useColors } from "@/hooks/useColors";
import type { OperationalChrome } from "@/lib/operational-chrome";

type Props = {
  thread: ConversationListItem;
  index: number;
  accent: string;
  chrome: OperationalChrome;
  formatRelative: (iso: string) => string;
  needsYouHighlight?: boolean;
  beautyAccent?: boolean;
};

export function InboxThreadRow({
  thread: t,
  index,
  accent,
  chrome,
  formatRelative,
  needsYouHighlight,
  beautyAccent,
}: Props) {
  const colors = useColors();
  const router = useRouter();
  const needsYou = t.status === "OPEN" && !t.aiHandled;
  const attention = needsYouHighlight && needsYou;

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index * 45, 320)).duration(340).springify()}>
      <GlowPressable
        onPress={() => router.push(`/conversation/${t.id}` as never)}
        glowColor={attention ? accent : colors.primary}
        haptic="tap"
        style={[
          styles.row,
          chrome.native
            ? chrome.row(attention)
            : {
                backgroundColor: colors.card,
                borderColor: beautyAccent
                  ? colors.primary + "55"
                  : attention
                    ? aurora.violet + "66"
                    : colors.border,
                borderLeftWidth: beautyAccent ? 3 : 1,
                borderLeftColor: beautyAccent ? colors.primary : undefined,
              },
          elevation.resting,
        ]}
      >
        <View
          style={[
            styles.avatar,
            chrome.native ? chrome.avatarRing() : { backgroundColor: accent + "22" },
          ]}
        >
          <Feather name="message-circle" size={18} color={accent} />
        </View>
        <View style={styles.rowBody}>
          <View style={styles.rowTop}>
            <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
              {t.customerName ?? "Unknown"}
            </Text>
            <Text style={[styles.when, { color: colors.mutedForeground }]}>
              {formatRelative(t.lastMessageAt)}
            </Text>
          </View>
          <Text style={[styles.preview, { color: colors.mutedForeground }]} numberOfLines={2}>
            {t.lastMessage ?? "—"}
          </Text>
          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>{t.channel}</Text>
            {needsYou ? (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: (beautyAccent ? colors.primary : aurora.violet) + "22",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: beautyAccent ? colors.primary : aurora.violet },
                  ]}
                >
                  Needs you
                </Text>
              </View>
            ) : t.aiHandled && t.status === "OPEN" ? (
              <View style={[styles.badge, { backgroundColor: aurora.cyan + "22" }]}>
                <Text style={[styles.badgeText, { color: aurora.cyan }]}>Liv on</Text>
              </View>
            ) : t.status === "HANDED_OFF" ? (
              <View style={[styles.badge, { backgroundColor: colors.muted + "33" }]}>
                <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
                  Taken over
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      </GlowPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  rowBody: { flex: 1, gap: 4 },
  rowTop: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  name: { fontFamily: fonts.bodyMed, fontSize: 16, flex: 1 },
  when: { ...type.caption },
  preview: { ...type.body, fontSize: 14, lineHeight: 20 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  meta: { ...type.caption, fontSize: 11 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontFamily: fonts.bodyMed, fontSize: 10 },
});
