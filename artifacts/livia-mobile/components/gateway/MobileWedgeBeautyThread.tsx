import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { fonts } from "@/constants/typography";
import type { G1WedgeWorld } from "@/lib/g1-wedge-worlds";
import { g1TaglineForWorld, g1TitleForWorld } from "@/lib/g1-wedge-worlds";
import { gatewayTheme } from "@/lib/gateway-theme";
import {
  filterWedgeChapters,
  resolveWedgeBeatVisual,
  resolveWedgeLivIntro,
  resolveWedgeThreadBridge,
} from "@/lib/wedge-beat-visuals";
import type { BusinessVertical, WedgeDemoBeat } from "@workspace/policy";

const CHAPTER_LABEL: Record<string, string> = {
  inbox: "Bookings",
  "public-book": "/b",
  today: "Today",
};

type Props = {
  vertical: BusinessVertical;
  world?: G1WedgeWorld | null;
  beats: WedgeDemoBeat[];
  tradeLabel: string;
  disabled?: boolean;
  continueLabel?: string;
  onBack: () => void;
  onContinue: () => void;
};

function ThreadChapter({
  vertical,
  beat,
  index,
  isLast,
}: {
  vertical: BusinessVertical;
  beat: WedgeDemoBeat;
  index: number;
  isLast: boolean;
}) {
  const visual = resolveWedgeBeatVisual(vertical, beat);
  const bridge = resolveWedgeThreadBridge(vertical, beat);
  const label = CHAPTER_LABEL[beat.cropHint] ?? beat.cropHint;

  return (
    <View style={styles.chapter} testID={`gateway-demo-beat-${beat.cropHint}`}>
      <View style={styles.rail}>
        <Text style={styles.node}>{String(index + 1).padStart(2, "0")}</Text>
        {!isLast ? <View style={styles.stem} /> : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.eyebrow}>{label}</Text>
        <Text style={styles.headline}>{beat.headline}</Text>
        <Text style={styles.detail}>{beat.detail}</Text>
        {visual ? (
          <View
            style={[
              styles.figure,
              visual.aspect === "phone" ? styles.figurePhone : styles.figureWide,
            ]}
          >
            <Image
              source={{ uri: visual.src }}
              style={styles.shot}
              contentFit="cover"
              transition={200}
            />
          </View>
        ) : null}
        {bridge ? (
          <View style={styles.bridge}>
            <Text style={styles.bridgeMark}>liv</Text>
            <Text style={styles.bridgeText}>{bridge}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function MobileWedgeBeautyThread({
  vertical,
  world,
  beats,
  tradeLabel,
  disabled,
  continueLabel = "Walk into the live demo",
  onBack,
  onContinue,
}: Props) {
  const chapters = filterWedgeChapters(beats);
  const g1Title = g1TitleForWorld(world ?? null) ?? tradeLabel;
  const g1Tagline = g1TaglineForWorld(world ?? null);
  const livIntro = resolveWedgeLivIntro(vertical);
  const arc = vertical === "wellness" ? "From message to room" : "From DM to chair";

  return (
    <View testID="gateway-demo-beats-grid">
      <Pressable onPress={onBack} style={styles.back} testID="gateway-demo-back-worlds">
        <Feather name="arrow-left" size={14} color={gatewayTheme.goldLight} />
        <Text style={styles.backText}>← Worlds</Text>
      </Pressable>

      <Text style={styles.world}>{tradeLabel}</Text>
      <Text style={styles.title}>{g1Title}</Text>
      {g1Tagline ? <Text style={styles.tagline}>{g1Tagline}</Text> : null}
      <Text style={styles.arc}>{arc}</Text>

      <View style={styles.livBlock}>
        <Text style={styles.livMark}>liv</Text>
        <Text style={styles.livCopy}>{livIntro}</Text>
      </View>

      <View style={styles.chapters}>
        {chapters.map((beat, i) => (
          <ThreadChapter
            key={beat.cropHint}
            vertical={vertical}
            beat={beat}
            index={i}
            isLast={i === chapters.length - 1}
          />
        ))}
      </View>

      <Pressable
        onPress={onContinue}
        disabled={disabled}
        testID="mobile-demo-wedge-continue"
        style={({ pressed }) => [
          styles.cta,
          { opacity: disabled ? 0.5 : pressed ? 0.9 : 1 },
        ]}
      >
        <Text style={styles.ctaText}>{continueLabel}</Text>
        <Feather name="arrow-right" size={16} color="#1a1510" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 },
  backText: { fontSize: 13, color: gatewayTheme.goldLight, fontFamily: fonts.body },
  world: {
    fontSize: 11,
    fontFamily: fonts.mono,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: gatewayTheme.goldMid,
  },
  title: {
    fontFamily: fonts.serifMedium,
    fontSize: 28,
    lineHeight: 32,
    color: gatewayTheme.goldLight,
    marginTop: 6,
  },
  tagline: {
    fontFamily: fonts.serifItalic,
    fontSize: 16,
    color: "rgba(255,255,255,0.55)",
    marginTop: 4,
  },
  arc: {
    fontSize: 12,
    fontFamily: fonts.mono,
    color: "rgba(255,255,255,0.4)",
    marginTop: 12,
    letterSpacing: 0.5,
  },
  livBlock: {
    marginTop: 16,
    padding: 14,
    borderLeftWidth: 2,
    borderLeftColor: `${gatewayTheme.goldMid}88`,
    gap: 6,
  },
  livMark: {
    fontSize: 11,
    fontFamily: fonts.mono,
    color: gatewayTheme.goldMid,
    textTransform: "lowercase",
  },
  livCopy: {
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.72)",
    fontFamily: fonts.body,
  },
  chapters: { marginTop: 20, gap: 4 },
  chapter: { flexDirection: "row", gap: 12 },
  rail: { width: 36, alignItems: "center" },
  node: {
    fontSize: 11,
    fontFamily: fonts.mono,
    color: gatewayTheme.goldMid,
  },
  stem: {
    flex: 1,
    width: 1,
    backgroundColor: `${gatewayTheme.goldMid}44`,
    marginTop: 4,
    minHeight: 24,
  },
  body: { flex: 1, paddingBottom: 24 },
  eyebrow: {
    fontSize: 10,
    fontFamily: fonts.mono,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.45)",
  },
  headline: {
    fontFamily: fonts.bodySemi,
    fontSize: 17,
    color: "#fff",
    marginTop: 4,
  },
  detail: {
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },
  figure: {
    marginTop: 12,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: `${gatewayTheme.goldMid}33`,
    backgroundColor: gatewayTheme.inkPanel,
  },
  figureWide: { aspectRatio: 16 / 10 },
  figurePhone: { aspectRatio: 9 / 16, alignSelf: "center", width: "62%" },
  shot: { width: "100%", height: "100%" },
  bridge: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  bridgeMark: {
    fontSize: 10,
    fontFamily: fonts.mono,
    color: gatewayTheme.goldMid,
    fontStyle: "italic",
  },
  bridgeText: {
    flex: 1,
    fontSize: 12,
    fontStyle: "italic",
    lineHeight: 17,
    color: "rgba(230,208,165,0.75)",
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: gatewayTheme.goldMid,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  ctaText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: "#1a1510",
  },
});
