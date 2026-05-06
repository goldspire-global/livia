import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, G } from "react-native-svg";
import { aurora } from "@/constants/colors";
import { BREATH_PERIOD_MS } from "@/constants/motion";

const AnimatedG = Animated.createAnimatedComponent(G);

export function EmptyVignette({ size = 160 }: { size?: number }) {
  const breath = useSharedValue(1);
  const d1 = useSharedValue(0);
  const d2 = useSharedValue(0);
  const d3 = useSharedValue(0);

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1.06, { duration: BREATH_PERIOD_MS / 2, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    const drift = (sv: typeof d1, range: number, dur: number) =>
      withRepeat(
        withSequence(
          withTiming(range, { duration: dur, easing: Easing.inOut(Easing.sin) }),
          withTiming(-range, { duration: dur, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      );
    d1.value = withDelay(0, drift(d1, 6, 2400));
    d2.value = withDelay(400, drift(d2, 4, 2800));
    d3.value = withDelay(800, drift(d3, 5, 2600));
  }, []);

  const breathStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breath.value }],
  }));

  const dot1 = useAnimatedStyle(() => ({ transform: [{ translateY: d1.value }] }));
  const dot2 = useAnimatedStyle(() => ({ transform: [{ translateY: d2.value }] }));
  const dot3 = useAnimatedStyle(() => ({ transform: [{ translateY: d3.value }] }));

  const c = size / 2;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View style={[StyleSheet.absoluteFill, breathStyle]}>
        <Svg width={size} height={size}>
          <AnimatedG>
            <Circle cx={c} cy={c} r={c * 0.85} stroke={aurora.cyan + "55"} strokeWidth={1} fill="none" />
            <Circle cx={c} cy={c} r={c * 0.6} stroke={aurora.cyan + "33"} strokeWidth={1} fill="none" />
            <Circle cx={c} cy={c} r={c * 0.35} stroke={aurora.cyan + "22"} strokeWidth={1} fill="none" />
            <Circle cx={c} cy={c} r={4} fill={aurora.cyan} opacity={0.85} />
          </AnimatedG>
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.satellite, { left: c - 50, top: c - 56 }, dot1]}>
        <View style={[styles.dot, { backgroundColor: aurora.cyan }]} />
      </Animated.View>
      <Animated.View style={[styles.satellite, { left: c + 38, top: c - 18 }, dot2]}>
        <View style={[styles.dot, { backgroundColor: aurora.violet, opacity: 0.55 }]} />
      </Animated.View>
      <Animated.View style={[styles.satellite, { left: c - 24, top: c + 38 }, dot3]}>
        <View style={[styles.dot, { backgroundColor: aurora.mint, opacity: 0.7 }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  satellite: { position: "absolute" },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
