import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { customFetch } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

type ImportResult = {
  imported: number;
  kindLabel: string;
  onboarding?: { actsCompleted?: string[] };
};

type Props = {
  businessId: string;
  onImported?: () => void;
};

export function UniversalImportPanel({ businessId, onImported }: Props) {
  const colors = useColors();
  const [csv, setCsv] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const runImport = useCallback(async () => {
    if (!csv.trim()) return;
    setBusy(true);
    try {
      const res = await customFetch<ImportResult>(`/api/businesses/${businessId}/import/csv`, {
        method: "POST",
        body: JSON.stringify({ csv, applyOnboarding: true }),
      });
      setResult(res);
      onImported?.();
    } finally {
      setBusy(false);
    }
  }, [businessId, csv, onImported]);

  return (
    <View style={styles.wrap} testID="mobile-universal-import">
      <Text style={[styles.lead, { color: colors.mutedForeground }]}>
        Paste a CSV export from your previous booking tool — clients, menu, or upcoming appointments.
      </Text>
      <TextInput
        value={csv}
        onChangeText={setCsv}
        multiline
        placeholder="Paste CSV here…"
        placeholderTextColor={colors.mutedForeground}
        style={[
          styles.input,
          { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card },
        ]}
      />
      <Pressable
        style={[styles.btn, { backgroundColor: colors.primary, opacity: busy ? 0.6 : 1 }]}
        disabled={busy || !csv.trim()}
        onPress={() => void runImport()}
      >
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Import CSV</Text>
        )}
      </Pressable>
      {result ? (
        <Text style={{ color: colors.foreground, fontSize: 13, marginTop: 8 }}>
          Imported {result.imported} {result.kindLabel.toLowerCase()}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  lead: { fontSize: 14, lineHeight: 20 },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    fontFamily: "monospace",
    textAlignVertical: "top",
  },
  btn: { borderRadius: 10, padding: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600" },
});
