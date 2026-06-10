/**
 * Legacy mock persona showcase — redirect to G1 demo gateway.
 * Live walkthrough: /demo → wedge → sign in (same as web).
 */

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

export default function LegacyDemoPersonaRedirect() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams<{ persona: string }>();

  useEffect(() => {
    const p = params.persona;
    if (p === "wedge") return;
    router.replace("/demo" as never);
  }, [params.persona, router]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ActivityIndicator color={colors.primary} />
      <Text style={[styles.text, { color: colors.mutedForeground }]}>
        Opening demo gateway…
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  text: { fontSize: 13 },
});
