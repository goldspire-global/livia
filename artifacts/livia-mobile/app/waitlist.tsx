import { customFetch } from "@workspace/api-client-react";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useBusiness } from "@/contexts/BusinessContext";
import { useColors } from "@/hooks/useColors";
import { OperationalScreen } from "@/components/OperationalScreen";

type WaitlistRow = {
  id: string;
  status: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
};

export default function WaitlistScreen() {
  const colors = useColors();
  const router = useRouter();
  const { currentBusiness } = useBusiness();
  const bid = currentBusiness?.id ?? "";
  const [rows, setRows] = useState<WaitlistRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bid) return;
    void customFetch<{ data: WaitlistRow[] }>(`/api/businesses/${bid}/waitlist`)
      .then((res) => setRows(res.data ?? []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [bid]);

  return (
    <OperationalScreen
      title="Waitlist"
      subtitle="Guests waiting for a cancellation"
      actions={
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </Pressable>
      }
    >
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : rows.length === 0 ? (
        <Text style={{ color: colors.mutedForeground }}>No active waitlist entries.</Text>
      ) : (
        rows.map((r) => (
          <View
            key={r.id}
            style={[styles.row, { borderColor: colors.border, backgroundColor: colors.card }]}
          >
            <Text style={{ color: colors.foreground, fontWeight: "600" }}>
              {r.phone ?? r.email ?? "Guest"}
            </Text>
            {r.notes ? (
              <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>{r.notes}</Text>
            ) : null}
            <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>{r.status}</Text>
          </View>
        ))
      )}
    </OperationalScreen>
  );
}

const styles = StyleSheet.create({
  row: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 8, gap: 4 },
});
