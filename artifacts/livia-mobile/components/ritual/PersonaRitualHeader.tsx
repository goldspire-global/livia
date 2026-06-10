import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LivPulse } from "@/components/brand/LivPulse";
import { fonts, type } from "@/constants/typography";
import { useColors } from "@/hooks/useColors";
import { useHaptics } from "@/hooks/useHaptics";
import { PERSONA_ACCENT, PERSONA_LABEL } from "@/hooks/usePersona";
import { usePersonaBriefing } from "@/hooks/usePersonaBriefing";
import { ritualHrefToMobile } from "@/lib/persona-rituals";

type Props = {
  title?: string;
  subtitle?: string;
  variant?: "home" | "page";
  showActions?: boolean;
  showAlert?: boolean;
};

export function PersonaRitualHeader({
  title,
  subtitle,
  variant = "home",
  showActions = true,
  showAlert = true,
}: Props) {
  const colors = useColors();
  const router = useRouter();
  const haptics = useHaptics();
  const {
    persona,
    ritual,
    greeting,
    livLine,
    livPulse,
    homeSubtitle,
    businessName,
    isLoading,
  } = usePersonaBriefing();

  const accent = PERSONA_ACCENT[persona];
  const isPage = variant === "page";
  const resolvedSubtitle = subtitle ?? homeSubtitle ?? ritual.homeSubtitle;
  const pulseState: "idle" | "active" =
    livPulse === "act" || livPulse === "watch" ? "active" : "idle";

  if (isPage) {
    return (
      <Animated.View entering={FadeInDown.duration(360).springify()} style={styles.pageWrap}>
        <Text style={[styles.pageEyebrow, { color: colors.mutedForeground }]}>{PERSONA_LABEL[persona]}</Text>
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>{title ?? ritual.homeTitle}</Text>
        {resolvedSubtitle ? (
          <Text style={[styles.pageSub, { color: colors.mutedForeground }]}>{resolvedSubtitle}</Text>
        ) : null}
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(420).springify().damping(16)}
      style={[styles.homeWrap, { borderColor: accent + "33" }]}
      testID={`ritual-header-${persona}`}
    >
      <LinearGradient
        colors={[accent + "14", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.accentBar, { backgroundColor: accent }]} />

      <View style={styles.homeInner}>
        <View style={styles.topRow}>
          {showAlert && ritual.alertLabel ? (
            <View style={[styles.alertChip, { borderColor: accent + "55" }]}>
              <Text style={[styles.alertText, { color: accent }]}>{ritual.alertLabel}</Text>
            </View>
          ) : null}
          <Text style={styles.personaEyebrow}>{PERSONA_LABEL[persona]}</Text>
        </View>

        <Text style={styles.greeting}>{greeting}</Text>
        {businessName ? (
          <Text style={styles.bizName} numberOfLines={1}>
            {businessName}
          </Text>
        ) : null}

        <View style={styles.livRow}>
          <LivPulse size={9} state={pulseState} />
          {isLoading ? (
            <ActivityIndicator size="small" color={accent} style={{ marginLeft: 8 }} />
          ) : (
            <Text style={styles.livLine}>{livLine}</Text>
          )}
        </View>

        {resolvedSubtitle && resolvedSubtitle !== livLine ? (
          <Text style={styles.subLine}>{resolvedSubtitle}</Text>
        ) : null}

        {showActions && (ritual.primaryAction || ritual.secondaryAction) ? (
          <View style={styles.actions}>
            {ritual.primaryAction ? (
              <Pressable
                onPress={() => {
                  haptics.tap();
                  router.push(ritualHrefToMobile(ritual.primaryAction!.href) as never);
                }}
                style={[styles.primaryBtn, { backgroundColor: accent + "22", borderColor: accent + "66" }]}
              >
                <Text style={[styles.primaryBtnText, { color: accent }]}>
                  {ritual.primaryAction.label}
                </Text>
                <Feather name="arrow-right" size={14} color={accent} />
              </Pressable>
            ) : null}
            {ritual.secondaryAction ? (
              <Pressable
                onPress={() => {
                  haptics.tap();
                  router.push(ritualHrefToMobile(ritual.secondaryAction!.href) as never);
                }}
                style={styles.secondaryBtn}
              >
                <Text style={styles.secondaryBtnText}>{ritual.secondaryAction.label}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  homeWrap: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  homeInner: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingLeft: 18,
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  alertChip: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  alertText: {
    fontSize: 9,
    fontFamily: fonts.mono,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  personaEyebrow: {
    ...type.eyebrow,
    fontSize: 10,
    color: "rgba(255,255,255,0.45)",
  },
  greeting: {
    fontFamily: fonts.serif,
    fontSize: 22,
    lineHeight: 28,
    color: "#fff",
    letterSpacing: -0.3,
  },
  bizName: {
    fontFamily: fonts.serifMedium,
    fontSize: 28,
    lineHeight: 32,
    color: "#fff",
    letterSpacing: -0.4,
  },
  livRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 4,
  },
  livLine: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.78)",
    fontFamily: fonts.body,
  },
  subLine: {
    fontSize: 12,
    lineHeight: 17,
    color: "rgba(255,255,255,0.5)",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  primaryBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
  },
  secondaryBtn: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  secondaryBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
  },
  pageWrap: { marginBottom: 12, gap: 4 },
  pageEyebrow: {
    fontSize: 10,
    fontFamily: fonts.mono,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  pageTitle: {
    fontFamily: fonts.serifMedium,
    fontSize: 28,
    lineHeight: 32,
  },
  pageSub: {
    fontSize: 13,
    lineHeight: 18,
  },
});
