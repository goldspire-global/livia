import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleSheet, View, type ViewStyle } from "react-native";
import { gatewayTheme } from "@/lib/gateway-theme";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  accentBar?: boolean;
  accentColor?: string;
  variant?: "default" | "beauty" | "wellness";
  testID?: string;
};

/** Frosted Liv surface — web `platform-default-liv-glass` / `beauty-briefing-banner`. */
export function ConstellationGlassCard({
  children,
  style,
  accentBar,
  accentColor,
  variant = "default",
  testID,
}: Props) {
  const accent = accentColor ?? gatewayTheme.aurumChampagne;
  const beauty = variant === "beauty";
  const wellness = variant === "wellness";

  const shell = (
    <View
      testID={testID}
      style={[
        styles.shell,
        beauty && {
          borderColor: accent + "38",
          backgroundColor: accent + "12",
        },
        wellness && {
          borderColor: "rgba(20,184,166,0.28)",
          backgroundColor: "rgba(6,78,59,0.14)",
        },
        accentBar && { borderLeftWidth: 3, borderLeftColor: accent, paddingLeft: 16 },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (Platform.OS === "web") return shell;

  return (
    <View style={[styles.wrap, style]}>
      <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
      {shell}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(217, 195, 154, 0.16)",
  },
  shell: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(217, 195, 154, 0.16)",
    backgroundColor: "rgba(42, 45, 58, 0.55)",
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 4,
  },
});
