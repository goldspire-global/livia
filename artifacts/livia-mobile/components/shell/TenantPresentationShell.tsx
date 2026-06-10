import React from "react";
import { StyleSheet, View } from "react-native";
import { BeautyShellAtmosphere } from "@/components/beauty/BeautyShellAtmosphere";
import { ConstellationShellAtmosphere } from "@/components/constellation/ConstellationShellAtmosphere";
import { AuroraHalo } from "@/components/brand/AuroraHalo";
import { WellnessShellAtmosphere } from "@/components/wellness/WellnessShellAtmosphere";
import { useMobileSkin } from "@/contexts/PresentationThemeContext";
import { useColors } from "@/hooks/useColors";
import { tenantScreenBackground } from "@/lib/tenant-shell-layout";

/**
 * Fixed presentation shell behind all operator tabs.
 * Inherits tenant appearance (preset + brand) via `resolveMobileSkin` — native atmosphere, not web DOM.
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
      {skin.atmosphere === "constellation-shell" ? (
        <ConstellationShellAtmosphere />
      ) : skin.atmosphere === "wellness-breath" ? (
        <WellnessShellAtmosphere cssPreset={skin.effectiveCssPreset} />
      ) : skin.atmosphere === "beauty-glow" ? (
        <BeautyShellAtmosphere />
      ) : skin.atmosphere === "aurora-halo" ? (
        <AuroraHalo tone="primary" size={420} style={styles.halo} intensity={0.85} />
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  halo: { position: "absolute", top: -140, left: -90 },
});
