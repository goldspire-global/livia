import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

/** Transparent full-screen slot — root TenantPresentationShell paints atmosphere behind. */
export function OperatorSurfaceShell({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.root, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "transparent" },
});
