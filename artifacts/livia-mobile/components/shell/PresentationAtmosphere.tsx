import React from "react";
import { StyleSheet, View } from "react-native";
import { BeautyShellAtmosphere } from "@/components/beauty/BeautyShellAtmosphere";
import { ConstellationShellAtmosphere } from "@/components/constellation/ConstellationShellAtmosphere";
import { AuroraHalo } from "@/components/brand/AuroraHalo";
import { WellnessShellAtmosphere } from "@/components/wellness/WellnessShellAtmosphere";
import { useMobileSkin } from "@/contexts/PresentationThemeContext";
import type { MobileAtmosphere } from "@/lib/resolve-mobile-skin";

/** Fixed atmosphere layer — tabs, stack pushes, and OperationalScreen share this. */
export function PresentationAtmosphere({ variant }: { variant?: MobileAtmosphere }) {
  const skin = useMobileSkin();
  const atmosphere = variant ?? skin.atmosphere;

  if (atmosphere === "constellation-shell") {
    return <ConstellationShellAtmosphere />;
  }
  if (atmosphere === "wellness-breath") {
    return <WellnessShellAtmosphere cssPreset={skin.effectiveCssPreset} />;
  }
  if (atmosphere === "beauty-glow") {
    return <BeautyShellAtmosphere />;
  }
  if (atmosphere === "aurora-halo") {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <AuroraHalo tone="primary" size={420} style={styles.halo} intensity={0.95} />
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  halo: { position: "absolute", top: -140, left: -90 },
});
