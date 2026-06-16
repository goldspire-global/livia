import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { fonts } from "@/constants/typography";
import {
  operatingPulsePanelCopy,
  type OperatingAttentionBucket,
  type OperatingPulseView,
} from "@workspace/policy";

function PulseCell({
  bucket,
  count,
  colors,
  onPress,
}: {
  bucket: OperatingAttentionBucket;
  count: number;
  colors: ReturnType<typeof useColors>;
  onPress?: () => void;
}) {
  const copy = operatingPulsePanelCopy(bucket);
  const icon =
    bucket === "needs_you" ? "user" : bucket === "guest_action" ? "users" : "zap";
  const inner = (
    <>
      <View style={styles.cellHead}>
        <Feather name={icon as "user"} size={12} color={colors.mutedForeground} />
        <Text style={[styles.cellLabel, { color: colors.mutedForeground }]}>{copy.label}</Text>
      </View>
      <Text style={[styles.cellCount, { color: colors.foreground }]}>{count}</Text>
    </>
  );
  if (onPress && count > 0) {
    return (
      <Pressable
        onPress={onPress}
        style={[styles.cell, { borderColor: colors.border, backgroundColor: colors.card }]}
      >
        {inner}
      </Pressable>
    );
  }
  return (
    <View style={[styles.cell, { borderColor: colors.border, backgroundColor: colors.card }]}>
      {inner}
    </View>
  );
}

/** Mobile parity — owner operating pulse from dashboard summary. */
export function OwnerOperatingPulseCard({
  pulse,
}: {
  pulse?: OperatingPulseView | null;
}) {
  const colors = useColors();
  const router = useRouter();
  if (!pulse) return null;
  const total = pulse.livHandling + pulse.needsYou + pulse.guestAction;
  if (total === 0 && pulse.inboxNeedsYou === 0) return null;

  const openBookingsLens = (lens: string) => {
    router.push(`/bookings?status=PENDING&lens=${lens}`);
  };

  return (
    <View
      style={[styles.wrap, { borderColor: colors.primary + "33", backgroundColor: colors.primary + "08" }]}
      testID="owner-operating-pulse"
    >
      <Text style={[styles.title, { color: colors.foreground }]}>{pulse.headline}</Text>
      <Text style={[styles.subline, { color: colors.mutedForeground }]}>{pulse.subline}</Text>
      <View style={styles.row}>
        <PulseCell bucket="liv_handling" count={pulse.livHandling} colors={colors} />
        <PulseCell
          bucket="guest_action"
          count={pulse.guestAction}
          colors={colors}
          onPress={() => openBookingsLens("guest_action")}
        />
        <PulseCell
          bucket="needs_you"
          count={pulse.needsYou}
          colors={colors}
          onPress={() => openBookingsLens("needs_you")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    marginBottom: 4,
  },
  subline: {
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  cell: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    minWidth: 0,
  },
  cellHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cellLabel: {
    fontFamily: fonts.bodyMed,
    fontSize: 10,
    flexShrink: 1,
  },
  cellCount: {
    fontFamily: fonts.bodyBold,
    fontSize: 22,
    marginTop: 4,
  },
});
