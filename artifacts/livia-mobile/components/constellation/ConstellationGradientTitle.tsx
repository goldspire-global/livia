import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, type TextStyle } from "react-native";
import { fonts } from "@/constants/typography";

/** Web `.constellation-today [data-testid="owner-dashboard-greeting"]` gradient clip. */
export function ConstellationGradientTitle({
  children,
  style,
}: {
  children: string;
  style?: TextStyle;
}) {
  return (
    <MaskedView
      maskElement={
        <Text style={[styles.text, style]} numberOfLines={2}>
          {children}
        </Text>
      }
    >
      <LinearGradient
        colors={["#f7f5f0", "#d9c39a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[styles.text, style, styles.invisible]} numberOfLines={2}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.serif,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  invisible: { opacity: 0 },
});
