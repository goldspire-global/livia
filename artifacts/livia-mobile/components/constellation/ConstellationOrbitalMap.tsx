import React, { useEffect } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  RadialGradient,
  Stop,
} from "react-native-svg";
import { ORBIT_SPIN_MS } from "@/constants/motion";
import { CONSTELLATION_MAP_OPACITY, CONSTELLATION_STROKE } from "@/lib/constellation-preset";

const MAP_STARS = [
  [118, 92, 1.2],
  [168, 140, 0.9],
  [210, 88, 1],
  [278, 118, 1.1],
  [320, 168, 0.85],
  [362, 228, 1],
  [388, 290, 0.95],
  [340, 348, 1.15],
  [268, 372, 0.9],
  [198, 352, 1],
  [142, 302, 0.85],
  [98, 228, 1],
  [248, 248, 1.4],
  [292, 198, 0.75],
  [188, 198, 0.8],
] as const;

const ORBIT_LINES = [
  [118, 92, 168, 140],
  [168, 140, 210, 88],
  [210, 88, 278, 118],
  [278, 118, 320, 168],
  [320, 168, 362, 228],
  [142, 302, 198, 352],
  [198, 352, 268, 372],
] as const;

const TWINKLE_INDICES = new Set([0, 5, 12]);

function TwinkleStar({
  cx,
  cy,
  r,
  delayMs,
  size: mapSize,
}: {
  cx: number;
  cy: number;
  r: number;
  delayMs: number;
  size: number;
}) {
  const twinkle = useSharedValue(0.55);

  useEffect(() => {
    twinkle.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2250, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.55, { duration: 2250, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );
  }, [twinkle, delayMs]);

  const style = useAnimatedStyle(() => ({
    opacity: twinkle.value,
  }));

  const dot = r * 6 * (mapSize / 500);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.twinkle,
        style,
        {
          width: dot,
          height: dot,
          left: (cx / 500) * mapSize - dot / 2,
          top: (cy / 500) * mapSize - dot / 2,
          borderRadius: dot / 2,
          backgroundColor: "rgba(217,195,154,0.9)",
        },
      ]}
    />
  );
}

export function ConstellationOrbitalMap() {
  const { width, height } = useWindowDimensions();
  const size = Math.min(width * 0.96, height * 0.72, 780);
  const orbitSpin = useSharedValue(0);
  const counterSpin = useSharedValue(0);
  const breathe = useSharedValue(1);

  useEffect(() => {
    orbitSpin.value = withRepeat(
      withTiming(360, { duration: ORBIT_SPIN_MS, easing: Easing.linear }),
      -1,
      false,
    );
    counterSpin.value = withRepeat(
      withTiming(-360, { duration: ORBIT_SPIN_MS * 1.4, easing: Easing.linear }),
      -1,
      false,
    );
    breathe.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 5200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.92, { duration: 5200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [orbitSpin, counterSpin, breathe]);

  const orbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orbitSpin.value}deg` }, { scale: breathe.value }],
  }));

  const counterStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${counterSpin.value}deg` }],
  }));

  const lineOpacity = (i: number) => (i < 2 ? 0.144 : 0.096);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        { width: size, height: size, marginTop: -size * 0.12, marginLeft: -size * 0.08 },
        orbitStyle,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 500 500">
        <Defs>
          <LinearGradient id="pd-orbit-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#d9c39a" stopOpacity={1} />
            <Stop offset="100%" stopColor="#8a7549" stopOpacity={0.42} />
          </LinearGradient>
          <RadialGradient id="pd-star-glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#d9c39a" stopOpacity={1} />
            <Stop offset="100%" stopColor="#d9c39a" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle
          cx={250}
          cy={250}
          r={175}
          fill="none"
          stroke="url(#pd-orbit-gold)"
          strokeWidth={CONSTELLATION_STROKE.outer}
        />
        <Circle
          cx={250}
          cy={250}
          r={108}
          fill="none"
          stroke="rgba(217,195,154,0.42)"
          strokeWidth={CONSTELLATION_STROKE.inner}
        />
        {ORBIT_LINES.map(([x1, y1, x2, y2], i) => (
          <Line
            key={`line-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={`rgba(217,195,154,${lineOpacity(i)})`}
            strokeWidth={CONSTELLATION_STROKE.line}
          />
        ))}
        {MAP_STARS.map(([cx, cy, r], i) =>
          TWINKLE_INDICES.has(i) ? null : (
            <G key={`star-${i}`}>
              <Circle cx={cx} cy={cy} r={r * 3} fill="url(#pd-star-glow)" opacity={0.42} />
              <Circle cx={cx} cy={cy} r={r} fill="#d9c39a" opacity={0.9} />
            </G>
          ),
        )}
      </Svg>

      <Animated.View style={[StyleSheet.absoluteFill, counterStyle]} pointerEvents="none">
        <Svg width={size} height={size} viewBox="0 0 500 500">
          <Ellipse
            cx={250}
            cy={250}
            rx={175}
            ry={72}
            fill="none"
            stroke="rgba(217,195,154,0.26)"
            strokeWidth={CONSTELLATION_STROKE.inner}
          />
          <Ellipse
            cx={250}
            cy={250}
            rx={72}
            ry={175}
            fill="none"
            stroke="rgba(217,195,154,0.26)"
            strokeWidth={CONSTELLATION_STROKE.inner}
          />
        </Svg>
      </Animated.View>

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {Array.from(TWINKLE_INDICES).map((i, idx) => {
          const [cx, cy, r] = MAP_STARS[i]!;
          return (
            <TwinkleStar key={`tw-${i}`} cx={cx} cy={cy} r={r} delayMs={idx * 1600} size={size} />
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: "34%",
    left: "54%",
    opacity: CONSTELLATION_MAP_OPACITY,
  },
  twinkle: {
    position: "absolute",
  },
});
