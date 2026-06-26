import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { fonts, type } from "@/constants/typography";
import { useColors } from "@/hooks/useColors";
import { getApiBaseUrl } from "@/lib/api-base";
import { GUEST_HUB_COPY, GUEST_HUB_WELCOME_SLIDES } from "@workspace/policy";

export function GuestHubWelcome({
  guestId,
  hubToken,
  welcomeCompleted,
  onCompleted,
}: {
  guestId: string;
  hubToken: string;
  welcomeCompleted?: boolean;
  onCompleted: () => void;
}) {
  const colors = useColors();
  const api = getApiBaseUrl();
  const storageKey = `livia_guest_hub_welcome_${guestId}`;
  const [dismissed, setDismissed] = useState(welcomeCompleted ?? false);
  const [slide, setSlide] = useState(0);
  const [busy, setBusy] = useState(false);

  if (dismissed) return null;

  const current = GUEST_HUB_WELCOME_SLIDES[slide]!;
  const isLast = slide >= GUEST_HUB_WELCOME_SLIDES.length - 1;

  async function finish() {
    setBusy(true);
    try {
      await fetch(`${api}/api/public/guest-hub/preferences`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Guest-Hub-Token": hubToken,
        },
        body: JSON.stringify({ welcomeCompleted: true }),
      });
      await AsyncStorage.setItem(storageKey, "1");
      setDismissed(true);
      onCompleted();
    } finally {
      setBusy(false);
    }
  }

  return (
    <View
      style={[styles.card, { borderColor: colors.primary + "40", backgroundColor: colors.primary + "12" }]}
      testID="guest-hub-welcome"
    >
      <Text style={[type.caption, { color: colors.primary, fontFamily: fonts.bodyMed }]}>
        {GUEST_HUB_COPY.welcomeTitle}
      </Text>
      <Text style={[type.body, { fontFamily: fonts.bodyMed, color: colors.foreground, marginTop: 8 }]}>
        {current.title}
      </Text>
      <Text style={[type.caption, { color: colors.mutedForeground, marginTop: 6, lineHeight: 20 }]}>
        {current.body}
      </Text>
      <View style={styles.dots}>
        {GUEST_HUB_WELCOME_SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === slide ? colors.primary : colors.muted },
            ]}
          />
        ))}
      </View>
      <View style={styles.actions}>
        <Pressable onPress={() => void finish()} disabled={busy}>
          <Text style={[type.caption, { color: colors.mutedForeground }]}>{GUEST_HUB_COPY.welcomeSkip}</Text>
        </Pressable>
        {isLast ? (
          <Pressable
            style={[styles.cta, { backgroundColor: colors.primary }]}
            onPress={() => void finish()}
            disabled={busy}
            testID="guest-hub-welcome-done"
          >
            {busy ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={[type.caption, { color: colors.primaryForeground, fontFamily: fonts.bodyMed }]}>
                {GUEST_HUB_COPY.welcomeDone}
              </Text>
            )}
          </Pressable>
        ) : (
          <Pressable
            style={[styles.cta, { backgroundColor: colors.primary }]}
            onPress={() => setSlide((s) => s + 1)}
          >
            <Text style={[type.caption, { color: colors.primaryForeground, fontFamily: fonts.bodyMed }]}>
              {GUEST_HUB_COPY.welcomeNext}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 16, marginTop: 8 },
  dots: { flexDirection: "row", gap: 6, marginTop: 14, justifyContent: "center" },
  dot: { width: 24, height: 4, borderRadius: 999 },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  cta: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
});
