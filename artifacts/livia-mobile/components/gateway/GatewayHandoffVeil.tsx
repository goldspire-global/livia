import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { gatewayTheme } from "@/lib/gateway-theme";
import { consumeGatewaySkinHandoff } from "@/lib/gateway-handoff";

/** Brief gold dissolve after demo gateway → signed-in app (web skin handoff parity). */
export function GatewayHandoffVeil() {
  const [visible, setVisible] = useState(false);
  const opacity = useSharedValue(0);

  useEffect(() => {
    void consumeGatewaySkinHandoff().then((handoff) => {
      if (!handoff) return;
      setVisible(true);
      opacity.value = 1;
      opacity.value = withTiming(
        0,
        { duration: 900, easing: Easing.out(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(setVisible)(false);
        },
      );
    });
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!visible) return null;

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style, { zIndex: 9999 }]}>
      <LinearGradient
        colors={[`${gatewayTheme.goldMid}88`, `${gatewayTheme.g2NavyDeep}ee`, "transparent"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glow} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: `${gatewayTheme.primaryChampagne}18`,
  },
});
