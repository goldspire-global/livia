import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import type { BookingGuardField } from "@workspace/policy";

type Props = {
  guards: BookingGuardField[];
  answers: Record<string, string>;
  onChange: (id: string, value: string) => void;
  colors: { foreground: string; mutedForeground: string; border: string; primary: string };
};

export function PublicBookingGuardsFields({ guards, answers, onChange, colors }: Props) {
  if (!guards.length) return null;

  return (
    <View style={{ marginTop: 12, gap: 12 }}>
      <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 14 }}>
        A few details for the team
      </Text>
      {guards.map((g) => (
        <View key={g.id} style={{ gap: 4 }}>
          <Text style={{ color: colors.foreground, fontSize: 13 }}>
            {g.label}
            {g.required ? " *" : ""}
          </Text>
          {g.type === "select" && g.options ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {g.options.map((o) => {
                const active = answers[g.id] === o.value;
                return (
                  <Pressable
                    key={o.value}
                    onPress={() => onChange(g.id, o.value)}
                    style={{
                      borderWidth: 1,
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.primary + "18" : "transparent",
                      borderRadius: 20,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                    }}
                  >
                    <Text style={{ color: colors.foreground, fontSize: 12 }}>{o.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <TextInput
              value={answers[g.id] ?? ""}
              onChangeText={(v) => onChange(g.id, v)}
              placeholder={g.label}
              placeholderTextColor={colors.mutedForeground}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 10,
                padding: 12,
                color: colors.foreground,
              }}
            />
          )}
          {g.helpText ? (
            <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>{g.helpText}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}
