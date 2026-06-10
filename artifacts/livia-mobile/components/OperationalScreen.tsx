import React, { useCallback, useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuroraHalo } from "@/components/brand/AuroraHalo";
import { WellnessShellAtmosphere } from "@/components/wellness/WellnessShellAtmosphere";
import { useBusiness } from "@/contexts/BusinessContext";
import { useMobileSkin } from "@/contexts/PresentationThemeContext";
import { PersonaRitualHeader } from "@/components/ritual/PersonaRitualHeader";
import { PersonaScreenHeader } from "@/components/PersonaScreenHeader";
import { ScreenTopBar } from "@/components/ScreenTopBar";
import { useColors } from "@/hooks/useColors";
import { TENANT_SHELL_LAYOUT, tenantScreenBackground } from "@/lib/tenant-shell-layout";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Slot above scroll content (e.g. persona banner) */
  headerExtra?: React.ReactNode;
  /** Fingertip actions row — keep 1–3 items */
  actions?: React.ReactNode;
  /** @deprecated Pass only onRefresh — pull state is local so background refetch does not yank the page. */
  refreshing?: boolean;
  onRefresh?: () => void | Promise<unknown>;
  contentStyle?: ViewStyle;
  showHalo?: boolean;
  /** When false, children manage their own scroll (e.g. FlatList). */
  scroll?: boolean;
  /** Use Liv ritual header (web PersonaRitualHeader parity) instead of static title */
  ritualPage?: boolean;
};

/**
 * Mobile layout contract: safe area + optional aurora + ritual header + scroll body.
 * Matches dashboard web OperationalPageShell intent.
 */
export function OperationalScreen({
  eyebrow,
  title,
  subtitle,
  children,
  headerExtra,
  actions,
  onRefresh,
  contentStyle,
  showHalo = true,
  scroll = true,
  ritualPage = false,
}: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const skin = useMobileSkin();
  const wellnessPreset =
    skin.family === "wellness-native" ? skin.effectiveCssPreset : null;
  const shellAtmosphere = skin.transparentScreens;
  const screenBg = tenantScreenBackground(skin.transparentScreens, colors.background);
  const contentPad = skin.transparentScreens ? TENANT_SHELL_LAYOUT.contentPadX : 20;
  const contentGap = skin.transparentScreens ? TENANT_SHELL_LAYOUT.contentGap : 14;
  const [pullRefreshing, setPullRefreshing] = useState(false);
  const handlePullRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setPullRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setPullRefreshing(false);
    }
  }, [onRefresh]);

  const header = (
    <>
      <ScreenTopBar />
      <Animated.View entering={FadeInDown.duration(380).springify().damping(18)}>
        {ritualPage ? (
          <PersonaRitualHeader variant="page" title={title} subtitle={subtitle} showActions={false} />
        ) : (
          <PersonaScreenHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
        )}
      </Animated.View>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
      {headerExtra}
    </>
  );

  if (!scroll) {
    return (
      <View style={[styles.root, { backgroundColor: screenBg }]}>
        {!shellAtmosphere && wellnessPreset ? (
          <WellnessShellAtmosphere cssPreset={wellnessPreset} />
        ) : !shellAtmosphere && showHalo ? (
          <AuroraHalo tone="primary" size={380} style={styles.halo} intensity={0.9} />
        ) : null}
        <View style={[styles.staticHeader, { paddingTop: topPad + 8, paddingHorizontal: contentPad }]}>
          {header}
        </View>
        <View style={styles.staticBody}>{children}</View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: screenBg }]}>
      {!shellAtmosphere && wellnessPreset ? (
        <WellnessShellAtmosphere cssPreset={wellnessPreset} />
      ) : !shellAtmosphere && showHalo ? (
        <AuroraHalo tone="primary" size={380} style={styles.halo} intensity={0.9} />
      ) : null}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: topPad + 8,
            paddingBottom: insets.bottom + TENANT_SHELL_LAYOUT.tabBarClearance,
            paddingHorizontal: contentPad,
            gap: contentGap,
          },
          contentStyle,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={pullRefreshing}
              onRefresh={handlePullRefresh}
              tintColor={colors.primary}
            />
          ) : undefined
        }
      >
        {header}
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { backgroundColor: "transparent" },
  halo: { position: "absolute", top: -120, left: -80, opacity: 0.85 },
  content: {},
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  staticHeader: { gap: 14, paddingBottom: 8 },
  staticBody: { flex: 1 },
});
