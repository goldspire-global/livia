import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { GlowPressable } from "@/components/ui/GlowPressable";
import { fonts, type } from "@/constants/typography";
import { useColors } from "@/hooks/useColors";
import { useHaptics } from "@/hooks/useHaptics";
import { asHref } from "@/lib/navigation";

export function BeautyTodayHandoffStrip({
  handoffCount,
  pendingCount,
}: {
  handoffCount: number;
  pendingCount: number;
}) {
  const colors = useColors();
  const router = useRouter();
  const haptics = useHaptics();

  const line =
    handoffCount > 0
      ? `${handoffCount} thread${handoffCount === 1 ? "" : "s"} need you`
      : pendingCount > 0
        ? `${pendingCount} booking${pendingCount === 1 ? "" : "s"} need confirm`
        : null;

  if (!line) return null;

  return (
    <Animated.View entering={FadeInDown.duration(360).springify()}>
      <GlowPressable
        onPress={() => {
          haptics.tap();
          router.push(asHref(handoffCount > 0 ? "/inbox" : "/bookings"));
        }}
        glowColor={colors.primary}
        haptic="tap"
        style={[
          styles.strip,
          {
            backgroundColor: colors.primary + "18",
            borderColor: colors.primary + "55",
          },
        ]}
        accessibilityRole="button"
      >
        <Text style={[styles.text, { color: colors.primary }]}>{line}</Text>
        <Feather name="arrow-right" size={16} color={colors.primary} />
      </GlowPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  text: {
    fontFamily: fonts.bodyMed,
    fontSize: 14,
    letterSpacing: 0.2,
  },
});
