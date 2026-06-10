import { Feather } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { fonts } from "@/constants/typography";
import { isDemoClerkQuotaError } from "@/lib/demo-portal";
import { gatewayTheme } from "@/lib/gateway-theme";

type Props = {
  provisioned: boolean;
  businessCount: number;
  loading: boolean;
  error: string | null;
  busy: boolean;
  onSetup: () => void;
  onRetry: () => void;
  onRepair?: () => void;
};

/** G1 readiness — parity with dashboard `demo-world-readiness-strip.tsx`. */
export function MobileDemoReadinessStrip({
  provisioned,
  businessCount,
  loading,
  error,
  busy,
  onSetup,
  onRetry,
  onRepair,
}: Props) {
  const showQuotaRepair = Boolean(error && isDemoClerkQuotaError(error) && onRepair);

  if (loading && !provisioned && businessCount === 0) {
    return (
      <View style={[styles.wrap, styles.loading]} testID="mobile-demo-readiness-loading">
        <ActivityIndicator color={gatewayTheme.primaryChampagne} />
        <Text style={styles.meta}>Checking demo world…</Text>
      </View>
    );
  }

  if (provisioned) {
    return (
      <View style={[styles.wrap, styles.ready]} testID="mobile-demo-readiness-ready">
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.title}>Live demo ready</Text>
          <Text style={styles.meta}>
            {businessCount} seeded {businessCount === 1 ? "business" : "businesses"} — pick a world,
            then enter live demo.
          </Text>
        </View>
        <Pressable
          onPress={onRetry}
          disabled={busy || loading}
          style={styles.btnGhost}
        >
          <Feather name="refresh-cw" size={14} color="rgba(255,255,255,0.55)" />
          <Text style={styles.btnGhostText}>Refresh</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.wrapColumn, styles.setup]} testID="mobile-demo-readiness-setup">
      <View style={{ gap: 4 }}>
        <Text style={styles.title}>Set up demo world once — then Enter live demo unlocks</Text>
        <Text style={styles.meta}>
          Unlocked trades (Beauty, Wellness, Hair, Medspa) need a one-time seed (30s–3 min). After
          that, wedge → enter signs you in as owner — same flow as web /demo.
        </Text>
        {busy ? (
          <View style={styles.busyRow}>
            <ActivityIndicator color="#f59e0b" size="small" />
            <Text style={styles.busyText}>
              Seeding demo data… keep the app open (first run can take a few minutes).
            </Text>
          </View>
        ) : null}
        {error ? (
          <Text style={styles.error}>
            {error}
            {!busy ? " · Tap Set up to retry" : ""}
          </Text>
        ) : loading ? (
          <Text style={styles.meta}>Status check slow — you can still run setup.</Text>
        ) : null}
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={onSetup}
          disabled={busy}
          testID="mobile-demo-setup-btn"
          style={({ pressed }) => [
            styles.btn,
            { opacity: pressed || busy ? 0.85 : 1 },
          ]}
        >
          {busy ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <>
              <Feather name="refresh-cw" size={14} color="#000" />
              <Text style={styles.btnText}>Set up demo world</Text>
            </>
          )}
        </Pressable>
        {showQuotaRepair ? (
          <Pressable
            onPress={onRepair}
            disabled={busy}
            testID="mobile-demo-repair-btn"
            style={[styles.btnGhost, { borderColor: "#f59e0b88" }]}
          >
            <Text style={[styles.btnGhostText, { color: "#fff" }]}>Repair (no new Clerk)</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={onRetry} disabled={busy || loading} style={styles.btnGhost}>
          <Text style={styles.btnGhostText}>Retry status</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginTop: 20,
  },
  loading: {
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  ready: {
    borderColor: "#34d39955",
    backgroundColor: "#34d39918",
  },
  setup: {
    borderColor: "#f59e0b55",
    backgroundColor: "#f59e0b14",
  },
  wrapColumn: {
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginTop: 20,
  },
  title: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: "#fff",
  },
  meta: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: fonts.body,
    color: "rgba(255,255,255,0.65)",
  },
  error: {
    fontSize: 11,
    fontFamily: fonts.mono,
    marginTop: 4,
    lineHeight: 16,
  },
  busyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  busyText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: fonts.body,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "center",
    backgroundColor: "#fbbf24",
  },
  btnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
  },
  btnGhost: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  btnGhostText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
  },
});
