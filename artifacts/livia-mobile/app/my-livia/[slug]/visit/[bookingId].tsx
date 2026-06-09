import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
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
import { GUEST_HUB_TOKEN_KEY, openGuestBookUrl } from "@/lib/guest-hub";

type VisitPayload = {
  booking: {
    businessName: string;
    serviceName: string;
    status: string;
    startAt: string;
    staffDisplayName: string | null;
    depositLine?: { label: string; tone: string } | null;
  };
  prepNotes: string[];
  visitGreeting: string;
  depositPayUrl?: string | null;
  bookUrl: string;
};

export default function MyLiviaVisitScreen() {
  const colors = useColors();
  const router = useRouter();
  const { slug, bookingId } = useLocalSearchParams<{ slug: string; bookingId: string }>();
  const api = getApiBaseUrl();
  const [hubToken, setHubToken] = useState<string | null>(null);
  const [data, setData] = useState<VisitPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const token = await AsyncStorage.getItem(GUEST_HUB_TOKEN_KEY);
    if (!token || !slug || !bookingId) {
      setLoading(false);
      return;
    }
    setHubToken(token);
    const r = await fetch(
      `${api}/api/public/guest-hub/shops/${encodeURIComponent(slug)}/visits/${encodeURIComponent(bookingId)}`,
      { headers: { "X-Guest-Hub-Token": token } },
    );
    if (!r.ok) {
      setData(null);
      setLoading(false);
      return;
    }
    setData((await r.json()) as VisitPayload);
    setLoading(false);
  }, [api, slug, bookingId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runningLate() {
    if (!hubToken || !slug || !bookingId) return;
    setBusy(true);
    try {
      await fetch(
        `${api}/api/public/guest-hub/shops/${encodeURIComponent(slug)}/visits/${encodeURIComponent(bookingId)}/running-late`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Guest-Hub-Token": hubToken,
          },
          body: JSON.stringify({ minutesLate: 10 }),
        },
      );
      setMessage("Studio notified — thanks for the heads up.");
    } finally {
      setBusy(false);
    }
  }

  async function sendMessage() {
    if (!hubToken || !slug || !bookingId || !reply.trim()) return;
    setBusy(true);
    try {
      const r = await fetch(
        `${api}/api/public/guest-hub/shops/${encodeURIComponent(slug)}/visits/${encodeURIComponent(bookingId)}/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Guest-Hub-Token": hubToken,
          },
          body: JSON.stringify({ content: reply.trim() }),
        },
      );
      if (r.ok) {
        setReply("");
        setMessage("Message sent.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        <ActivityIndicator style={{ marginTop: 80 }} color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[type.body, { color: colors.mutedForeground, padding: 16 }]}>Visit not found.</Text>
      </SafeAreaView>
    );
  }

  const b = data.booking;
  const visitTime = new Date(b.startAt).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Feather name="arrow-left" size={22} color={colors.foreground} />
      </Pressable>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={[type.caption, { color: colors.mutedForeground }]}>{b.businessName}</Text>
        <Text style={[type.title, { color: colors.foreground, marginTop: 4 }]}>{visitTime}</Text>
        <Text style={[type.body, { color: colors.foreground, marginTop: 8 }]}>{b.serviceName}</Text>
        {b.staffDisplayName ? (
          <Text style={[type.caption, { color: colors.mutedForeground }]}>with {b.staffDisplayName}</Text>
        ) : null}
        <Text style={[type.caption, { color: colors.mutedForeground, marginTop: 8 }]}>
          {data.visitGreeting}
        </Text>
        {b.depositLine ? (
          <Text style={[type.caption, { color: colors.primary, marginTop: 8 }]}>{b.depositLine.label}</Text>
        ) : null}

        {data.depositPayUrl ? (
          <Pressable
            style={[styles.btn, { backgroundColor: colors.primary, marginTop: 12 }]}
            onPress={() => void Linking.openURL(data.depositPayUrl!)}
          >
            <Text style={[type.body, { color: colors.primaryForeground, fontFamily: fonts.bodyMed }]}>
              Pay deposit
            </Text>
          </Pressable>
        ) : null}

        {data.prepNotes.length > 0 ? (
          <View style={[styles.card, { borderColor: colors.border, marginTop: 16 }]}>
            <Text style={[type.body, { fontFamily: fonts.bodyMed, color: colors.foreground }]}>
              For your visit
            </Text>
            {data.prepNotes.map((n) => (
              <Text key={n} style={[type.caption, { color: colors.mutedForeground, marginTop: 6 }]}>
                • {n}
              </Text>
            ))}
          </View>
        ) : null}

        <Pressable
          style={[styles.btnOutline, { borderColor: colors.border, marginTop: 12 }]}
          onPress={() => void runningLate()}
          disabled={busy}
        >
          <Text style={[type.body, { color: colors.foreground }]}>Running 10 min late</Text>
        </Pressable>

        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.foreground, marginTop: 16 }]}
          placeholder="Message the studio"
          placeholderTextColor={colors.mutedForeground}
          value={reply}
          onChangeText={setReply}
          multiline
        />
        <Pressable
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={() => void sendMessage()}
          disabled={busy || !reply.trim()}
        >
          <Text style={[type.body, { color: colors.primaryForeground, fontFamily: fonts.bodyMed }]}>
            Send message
          </Text>
        </Pressable>

        {message ? (
          <Text style={[type.caption, { color: colors.primary, marginTop: 8 }]}>{message}</Text>
        ) : null}

        <Pressable style={{ marginTop: 20 }} onPress={() => openGuestBookUrl(data.bookUrl)}>
          <Text style={[type.caption, { color: colors.mutedForeground, textDecorationLine: "underline" }]}>
            Book again
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  back: { padding: 16 },
  pad: { padding: 16, paddingBottom: 40 },
  card: { borderWidth: 1, borderRadius: 12, padding: 14 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    fontFamily: fonts.body,
    fontSize: 16,
    textAlignVertical: "top",
  },
  btn: { borderRadius: 10, padding: 14, alignItems: "center" },
  btnOutline: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
});
