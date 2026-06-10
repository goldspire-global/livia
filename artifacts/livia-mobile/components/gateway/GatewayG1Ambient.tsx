import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import { gatewayTheme } from "@/lib/gateway-theme";

/** W2 G1 aurora stack — parity with `gateway-g1-aurora` + horizon + vignette. */
export function GatewayG1Ambient() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={["#0c1a22", "#061018", gatewayTheme.g1Background, "#010204"]}
        locations={[0, 0.28, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.auroraTeal, { backgroundColor: "rgba(20, 184, 166, 0.22)" }]} />
      <View style={[styles.auroraCyan, { backgroundColor: "rgba(6, 182, 212, 0.14)" }]} />
      <View style={[styles.auroraViolet, { backgroundColor: "rgba(139, 92, 246, 0.12)" }]} />
      <LinearGradient
        colors={["transparent", "rgba(1,4,8,0.92)"]}
        locations={[0.48, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.55)", "transparent", "rgba(0,0,0,0.4)"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  auroraTeal: {
    position: "absolute",
    top: -80,
    left: -40,
    right: -40,
    height: 320,
    borderRadius: 999,
    transform: [{ scaleX: 1.2 }],
  },
  auroraCyan: {
    position: "absolute",
    top: 40,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 999,
  },
  auroraViolet: {
    position: "absolute",
    top: 60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 999,
  },
});
