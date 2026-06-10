import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import { gatewayTheme } from "@/lib/gateway-theme";

/** W2 G2 nebula shell — parity with `DemoFlowShell` ambient layers. */
export function DemoFlowAmbient() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[gatewayTheme.g2NavyMid, gatewayTheme.g2NavyDeep, "#010204"]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.nebulaGold, { backgroundColor: "rgba(217, 185, 122, 0.08)" }]} />
      <View style={[styles.nebulaCorner, styles.nebulaTopRight]} />
      <View style={[styles.nebulaCorner, styles.nebulaBottomLeft]} />
    </View>
  );
}

const styles = StyleSheet.create({
  nebulaGold: {
    position: "absolute",
    top: "18%",
    left: "10%",
    right: "10%",
    height: 200,
    borderRadius: 999,
  },
  nebulaCorner: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: "rgba(230, 208, 165, 0.06)",
  },
  nebulaTopRight: { top: -20, right: -30 },
  nebulaBottomLeft: { bottom: 80, left: -40 },
});
