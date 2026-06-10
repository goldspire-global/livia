import React from "react";
import { StyleSheet, View } from "react-native";
import { PresentationAtmosphere } from "@/components/shell/PresentationAtmosphere";
import { useMobileSkin } from "@/contexts/PresentationThemeContext";
import { useColors } from "@/hooks/useColors";
import { tenantScreenBackground } from "@/lib/tenant-shell-layout";

/**
 * Fixed presentation shell behind operator surfaces (tabs + stack).
 * Inherits tenant appearance via `resolveMobileSkin`.
 */
export function TenantPresentationShell({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  const skin = useMobileSkin();

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: tenantScreenBackground(skin.transparentScreens, colors.background),
        },
      ]}
    >
      {skin.atmosphere !== "none" ? <PresentationAtmosphere /> : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
});
