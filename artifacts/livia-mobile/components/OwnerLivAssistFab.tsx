import React, { useState } from "react";
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
import { ownerIntelligenceActSignalCount } from "@workspace/policy";
import { aurora } from "@/constants/colors";
import { fonts } from "@/constants/typography";
import { useColors } from "@/hooks/useColors";
import { useHaptics } from "@/hooks/useHaptics";
import { OwnerLivOpsCard } from "@/components/OwnerLivOpsCard";

type IntelBundle = {
  remediationTasks?: Array<{ severity: string }>;
  commerce?: { topSignal?: { severity: string } | null; signals?: Array<{ severity: string }> };
  commerceCapabilityBlockers?: unknown[];
  twinRisks?: unknown[];
  twinHeadline?: string | null;
};

export function OwnerLivAssistFab({ businessId }: { businessId: string }) {
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
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Owner ops with Liv</Text>
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
            <OwnerLivOpsCard businessId={businessId} />
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
  sheetBody: { padding: 16, paddingBottom: 32 },
});
