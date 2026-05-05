import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColorScheme } from "react-native";

const LIGHT: Record<string, { bg: string; color: string; label: string }> = {
  PENDING:   { bg: "#fef3c7", color: "#92400e", label: "Pending" },
  CONFIRMED: { bg: "#d1fae5", color: "#065f46", label: "Confirmed" },
  CANCELLED: { bg: "#fee2e2", color: "#991b1b", label: "Cancelled" },
  COMPLETED: { bg: "#dbeafe", color: "#1e40af", label: "Completed" },
  NO_SHOW:   { bg: "#f3f4f6", color: "#374151", label: "No-show" },
};
const DARK: Record<string, { bg: string; color: string; label: string }> = {
  PENDING:   { bg: "#451a03", color: "#fbbf24", label: "Pending" },
  CONFIRMED: { bg: "#064e3b", color: "#34d399", label: "Confirmed" },
  CANCELLED: { bg: "#450a0a", color: "#f87171", label: "Cancelled" },
  COMPLETED: { bg: "#1e3a5f", color: "#60a5fa", label: "Completed" },
  NO_SHOW:   { bg: "#1f2937", color: "#9ca3af", label: "No-show" },
};

interface Props {
  status: string;
}

export function StatusBadge({ status }: Props) {
  const scheme = useColorScheme();
  const map = scheme === "dark" ? DARK : LIGHT;
  const config = map[status] ?? map["NO_SHOW"];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
});
