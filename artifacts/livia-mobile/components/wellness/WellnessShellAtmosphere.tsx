import { resolveWellnessExperience, type WellnessCssPreset } from "@workspace/policy";
import React from "react";
import { StyleSheet, View } from "react-native";
import { WellnessBreathField } from "@/components/wellness/WellnessBreathField";

/** Shell-wide wellness ambient — parity with web `WellnessAtmosphere` on app layout. */
export function WellnessShellAtmosphere({
  cssPreset = "harbour-light",
}: {
  cssPreset?: WellnessCssPreset | string | null;
}) {
  const profile = resolveWellnessExperience(cssPreset ?? "harbour-light");
  if (!profile) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <WellnessBreathField cssPreset={cssPreset ?? "harbour-light"} />
      <View
        style={[
          styles.vignette,
          {
            backgroundColor:
              profile.preset === "evening-ledger"
                ? "rgba(8,12,20,0.35)"
                : "rgba(6,20,18,0.2)",
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  vignette: {
    ...StyleSheet.absoluteFillObject,
  },
});
