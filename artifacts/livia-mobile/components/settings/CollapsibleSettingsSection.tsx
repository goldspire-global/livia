import { Feather } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import React from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SPRING_QUICK } from "@/constants/motion";
import { fonts, type } from "@/constants/typography";
import { useColors } from "@/hooks/useColors";
import { useHaptics } from "@/hooks/useHaptics";
import type { OperationalChrome } from "@/lib/operational-chrome";

type FeatherIcon = ComponentProps<typeof Feather>["name"];

type Props = {
  id: string;
  title: string;
  subtitle?: string;
  icon?: FeatherIcon;
  badge?: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  chrome?: OperationalChrome;
  style?: ViewStyle;
  testID?: string;
};

export function CollapsibleSettingsSection({
  title,
  subtitle,
  icon = "chevron-down",
  badge,
  expanded,
  onToggle,
  children,
  chrome,
  style,
  testID,
}: Props) {
  const colors = useColors();
  const haptics = useHaptics();
  const rotation = useSharedValue(expanded ? 1 : 0);

  React.useEffect(() => {
    rotation.value = withSpring(expanded ? 1 : 0, SPRING_QUICK);
  }, [expanded, rotation]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 90}deg` }],
  }));

  return (
    <View
      testID={testID}
      style={[
        styles.shell,
        chrome?.native
          ? chrome.panel({ padding: 0, overflow: "hidden" })
          : { backgroundColor: colors.card, borderColor: colors.border },
        style,
      ]}
    >
      <Pressable
        onPress={() => {
          haptics.selection();
          onToggle();
        }}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        style={({ pressed }) => [styles.header, pressed && { opacity: 0.88 }]}
      >
        <View style={[styles.iconWrap, { backgroundColor: colors.primary + "14" }]}>
          <Feather name={icon} size={16} color={colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]} numberOfLines={expanded ? 3 : 2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {badge ? (
          <View style={[styles.badge, { backgroundColor: colors.primary + "18" }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>{badge}</Text>
          </View>
        ) : null}
        <Animated.View style={chevronStyle}>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </Animated.View>
      </Pressable>
      {expanded ? (
        <Animated.View
          entering={FadeInDown.duration(220).springify().damping(20)}
          exiting={FadeOutUp.duration(160)}
          style={[styles.body, { borderTopColor: colors.border }]}
        >
          {children}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1, minWidth: 0, gap: 2 },
  title: { fontFamily: fonts.bodySemi, fontSize: 15 },
  subtitle: { ...type.caption, fontSize: 12, lineHeight: 16 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeText: { fontFamily: fonts.bodyMed, fontSize: 10 },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
