import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { fonts } from "@/constants/typography";
import { useHaptics } from "@/hooks/useHaptics";
import { DEMO_GUEST_CLIENT_COPY, GUEST_HUB_COPY } from "@workspace/policy";

type Props = {
  embedded?: boolean;
};

/** Rose guest path — parity with `demo-guest-client-shortcut.tsx`. */
export function MobileDemoGuestShortcut({ embedded }: Props) {
  const router = useRouter();
  const haptics = useHaptics();

  return (
    <LinearGradient
      colors={["rgba(251,113,133,0.22)", "rgba(76,5,25,0.35)", "transparent"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.wrap,
        embedded ? styles.embedded : styles.standalone,
        { borderColor: "rgba(251,113,133,0.4)" },
      ]}
      testID="demo-guest-client-shortcut"
    >
      <View style={{ flex: 1, gap: 6 }}>
        <View style={styles.eyebrowRow}>
          <Feather name="heart" size={12} color="#fecdd3" />
          <Text style={styles.eyebrow}>
            {GUEST_HUB_COPY.productName} · end client
          </Text>
        </View>
        <Text style={[styles.title, embedded && styles.titleEmbedded]}>
          {DEMO_GUEST_CLIENT_COPY.title}
        </Text>
        <Text style={[styles.body, embedded && styles.bodyEmbedded]}>
          {DEMO_GUEST_CLIENT_COPY.body}
        </Text>
        <Text style={styles.hint}>{DEMO_GUEST_CLIENT_COPY.phoneHint}</Text>
        {!embedded ? (
          <Text style={styles.hint}>{DEMO_GUEST_CLIENT_COPY.nameHint}</Text>
        ) : null}
      </View>
      <Pressable
        onPress={() => {
          haptics.tap();
          router.push("/my-livia" as never);
        }}
        testID="demo-guest-client-open"
        style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.9 : 1 }]}
      >
        <Text style={styles.ctaText}>{DEMO_GUEST_CLIENT_COPY.cta}</Text>
        <Feather name="arrow-right" size={14} color="#4c0519" />
      </Pressable>
      <Text style={styles.footerHint}>
        Opens My Livia in-app — return here to try staff roles too
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  standalone: { marginTop: 24 },
  embedded: { borderRadius: 12, padding: 14 },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  eyebrow: {
    fontSize: 10,
    fontFamily: fonts.mono,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "rgba(254,205,211,0.85)",
  },
  title: {
    fontFamily: fonts.bodySemi,
    fontSize: 18,
    color: "#fff",
  },
  titleEmbedded: { fontSize: 15 },
  body: {
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255,255,255,0.65)",
  },
  bodyEmbedded: { fontSize: 12 },
  hint: {
    fontSize: 11,
    fontFamily: fonts.mono,
    color: "rgba(255,255,255,0.45)",
    lineHeight: 15,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(251,113,133,0.9)",
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
    minHeight: 44,
  },
  ctaText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: "#4c0519",
  },
  footerHint: {
    fontSize: 10,
    fontFamily: fonts.mono,
    color: "rgba(255,255,255,0.35)",
    textAlign: "center",
  },
});
