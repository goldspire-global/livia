import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { fonts, type } from "@/constants/typography";
import { useColors } from "@/hooks/useColors";
import { getApiBaseUrl } from "@/lib/api-base";

type FitnessClass = {
  id: string;
  title: string;
  startsAt: string;
  spotsLeft: number;
  waitlistOpen: boolean;
};

export function PublicFitnessClassList({ slug }: { slug: string }) {
  const colors = useColors();
  const api = getApiBaseUrl();
  const [classes, setClasses] = useState<FitnessClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void fetch(`${api}/api/public/b/${encodeURIComponent(slug)}/classes`)
      .then((r) => (r.ok ? r.json() : { classes: [] }))
      .then((j: { classes?: FitnessClass[] }) => setClasses(j.classes ?? []))
      .finally(() => setLoading(false));
  }, [api, slug]);

  async function enroll(sessionId: string, waitlist: boolean) {
    if (!firstName.trim() || phone.trim().length < 8) {
      setMsg("Add your name and mobile first.");
      return;
    }
    setBusyId(sessionId);
    setMsg(null);
    try {
      const r = await fetch(
        `${api}/api/public/b/${encodeURIComponent(slug)}/classes/${encodeURIComponent(sessionId)}/enroll`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerFirstName: firstName.trim(),
            customerPhone: phone.trim(),
            saveToMyLivia: true,
          }),
        },
      );
      if (!r.ok) throw new Error("Could not enroll");
      setMsg(waitlist ? "On the waitlist — we will text you." : "You are in — see you at class!");
    } catch {
      setMsg("Could not enroll — try again.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <ActivityIndicator style={{ marginVertical: 16 }} color={colors.primary} />;
  if (classes.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={[type.label, { color: colors.mutedForeground, marginBottom: 8 }]}>Group classes</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
        placeholder="First name"
        placeholderTextColor={colors.mutedForeground}
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
        placeholder="Mobile"
        placeholderTextColor={colors.mutedForeground}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      {msg ? <Text style={[type.caption, { color: colors.primary, marginBottom: 8 }]}>{msg}</Text> : null}
      {classes.map((c) => {
        const full = c.spotsLeft === 0 && !c.waitlistOpen;
        const when = new Date(c.startsAt).toLocaleString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
        return (
          <View key={c.id} style={[styles.card, { borderColor: colors.border }]}>
            <Text style={[type.body, { fontFamily: fonts.bodyMed, color: colors.foreground }]}>{c.title}</Text>
            <Text style={[type.caption, { color: colors.mutedForeground }]}>{when}</Text>
            <Pressable
              style={[styles.btn, { backgroundColor: full ? colors.muted : colors.primary }]}
              disabled={full || busyId === c.id}
              onPress={() => void enroll(c.id, c.waitlistOpen)}
            >
              <Text style={[type.caption, { color: colors.primaryForeground }]}>
                {c.waitlistOpen ? "Join waitlist" : full ? "Full" : "Enroll"}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 20 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8 },
  btn: { borderRadius: 8, padding: 10, alignItems: "center", marginTop: 8 },
});
