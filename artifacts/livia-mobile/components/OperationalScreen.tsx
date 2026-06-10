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
import { useMobileSkin } from "@/contexts/PresentationThemeContext";
import { PersonaRitualHeader } from "@/components/ritual/PersonaRitualHeader";
import { PersonaScreenHeader } from "@/components/PersonaScreenHeader";
import { ScreenTopBar } from "@/components/ScreenTopBar";
import { useColors } from "@/hooks/useColors";
import { TENANT_SHELL_LAYOUT, tenantScreenBackground } from "@/lib/tenant-shell-layout";
import { FADE_THROUGH_MS } from "@/constants/motion";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerExtra?: React.ReactNode;
  actions?: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void | Promise<unknown>;
  contentStyle?: ViewStyle;
  showHalo?: boolean;
  scroll?: boolean;
  ritualPage?: boolean;
};

/**
 * Mobile layout contract: ritual header + scroll body over root TenantPresentationShell.
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
  const usesRootShell = skin.transparentScreens && skin.atmosphere !== "none";
  const screenBg = usesRootShell
    ? "transparent"
    : tenantScreenBackground(skin.transparentScreens, colors.background);
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

  const legacyAtmosphere =
    !usesRootShell && !skin.transparentScreens && wellnessPreset ? (
      <WellnessShellAtmosphere cssPreset={wellnessPreset} />
    ) : !usesRootShell && !skin.transparentScreens && showHalo ? (
      <AuroraHalo tone="primary" size={380} style={styles.halo} intensity={0.9} />
    ) : null;

  const header = (
    <>
      <ScreenTopBar />
      <Animated.View entering={FadeInDown.duration(FADE_THROUGH_MS + 80).springify().damping(18)}>
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
        {legacyAtmosphere}
        <View style={[styles.staticHeader, { paddingTop: topPad + 8, paddingHorizontal: contentPad }]}>
          {header}
        </View>
        <View style={styles.staticBody}>{children}</View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: screenBg }]}>
      {legacyAtmosphere}
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
