import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fonts, type } from "@/constants/typography";
import { useColors } from "@/hooks/useColors";
import { getApiBaseUrl } from "@/lib/api-base";
import { GUEST_HUB_TOKEN_KEY } from "@/lib/guest-hub";
import {
  GUEST_HUB_COPY,
  GUEST_PREFERRED_MODALITY_LABELS,
  guestHubContactLabel,
  type GuestPreferredModality,
} from "@workspace/policy";
import { GuestHubRedeemPanel } from "@/components/guest/GuestHubRedeemPanel";

const GUEST_MODALITIES = Object.keys(GUEST_PREFERRED_MODALITY_LABELS) as GuestPreferredModality[];

type HubView = {
  guestId: string;
  phoneE164: string;
  email?: string | null;
  displayName?: string | null;
  preferredModality?: GuestPreferredModality;
  packageCredits?: Array<{
    ledgerId: string;
    businessName: string;
    packageName: string;
    creditsRemaining: number;
    creditsTotal: number;
  }>;
};

export default function MyLiviaAccountScreen() {
  const colors = useColors();
  const router = useRouter();
  const api = getApiBaseUrl();
  const [hubToken, setHubToken] = useState<string | null>(null);
  const [view, setView] = useState<HubView | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [channel, setChannel] = useState<GuestPreferredModality>("ANY");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const loadView = useCallback(
    async (token: string) => {
      const r = await fetch(`${api}/api/public/guest-hub/me`, {
        headers: { "X-Guest-Hub-Token": token },
      });
      if (!r.ok) throw new Error("session");
      return r.json() as Promise<HubView>;
    },
    [api],
  );

  useEffect(() => {
    void (async () => {
      const stored = await AsyncStorage.getItem(GUEST_HUB_TOKEN_KEY);
      if (!stored) {
        setLoading(false);
        return;
      }
      setHubToken(stored);
      try {
        const v = await loadView(stored);
        setView(v);
        setDisplayName(v.displayName ?? "");
        setChannel(v.preferredModality ?? "ANY");
      } catch {
        setView(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [loadView]);

  async function saveProfile() {
    if (!hubToken) return;
    setSaving(true);
    setErr(null);
    try {
      const r = await fetch(`${api}/api/public/guest-hub/preferences`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Guest-Hub-Token": hubToken,
        },
        body: JSON.stringify({ displayName, preferredModality: channel }),
      });
      if (!r.ok) throw new Error("save");
      const v = (await r.json()) as HubView;
      setView(v);
    } catch {
      setErr("Could not save — try again");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        <ActivityIndicator style={{ marginTop: 80 }} color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!hubToken || !view) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        <Text style={[type.body, { color: colors.mutedForeground, padding: 16 }]}>
          {GUEST_HUB_COPY.signInRequired}
        </Text>
        <Pressable onPress={() => router.replace("/my-livia" as never)} style={{ padding: 16 }}>
          <Text style={{ color: colors.primary }}>Sign in</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const contact = guestHubContactLabel({ phoneE164: view.phoneE164, email: view.email });

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} testID="guest-hub-account">
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Feather name="arrow-left" size={22} color={colors.foreground} />
      </Pressable>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={[type.title, { color: colors.foreground }]}>{GUEST_HUB_COPY.accountSection}</Text>
        <Text style={[type.caption, { color: colors.mutedForeground, marginTop: 6 }]}>
          {GUEST_HUB_COPY.accountSectionBody}
        </Text>

        <View style={[styles.card, { borderColor: colors.border }]}>
          <Text style={[type.caption, { color: colors.mutedForeground }]}>Signed in as</Text>
          <Text style={[type.body, { fontFamily: fonts.bodyMed, color: colors.foreground, marginTop: 4 }]}>
            {contact}
          </Text>
        </View>

        <View style={[styles.card, { borderColor: colors.border }]}>
          <Text style={[type.body, { fontFamily: fonts.bodyMed, color: colors.foreground }]}>
            {GUEST_HUB_COPY.profileDisplayNameLabel}
          </Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder={GUEST_HUB_COPY.profileDisplayNamePlaceholder}
            placeholderTextColor={colors.mutedForeground}
          />
        </View>

        <View style={[styles.card, { borderColor: colors.border }]} testID="guest-channel-card">
          <Text style={[type.body, { fontFamily: fonts.bodyMed, color: colors.foreground }]}>
            {GUEST_HUB_COPY.commsChannelLabel}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {GUEST_MODALITIES.map((m) => (
              <Pressable
                key={m}
                onPress={() => setChannel(m)}
                style={[
                  styles.chip,
                  {
                    borderColor: channel === m ? colors.primary : colors.border,
                    backgroundColor: channel === m ? colors.primary + "18" : "transparent",
                  },
                ]}
              >
                <Text style={[type.caption, { color: channel === m ? colors.primary : colors.mutedForeground }]}>
                  {GUEST_PREFERRED_MODALITY_LABELS[m]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={() => void saveProfile()}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={[type.body, { color: colors.primaryForeground, fontFamily: fonts.bodyMed }]}>
              {GUEST_HUB_COPY.profileSaveCta}
            </Text>
          )}
        </Pressable>
        {err ? <Text style={{ color: colors.destructive }}>{err}</Text> : null}

        <View style={[styles.card, { borderColor: colors.border }]}>
          <Text style={[type.body, { fontFamily: fonts.bodyMed, color: colors.foreground }]}>
            {GUEST_HUB_COPY.packageCreditsSection}
          </Text>
          {(view.packageCredits ?? []).length > 0 ? (
            (view.packageCredits ?? []).map((p) => (
              <View key={p.ledgerId} style={{ marginTop: 10 }}>
                <Text style={[type.caption, { color: colors.foreground }]}>{p.businessName}</Text>
                <Text style={[type.caption, { color: colors.mutedForeground }]}>
                  {p.packageName} · {p.creditsRemaining} left
                </Text>
              </View>
            ))
          ) : (
            <Text style={[type.caption, { color: colors.mutedForeground, marginTop: 8 }]}>
              {GUEST_HUB_COPY.packageCreditsEmpty}
            </Text>
          )}
          <GuestHubRedeemPanel hubToken={hubToken} onRedeemed={(v) => setView(v as HubView)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  back: { padding: 16 },
  pad: { padding: 16, paddingBottom: 40, gap: 12 },
  card: { borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  btn: { borderRadius: 10, padding: 14, alignItems: "center", marginTop: 8 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
});
