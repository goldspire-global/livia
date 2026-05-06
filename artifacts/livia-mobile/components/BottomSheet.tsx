import { BlurView } from "expo-blur";
import React, { useEffect } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SPRING_QUICK } from "@/constants/motion";
import { useColors } from "@/hooks/useColors";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Optional fixed height; otherwise sheet sizes to its content with a sane max. */
  height?: number;
  contentStyle?: ViewStyle;
}

const SCREEN_H = Dimensions.get("window").height;
const DEFAULT_MAX = SCREEN_H * 0.78;

/**
 * A spring-snap bottom sheet with a blurred backdrop and rubberband drag-down
 * dismiss. Used for the business switcher (More tab) and quick-action sheets
 * on bookings. Worklet-driven — gestures and the snap animation never touch
 * the JS thread.
 */
export function BottomSheet({
  visible,
  onClose,
  children,
  height,
  contentStyle,
}: BottomSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const sheetH = height ?? DEFAULT_MAX;

  // 0 = fully closed (off-screen), 1 = fully open at rest.
  const progress = useSharedValue(0);
  // Drag offset in pixels (positive = dragged down, with rubberband).
  const drag = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      progress.value = withSpring(1, SPRING_QUICK);
    } else {
      drag.value = 0;
      progress.value = withTiming(0, { duration: 240, easing: Easing.in(Easing.cubic) });
    }
  }, [visible]);

  const close = () => onClose();

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      // Rubberband on negative (upward) drag — strong resistance.
      drag.value = e.translationY > 0 ? e.translationY : e.translationY * 0.25;
    })
    .onEnd((e) => {
      if (e.translationY > 100 || e.velocityY > 700) {
        progress.value = withTiming(0, { duration: 220, easing: Easing.in(Easing.cubic) });
        runOnJS(close)();
      } else {
        drag.value = withSpring(0, SPRING_QUICK);
      }
    });

  const sheetStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [sheetH + 100, 0]) + drag.value;
    return { transform: [{ translateY }] };
  });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={StyleSheet.absoluteFill}>
        <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
          {Platform.OS === "ios" ? (
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "#00000099" }]} />
          )}
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <View style={styles.host} pointerEvents="box-none">
          <GestureDetector gesture={pan}>
            <Animated.View
              style={[
                styles.sheet,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  paddingBottom: insets.bottom + 12,
                  maxHeight: sheetH,
                },
                sheetStyle,
                contentStyle,
              ]}
            >
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
              {children}
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
});
