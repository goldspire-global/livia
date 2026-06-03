import { View, StyleSheet } from "react-native";
import { LiviaLogoLink } from "@/components/brand/LiviaLogoLink";
import { NotificationBell } from "@/components/NotificationBell";
import { useColors } from "@/hooks/useColors";

/** Consistent wordmark + notification bell for tab screens. */
export function ScreenTopBar() {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <LiviaLogoLink size="sm" color={colors.foreground} />
      <NotificationBell />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
});
