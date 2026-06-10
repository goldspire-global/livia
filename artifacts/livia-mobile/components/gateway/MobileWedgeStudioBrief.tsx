import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { fonts } from "@/constants/typography";
import type { G1WedgeWorld } from "@/lib/g1-wedge-worlds";
import { g1TaglineForWorld, g1TitleForWorld } from "@/lib/g1-wedge-worlds";
import { gatewayTheme } from "@/lib/gateway-theme";
import {
  resolveWedgeBeatVisual,
  resolveWedgeLivIntro,
  WEDGE_BEAT_CROP_META,
} from "@/lib/wedge-beat-visuals";
import type { BusinessVertical, WedgeDemoBeat } from "@workspace/policy";

type Props = {
  beats: WedgeDemoBeat[];
  tradeLabel: string;
  vertical: BusinessVertical;
  world?: G1WedgeWorld | null;
  disabled?: boolean;
  continueLabel?: string;
  onBack: () => void;
  onContinue: () => void;
};

function BriefCell({
  beat,
  vertical,
  layout,
}: {
  beat: WedgeDemoBeat;
  vertical: BusinessVertical;
  layout: "hero" | "tile";
}) {
  const meta = WEDGE_BEAT_CROP_META[beat.cropHint] ?? WEDGE_BEAT_CROP_META.inbox;
  const visual = resolveWedgeBeatVisual(vertical, beat);

  return (
    <View
      style={[
        styles.cell,
        { borderColor: meta.ring },
        layout === "hero" ? styles.cellHero : styles.cellTile,
      ]}
      testID={`gateway-demo-beat-${beat.cropHint}`}
    >
      <View style={[styles.media, layout === "hero" && styles.mediaHero]}>
        {visual ? (
          <Image
            source={{ uri: visual.src }}
            style={styles.img}
            contentFit="cover"
          />
        ) : (
          <View style={styles.fallback}>
            <Text style={styles.fallbackText}>{beat.headline}</Text>
          </View>
        )}
        <View style={[styles.badge, { backgroundColor: meta.chipBg }]}>
          <Text style={[styles.badgeText, { color: meta.chipText }]}>{meta.label}</Text>
        </View>
      </View>
      <View style={styles.copy}>
        <Text style={styles.cellHead}>{beat.headline}</Text>
        <Text style={styles.cellDetail}>{beat.detail}</Text>
      </View>
    </View>
  );
}

export function MobileWedgeStudioBrief({
  beats,
  tradeLabel,
  vertical,
  world,
  disabled,
  continueLabel = "Enter live demo",
  onBack,
  onContinue,
}: Props) {
  const g1Title = g1TitleForWorld(world ?? null) ?? tradeLabel;
  const g1Tagline = g1TaglineForWorld(world ?? null);
  const [hero, ...tiles] = beats;
  const livIntro = resolveWedgeLivIntro(vertical);

  return (
    <View testID="gateway-demo-beats-grid">
      <Pressable onPress={onBack} style={styles.back} testID="gateway-demo-back-worlds">
        <Feather name="arrow-left" size={14} color={gatewayTheme.goldLight} />
        <Text style={styles.backText}>← Worlds</Text>
      </Pressable>

      <View style={styles.frame}>
        <Text style={styles.world}>{tradeLabel}</Text>
        <Text style={styles.title}>{g1Title}</Text>
        {g1Tagline ? <Text style={styles.tagline}>{g1Tagline}</Text> : null}
        <Text style={styles.livIntro}>{livIntro}</Text>

        {hero ? <BriefCell beat={hero} vertical={vertical} layout="hero" /> : null}
        <View style={styles.tileRow}>
          {tiles.map((beat) => (
            <BriefCell key={beat.cropHint} beat={beat} vertical={vertical} layout="tile" />
          ))}
        </View>

        <Pressable
          onPress={onContinue}
          disabled={disabled}
          style={({ pressed }) => [
            styles.cta,
            { opacity: disabled ? 0.5 : pressed ? 0.9 : 1 },
          ]}
        >
          <Text style={styles.ctaText}>{continueLabel}</Text>
          <Feather name="arrow-right" size={16} color="#1a1510" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 },
  backText: { fontSize: 13, color: gatewayTheme.goldLight },
  frame: {
    borderWidth: 2,
    borderColor: `${gatewayTheme.goldMid}73`,
    borderRadius: 24,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  world: {
    fontSize: 11,
    fontFamily: fonts.mono,
    color: gatewayTheme.goldMid,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontFamily: fonts.serifMedium,
    fontSize: 24,
    color: gatewayTheme.goldLight,
    marginTop: 4,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    marginTop: 4,
    fontFamily: fonts.serifItalic,
  },
  livIntro: {
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255,255,255,0.6)",
    marginTop: 12,
    marginBottom: 14,
  },
  cell: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: `${gatewayTheme.inkPanel}cc`,
    marginBottom: 10,
  },
  cellHero: {},
  cellTile: { flex: 1, minWidth: "48%" },
  media: { position: "relative" },
  mediaHero: { aspectRatio: 16 / 9 },
  img: { width: "100%", height: "100%", minHeight: 120 },
  fallback: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  fallbackText: { color: "rgba(255,255,255,0.5)", fontSize: 12, textAlign: "center" },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 10, fontFamily: fonts.mono },
  copy: { padding: 12 },
  cellHead: { fontFamily: fonts.bodySemi, fontSize: 14, color: "#fff" },
  cellDetail: { fontSize: 12, lineHeight: 16, color: "rgba(255,255,255,0.55)", marginTop: 4 },
  tileRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: gatewayTheme.goldMid,
    borderRadius: 999,
    paddingVertical: 14,
    marginTop: 6,
  },
  ctaText: { fontFamily: fonts.bodySemi, fontSize: 14, color: "#1a1510" },
});
