import { resolveWellnessExperience, type WellnessCssPreset } from "@workspace/policy";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

/** Policy-driven ambient halo for wellness My Day / session rail */
export function WellnessBreathField({
  cssPreset = "harbour-light",
  style,
}: {
  cssPreset?: WellnessCssPreset | string;
  style?: ViewStyle;
}) {
  const profile = resolveWellnessExperience(cssPreset);
  const breath = useSharedValue(0.85);
  const period = profile?.ambience.breathPeriodMs ?? 4200;

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, {
        duration: period / 2,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, [period, breath]);

  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: breath.value }],
    opacity: breath.value * 0.9,
  }));

  if (!profile) return null;

  const primary =
    profile.preset === "evening-ledger"
      ? ["#c9a22755", "#1a1f2e22", "transparent"]
      : profile.preset === "session-rail"
        ? ["#1e293b18", "#e2e8f014", "transparent"]
        : ["#0d948855", "#a7f3d018", "transparent"];

  return (
    <View pointerEvents="none" style={[styles.wrap, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, animated]}>
        <LinearGradient
          colors={primary as [string, string, string]}
          locations={[0, 0.55, 1]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
});
