import { Feather } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { MobileDemoGuestShortcut } from "@/components/demo/MobileDemoGuestShortcut";
import { fonts } from "@/constants/typography";
import type { DemoRosterEntry } from "@/lib/demo-portal";
import { gatewayTheme } from "@/lib/gateway-theme";

type Props = {
  tradeLabel: string;
  businessName: string;
  roster: DemoRosterEntry[];
  disabled?: boolean;
  enteringKey: string | null;
  onBack: () => void;
  onEnter: (email: string, busyKey: string) => void;
};

export function MobileGatewayEnterStage({
  tradeLabel,
  businessName,
  roster,
  disabled,
  enteringKey,
  onBack,
  onEnter,
}: Props) {
  return (
    <View
      style={styles.outer}
      testID="gateway-demo-card-stage"
    >
      <View style={styles.inner}>
        <Pressable onPress={onBack} style={styles.back} testID="gateway-demo-back-worlds">
          <Text style={styles.backText}>← Story</Text>
        </Pressable>

        <Text style={styles.trade}>{tradeLabel}</Text>
        <Text style={styles.business}>{businessName}</Text>
        <Text style={styles.hint}>
          Tap a role to sign into the live mobile app — same Clerk tickets as web.
        </Text>

        <MobileDemoGuestShortcut embedded />

        <Text style={styles.rolesEyebrow}>Staff roles</Text>
        <View style={styles.roleGrid} testID="gateway-demo-enter-roles">
          {roster.map((entry) => {
            const busyKey = `${entry.email}`;
            const loading = enteringKey === busyKey;
            const primary = entry.role === "owner";
            return (
              <Pressable
                key={entry.email}
                disabled={disabled || loading}
                onPress={() => onEnter(entry.email, busyKey)}
                style={({ pressed }) => [
                  styles.roleCard,
                  primary && styles.roleCardPrimary,
                  { opacity: disabled ? 0.5 : pressed ? 0.9 : 1 },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={gatewayTheme.goldLight} size="small" />
                ) : (
                  <>
                    <Text style={[styles.roleLabel, primary && styles.roleLabelPrimary]}>
                      {entry.label}
                    </Text>
                    <Text style={styles.roleEmail} numberOfLines={1}>
                      {entry.email}
                    </Text>
                  </>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderWidth: 2,
    borderColor: `${gatewayTheme.goldMid}73`,
    borderRadius: 24,
    padding: 4,
    shadowColor: gatewayTheme.goldMid,
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  inner: {
    borderWidth: 1,
    borderColor: `${gatewayTheme.primaryChampagne}40`,
    borderRadius: 20,
    backgroundColor: `${gatewayTheme.inkPanel}e6`,
    padding: 16,
  },
  back: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: `${gatewayTheme.goldMid}59`,
    backgroundColor: `${gatewayTheme.goldMid}1a`,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  backText: { fontSize: 13, color: gatewayTheme.goldLight },
  trade: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: `${gatewayTheme.goldLight}f2`,
  },
  business: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: "#fff",
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
    color: "rgba(255,255,255,0.5)",
    marginTop: 8,
    marginBottom: 14,
  },
  rolesEyebrow: {
    fontSize: 10,
    fontFamily: fonts.mono,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.45)",
    marginTop: 16,
    marginBottom: 8,
  },
  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  roleCard: {
    width: "48%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 12,
    minHeight: 72,
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  roleCardPrimary: {
    borderColor: `${gatewayTheme.primaryChampagne}80`,
    backgroundColor: `${gatewayTheme.primaryChampagne}14`,
  },
  roleLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: "#fff",
  },
  roleLabelPrimary: { color: gatewayTheme.goldLight },
  roleEmail: {
    fontSize: 10,
    fontFamily: fonts.mono,
    color: "rgba(255,255,255,0.45)",
    marginTop: 4,
  },
});
