import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { aurora } from "@/constants/colors";
import { SPRING_QUICK } from "@/constants/motion";
import { fonts } from "@/constants/typography";

const ACTION_THRESHOLD = 80;
const RUBBERBAND_LIMIT = 140;

interface SwipeableRowProps {
  children: React.ReactNode;
  /** Fired when the user swipes RIGHT past the threshold (mark arrived). */
  onSwipeRight?: () => void;
  /** Fired when the user swipes LEFT past the threshold (reschedule). */
  onSwipeLeft?: () => void;
  /** Optional labels shown beneath the row while swiping. */
  rightLabel?: string;
  leftLabel?: string;
  /** Disable to use only as a passthrough (no gesture). */
  disabled?: boolean;
}

/**
 * Wraps a row with horizontal swipe gestures driven on the UI thread:
 * right-swipe → onSwipeRight (mint flash), left-swipe → onSwipeLeft (cyan
 * flash). The gesture rubberbands past the threshold so the swipe always
 * feels responsive.
 *
 * Per ADR 0008 / task 47: swipe-right = mark arrived/confirm,
 * swipe-left = reschedule. All animation runs in worklets.
 */
export function SwipeableRow({
  children,
  onSwipeRight,
  onSwipeLeft,
  rightLabel = "Confirm",
  leftLabel = "Reschedule",
  disabled,
}: SwipeableRowProps) {
  const tx = useSharedValue(0);

  const fire = (dir: "right" | "left") => {
    if (dir === "right") onSwipeRight?.();
    else onSwipeLeft?.();
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-10, 10])
    .enabled(!disabled)
    .onUpdate((e) => {
      const raw = e.translationX;
      // Rubberband past the limit so the swipe never feels infinite.
      const sign = Math.sign(raw);
      const abs = Math.min(Math.abs(raw), RUBBERBAND_LIMIT + 60);
      tx.value =
        abs <= RUBBERBAND_LIMIT
          ? raw
          : sign * (RUBBERBAND_LIMIT + (abs - RUBBERBAND_LIMIT) * 0.3);
    })
    .onEnd((e) => {
      const past = Math.abs(e.translationX) > ACTION_THRESHOLD;
      if (past && e.translationX > 0 && onSwipeRight) {
        runOnJS(fire)("right");
      } else if (past && e.translationX < 0 && onSwipeLeft) {
        runOnJS(fire)("left");
      }
      tx.value = withSpring(0, SPRING_QUICK);
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
  }));

  const rightBgStyle = useAnimatedStyle(() => {
    const op = interpolate(tx.value, [0, ACTION_THRESHOLD], [0, 1], "clamp");
    return { opacity: op };
  });
  const leftBgStyle = useAnimatedStyle(() => {
    const op = interpolate(tx.value, [-ACTION_THRESHOLD, 0], [1, 0], "clamp");
    return { opacity: op };
  });

  return (
    <View style={styles.root}>
      {/* Background reveals (mint right / cyan left) — sit beneath the row */}
      {onSwipeRight ? (
        <Animated.View
          style={[styles.bg, styles.bgLeft, { backgroundColor: aurora.mint + "26" }, rightBgStyle]}
        >
          <Text style={[styles.bgLabel, { color: aurora.mint }]}>{rightLabel}</Text>
        </Animated.View>
      ) : null}
      {onSwipeLeft ? (
        <Animated.View
          style={[styles.bg, styles.bgRight, { backgroundColor: aurora.cyan + "26" }, leftBgStyle]}
        >
          <Text style={[styles.bgLabel, { color: aurora.cyan }]}>{leftLabel}</Text>
        </Animated.View>
      ) : null}

      <GestureDetector gesture={pan}>
        <Animated.View style={rowStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { position: "relative" },
  bg: {
    position: "absolute",
    top: 0,
    bottom: 10,
    width: "60%",
    borderRadius: 16,
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  bgLeft: { left: 0, alignItems: "flex-start" },
  bgRight: { right: 0, alignItems: "flex-end" },
  bgLabel: { fontFamily: fonts.bodySemi, fontSize: 13, letterSpacing: 0.5, textTransform: "uppercase" },
});
