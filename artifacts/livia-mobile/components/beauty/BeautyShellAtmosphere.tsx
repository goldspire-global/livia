import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useMobileSkin } from "@/contexts/PresentationThemeContext";

/** Native beauty preset shell — soft glow, not a web CSS port. */
export function BeautyShellAtmosphere() {
  const skin = useMobileSkin();
  const isLight = skin.colorMode === "light";
  const accent = skin.colorOverrides.primary ?? "#e879a9";

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={
          isLight
            ? ["rgba(255,250,248,0.95)", "rgba(253,242,248,0.6)", "rgba(255,255,255,0)"]
            : ["rgba(20,18,24,0.98)", "rgba(30,20,32,0.55)", "rgba(20,18,24,0)"]
        }
        style={styles.base}
      />
      <View
        style={[
          styles.glow,
          {
            backgroundColor: accent,
            opacity: isLight ? 0.12 : 0.18,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: { ...StyleSheet.absoluteFillObject },
  glow: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    top: -120,
    right: -80,
  },
});
