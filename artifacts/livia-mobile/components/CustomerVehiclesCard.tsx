import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { customFetch } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { fonts } from "@/constants/typography";

type Vehicle = {
  id: string;
  make: string | null;
  model: string;
  registration: string | null;
};

export function CustomerVehiclesCard({
  businessId,
  customerId,
}: {
  businessId: string;
  customerId: string;
}) {
  const colors = useColors();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [registration, setRegistration] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void customFetch<{ vehicles: Vehicle[] }>(
      `/api/businesses/${businessId}/customers/${customerId}/vehicles`,
    )
      .then((r) => setVehicles(r.vehicles ?? []))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, [businessId, customerId]);

  async function addVehicle() {
    if (!model.trim()) return;
    setSaving(true);
    try {
      const row = await customFetch<Vehicle>(
        `/api/businesses/${businessId}/customers/${customerId}/vehicles`,
        {
          method: "POST",
          body: JSON.stringify({
            make: make.trim() || undefined,
            model: model.trim(),
            registration: registration.trim() || undefined,
          }),
        },
      );
      setVehicles((v) => [...v, row]);
      setMake("");
      setModel("");
      setRegistration("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.wrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>Vehicles</Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : vehicles.length === 0 ? (
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>No vehicles on file yet.</Text>
      ) : (
        vehicles.map((v) => (
          <Text key={v.id} style={[styles.row, { color: colors.foreground }]}>
            {[v.make, v.model].filter(Boolean).join(" ")}
            {v.registration ? ` · ${v.registration}` : ""}
          </Text>
        ))
      )}
      <TextInput
        value={make}
        onChangeText={setMake}
        placeholder="Make"
        placeholderTextColor={colors.mutedForeground}
        style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
      />
      <TextInput
        value={model}
        onChangeText={setModel}
        placeholder="Model"
        placeholderTextColor={colors.mutedForeground}
        style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
      />
      <TextInput
        value={registration}
        onChangeText={setRegistration}
        placeholder="Registration"
        placeholderTextColor={colors.mutedForeground}
        autoCapitalize="characters"
        style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
      />
      <Pressable
        onPress={() => void addVehicle()}
        disabled={saving || !model.trim()}
        style={[styles.btn, { backgroundColor: colors.primary, opacity: saving || !model.trim() ? 0.5 : 1 }]}
      >
        <Text style={[styles.btnText, { color: colors.primaryForeground }]}>
          {saving ? "Adding…" : "Add vehicle"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 12 },
  title: { fontFamily: fonts.bodyMed, fontSize: 15, marginBottom: 8 },
  meta: { fontSize: 12, marginBottom: 8 },
  row: { fontSize: 14, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    marginTop: 8,
  },
  btn: { marginTop: 10, borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  btnText: { fontFamily: fonts.bodyMed, fontSize: 14 },
});
