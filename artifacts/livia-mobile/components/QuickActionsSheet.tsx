import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BottomSheet } from "@/components/BottomSheet";
import { aurora } from "@/constants/colors";
import { fonts, type } from "@/constants/typography";
import { useColors } from "@/hooks/useColors";
import { useHaptics } from "@/hooks/useHaptics";

export interface QuickAction {
  id: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  tone?: "default" | "primary" | "danger";
  onPress: () => void;
}

interface QuickActionsSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  actions: QuickAction[];
}

export function QuickActionsSheet({ visible, onClose, title, actions }: QuickActionsSheetProps) {
  const colors = useColors();
  const haptics = useHaptics();

  const fire = (a: QuickAction) => {
    haptics.tap();
    onClose();
    setTimeout(() => a.onPress(), 80);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {title ? (
        <Text style={[styles.title, { color: colors.mutedForeground }]}>{title}</Text>
      ) : null}
      <View style={styles.list}>
        {actions.map((a) => {
          const tone =
            a.tone === "danger"
              ? colors.destructive
              : a.tone === "primary"
                ? aurora.cyan
                : colors.foreground;
          return (
            <Pressable
              key={a.id}
              onPress={() => fire(a)}
              style={({ pressed }) => [
                styles.row,
                pressed && { backgroundColor: colors.muted },
              ]}
            >
              <View style={[styles.iconBox, { backgroundColor: tone + "1c" }]}>
                <Feather name={a.icon} size={17} color={tone} />
              </View>
              <Text style={[styles.label, { color: tone }]}>{a.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: { ...type.eyebrow, fontSize: 11, marginBottom: 8, paddingHorizontal: 4 },
  list: { paddingBottom: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  label: { fontFamily: fonts.bodyMed, fontSize: 16 },
});
