import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GatewayG1Ambient } from "@/components/gateway/GatewayG1Ambient";
import { LiviaWordmark } from "@/components/brand/LiviaWordmark";
import { GlowPressable } from "@/components/ui/GlowPressable";
import { aurora } from "@/constants/colors";
import { elevation } from "@/constants/elevation";
import { fonts, type } from "@/constants/typography";
import { useColors } from "@/hooks/useColors";
import { isDemoLoginEnabled } from "@/hooks/usePersona";
import { gatewayTheme } from "@/lib/gateway-theme";
import { LIVIA_MOBILE_ENTRY_COPY } from "@workspace/policy";

export function AppEntryGateway() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const copy = LIVIA_MOBILE_ENTRY_COPY;
  const gold = gatewayTheme.primaryChampagne;

  function goOperator() {
    router.push("/sign-in" as never);
  }

  function goGuest() {
    router.push("/my-livia" as never);
  }

  function goDemo() {
    router.push("/demo" as never);
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]} testID="app-entry-gateway">
      <GatewayG1Ambient />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(420).springify().damping(18)} style={styles.brand}>
          <LiviaWordmark size="lg" color={colors.foreground} />
          <Text style={[styles.kicker, { color: gold }]}>{copy.kicker}</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>{copy.title}</Text>
        </Animated.View>

        <View style={styles.cards}>
          <Animated.View entering={FadeInDown.delay(80).duration(400).springify()}>
            <GlowPressable
              onPress={goGuest}
              testID="entry-gateway-guest"
              glowColor={gold}
              haptic="impact"
              style={[
                styles.card,
                elevation.floating,
                {
                  backgroundColor: colors.card + "f2",
                  borderColor: gold + "55",
                },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: gold + "22" }]}>
                <Feather name="calendar" size={22} color={gold} />
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>{copy.guestTitle}</Text>
                <Text style={[styles.cardBody, { color: colors.mutedForeground }]}>{copy.guestBody}</Text>
                <Text style={[styles.cardCta, { color: gold }]}>{copy.guestCta} →</Text>
                <Text style={[styles.cardHint, { color: colors.mutedForeground }]}>{copy.guestPhoneHint}</Text>
              </View>
            </GlowPressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(140).duration(400).springify()}>
            <GlowPressable
              onPress={goOperator}
              testID="entry-gateway-operator"
              glowColor={aurora.violet}
              haptic="impact"
              style={[
                styles.card,
                elevation.floating,
                {
                  backgroundColor: colors.card + "f2",
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: aurora.violet + "22" }]}>
                <Feather name="briefcase" size={22} color={aurora.violet} />
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>{copy.operatorTitle}</Text>
                <Text style={[styles.cardBody, { color: colors.mutedForeground }]}>{copy.operatorBody}</Text>
                <Text style={[styles.cardCta, { color: aurora.violet }]}>{copy.operatorCta} →</Text>
              </View>
            </GlowPressable>
          </Animated.View>

          {isDemoLoginEnabled ? (
            <Animated.View entering={FadeInDown.delay(200).duration(400).springify()}>
              <GlowPressable
                onPress={goDemo}
                testID="entry-gateway-demo"
                glowColor={gold}
                haptic="tap"
                style={styles.demoLink}
              >
                <Text style={[styles.demoLinkTitle, { color: colors.foreground }]}>
                  {copy.demoTitle}
                </Text>
                <Text style={[styles.demoLinkBody, { color: colors.mutedForeground }]}>
                  {copy.demoBody}
                </Text>
                <Text style={[styles.cardCta, { color: gold }]}>{copy.demoCta} →</Text>
              </GlowPressable>
            </Animated.View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: 22,
    flexGrow: 1,
    justifyContent: "center",
    gap: 28,
  },
  brand: {
    alignItems: "center",
    gap: 10,
  },
  kicker: {
    ...type.caption,
    fontFamily: fonts.bodyMed,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 16,
  },
  title: {
    fontFamily: fonts.serifMedium,
    fontSize: 26,
    lineHeight: 32,
    textAlign: "center",
    maxWidth: 300,
  },
  cards: {
    gap: 14,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 17,
  },
  cardBody: {
    ...type.caption,
    lineHeight: 18,
  },
  cardCta: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    marginTop: 4,
  },
  cardHint: {
    fontSize: 11,
    fontFamily: fonts.body,
  },
  demoLink: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 4,
    alignItems: "center",
  },
  demoLinkTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
  },
  demoLinkBody: {
    ...type.caption,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 300,
  },
});
