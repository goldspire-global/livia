import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import {
  buildCompactOwnerIntelligenceRows,
  ownerIntelligenceActSignalCount,
} from "@workspace/policy";
import { aurora } from "@/constants/colors";
import { fonts } from "@/constants/typography";
import { useColors } from "@/hooks/useColors";
import { useHaptics } from "@/hooks/useHaptics";
import { OwnerLivOpsCard } from "@/components/OwnerLivOpsCard";
import * as Linking from "expo-linking";
import { getDashboardBaseUrl } from "@/lib/dashboard-url";

type IntelBundle = {
  remediationTasks?: Array<{
    signalId: string;
    severity: string;
    title: string;
    body: string;
    href: string;
  }>;
  commerce?: {
    topSignal?: { severity: string; title: string; body: string; href: string } | null;
    signals?: Array<{ severity: string; title: string; body: string; href: string }>;
  };
  commerceCapabilityBlockers?: Array<{
    capabilityName: string;
    blocker: string;
    href: string;
  }>;
  twinRisks?: Array<{ id: string; title: string; body: string; href?: string }>;
  twinHeadline?: string | null;
};

export function OwnerLivAssistFab({
  businessId,
  starters = [],
  soloMode = false,
}: {
  businessId: string;
  starters?: string[];
  soloMode?: boolean;
}) {
  const colors = useColors();
  const haptics = useHaptics();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["owner-intelligence", businessId],
    queryFn: () => customFetch<IntelBundle>(`/api/businesses/${businessId}/owner-intelligence`),
    enabled: !!businessId,
    staleTime: 90_000,
  });

  const actCount = ownerIntelligenceActSignalCount(data ?? undefined);
  const actRows = useMemo(() => {
    const { primary, more } = buildCompactOwnerIntelligenceRows(data ?? {});
    const rows = [primary, ...more].filter(Boolean) as NonNullable<typeof primary>[];
    const seen = new Set<string>();
    const out: typeof rows = [];
    for (const row of rows) {
      if (row.severity !== "act") continue;
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      out.push(row);
      if (out.length >= 4) break;
    }
    return out;
  }, [data]);
  const blockers = data?.commerceCapabilityBlockers ?? [];

  return (
    <>
      <Pressable
        onPress={() => {
          haptics.impact();
          setOpen(true);
        }}
        style={[
          styles.fab,
          {
            backgroundColor: aurora.violet,
            bottom: 72 + insets.bottom,
          },
        ]}
        testID="owner-liv-assist-fab"
        accessibilityRole="button"
        accessibilityLabel="Ask Liv owner ops"
      >
        <Feather name="message-circle" size={20} color="#0f172a" />
        <Text style={styles.fabLabel}>Ask Liv</Text>
        {actCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{actCount}</Text>
          </View>
        ) : null}
      </Pressable>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
        <KeyboardAvoidingView
          style={[styles.sheet, { backgroundColor: colors.background }]}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={[styles.sheetHead, { borderColor: colors.border }]}>
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Ask Liv</Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={12}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>
          {data?.twinHeadline ? (
            <Text style={[styles.lede, { color: colors.mutedForeground }]} numberOfLines={2}>
              {data.twinHeadline}
            </Text>
          ) : null}
          <ScrollView contentContainerStyle={styles.sheetBody} keyboardShouldPersistTaps="handled">
            {actRows.length > 0 ? (
              <View style={[styles.actBlock, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <Text style={[styles.actTitle, { color: colors.foreground }]}>Needs a yes</Text>
                {actRows.map((row) => (
                  <Pressable
                    key={row.id}
                    onPress={() => {
                      haptics.tap();
                      void Linking.openURL(`${getDashboardBaseUrl()}${row.href}`);
                    }}
                    style={styles.actRow}
                  >
                    <Text style={[styles.actRowTitle, { color: colors.foreground }]} numberOfLines={1}>
                      {row.title}
                    </Text>
                    <Text style={[styles.actRowBody, { color: colors.mutedForeground }]} numberOfLines={2}>
                      {row.body}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            {blockers.length > 0 ? (
              <View style={[styles.actBlock, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <Text style={[styles.actTitle, { color: colors.foreground }]}>Finish setup</Text>
                {blockers.slice(0, 3).map((b) => (
                  <Pressable
                    key={b.capabilityName}
                    onPress={() => {
                      haptics.tap();
                      void Linking.openURL(`${getDashboardBaseUrl()}${b.href}`);
                    }}
                    style={styles.actRow}
                  >
                    <Text style={[styles.actRowTitle, { color: colors.foreground }]} numberOfLines={1}>
                      {b.capabilityName}
                    </Text>
                    <Text style={[styles.actRowBody, { color: colors.mutedForeground }]} numberOfLines={2}>
                      {b.blocker}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            <OwnerLivOpsCard businessId={businessId} starters={starters} soloMode={soloMode} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: aurora.violet,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 50,
  },
  fabLabel: { fontFamily: fonts.bodySemi, fontSize: 14, color: "#0f172a" },
  badge: {
    marginLeft: 2,
    backgroundColor: "#0f172a",
    borderRadius: 999,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 10, fontFamily: fonts.bodySemi },
  sheet: { flex: 1 },
  sheetHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetTitle: { fontFamily: fonts.bodySemi, fontSize: 17 },
  lede: { fontSize: 13, paddingHorizontal: 16, paddingBottom: 8, lineHeight: 18 },
  sheetBody: { padding: 16, paddingBottom: 32, gap: 12 },
  actBlock: { borderRadius: 14, borderWidth: 1, padding: 12, gap: 8 },
  actTitle: { fontFamily: fonts.bodySemi, fontSize: 12, letterSpacing: 0.4, textTransform: "uppercase" },
  actRow: { gap: 2, paddingVertical: 4 },
  actRowTitle: { fontFamily: fonts.bodyMed, fontSize: 14 },
  actRowBody: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16 },
});
