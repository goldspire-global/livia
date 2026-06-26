import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { fonts, type } from "@/constants/typography";
import { useColors } from "@/hooks/useColors";
import { getApiBaseUrl } from "@/lib/api-base";
import { GUEST_HUB_COPY } from "@workspace/policy";

type HubView = Record<string, unknown>;

export function GuestHubRedeemPanel({
  hubToken,
  onRedeemed,
}: {
  hubToken: string;
  onRedeemed: (view: HubView) => void;
}) {
  const colors = useColors();
  const api = getApiBaseUrl();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function redeem() {
    const trimmed = code.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setErr(null);
    setSuccess(null);
    try {
      const r = await fetch(`${api}/api/public/guest-hub/redeem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Guest-Hub-Token": hubToken,
        },
        body: JSON.stringify({ code: trimmed }),
      });
      const j = (await r.json().catch(() => ({}))) as {
        error?: string;
        view?: HubView;
        packageName?: string;
        businessName?: string;
      };
      if (!r.ok) throw new Error(j.error ?? GUEST_HUB_COPY.redeemNotFound);
      if (j.view) onRedeemed(j.view);
      setSuccess(GUEST_HUB_COPY.redeemSuccess);
      setCode("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : GUEST_HUB_COPY.actionFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.wrap} testID="guest-hub-redeem">
      <Text style={[type.body, { fontFamily: fonts.bodyMed, color: colors.foreground }]}>
        {GUEST_HUB_COPY.redeemCodeLabel}
      </Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
        placeholder="Gift or pack code"
        placeholderTextColor={colors.mutedForeground}
        value={code}
        onChangeText={(t) => setCode(t.toUpperCase())}
        autoCapitalize="characters"
        testID="guest-hub-redeem-input"
      />
      <Pressable
        style={[styles.btn, { backgroundColor: colors.primary }, busy && { opacity: 0.7 }]}
        onPress={() => void redeem()}
        disabled={busy || !code.trim()}
        testID="guest-hub-redeem-submit"
      >
        {busy ? (
          <ActivityIndicator color={colors.primaryForeground} />
        ) : (
          <Text style={[type.body, { color: colors.primaryForeground, fontFamily: fonts.bodyMed }]}>
            {GUEST_HUB_COPY.redeemCodeCta}
          </Text>
        )}
      </Pressable>
      {success ? <Text style={[type.caption, { color: colors.primary }]}>{success}</Text> : null}
      {err ? <Text style={[type.caption, { color: colors.destructive }]}>{err}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  btn: { borderRadius: 10, padding: 14, alignItems: "center" },
});
