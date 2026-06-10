import { useListStaff, useGetTenantCapabilities } from "@workspace/api-client-react";
import { operatorNeedsWorkforceNav } from "@workspace/policy";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { EmptyState } from "@/components/EmptyState";
import { OperationalScreen } from "@/components/OperationalScreen";
import { GlowPressable } from "@/components/ui/GlowPressable";
import { fonts, type } from "@/constants/typography";
import { asHref } from "@/lib/navigation";
import { useBusiness } from "@/contexts/BusinessContext";
import { useColors } from "@/hooks/useColors";
import { useMembership } from "@/hooks/useMembership";
import { useHaptics } from "@/hooks/useHaptics";
import { useOperationalChrome } from "@/lib/operational-chrome";
import { gatewayTheme } from "@/lib/gateway-theme";

export default function StaffListScreen() {
  const colors = useColors();
  const router = useRouter();
  const haptics = useHaptics();
  const { role } = useMembership();
  const { currentBusiness } = useBusiness();
  const canInvite = role === "OWNER" || role === "ADMIN";

  const bid = currentBusiness?.id ?? "";
  const chrome = useOperationalChrome(bid);
  const accent = chrome.constellation ? gatewayTheme.aurumChampagne : colors.primary;
  const tier = (currentBusiness as { tier?: string } | undefined)?.tier;
  const { data: caps } = useGetTenantCapabilities(bid, {
    query: { enabled: !!bid } as never,
  });
  const rawStaffCount = caps?.readinessFacts?.staffCount;
  const showWorkforce = operatorNeedsWorkforceNav({
    tier: tier ?? "solo",
    activeStaffCount: typeof rawStaffCount === "number" ? rawStaffCount : 1,
  });

  useEffect(() => {
    if (!bid || caps === undefined) return;
    if (!showWorkforce) router.replace("/(tabs)");
  }, [bid, caps, showWorkforce, router]);

  const { data: staff, isLoading, refetch, isRefetching } = useListStaff(
    bid,
    {},
    { query: { enabled: !!bid && showWorkforce } as never },
  );

  if (!showWorkforce) return null;

  return (
    <OperationalScreen
      title="Team"
      subtitle="Who guests can book and who appears on the floor"
      onRefresh={refetch}
      refreshing={isRefetching}
      actions={
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </Pressable>
      }
      headerExtra={
        canInvite ? (
          <GlowPressable
            onPress={() => {
              haptics.tap();
              router.push(asHref("/staff/invite"));
            }}
            glowColor={accent}
            haptic="tap"
            style={[
              styles.inviteRow,
              chrome.native
                ? { borderColor: accent + "44", backgroundColor: accent + "12" }
                : { backgroundColor: colors.primary + "18", borderColor: colors.primary + "55" },
            ]}
            contentStyle={styles.inviteInner}
          >
            <Feather name="user-plus" size={18} color={accent} />
            <Text style={[styles.inviteText, { color: accent }]}>Invite teammate</Text>
          </GlowPressable>
        ) : null
      }
      contentStyle={styles.content}
    >
      {isLoading ? (
        <EmptyState icon="users" title="Loading team…" isLoading />
      ) : !(staff?.length) ? (
        <EmptyState icon="users" title="No staff yet" subtitle="Add staff to start scheduling" />
      ) : (
        (staff ?? []).map((item, index) => {
          const initials = item.displayName
            .split(" ")
            .map((w: string) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
          return (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(Math.min(index * 40, 240)).duration(300).springify()}
            >
              <GlowPressable
                onPress={() => router.push(`/staff/${item.id}`)}
                glowColor={accent}
                haptic="tap"
                style={[
                  styles.row,
                  chrome.native
                    ? chrome.row()
                    : { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                contentStyle={styles.rowInner}
              >
                <View style={[styles.avatar, { backgroundColor: accent + "22" }]}>
                  <Text style={[styles.initials, { color: accent }]}>{initials}</Text>
                </View>
                <View style={styles.rowBody}>
                  <Text style={[styles.name, { color: colors.foreground }]}>{item.displayName}</Text>
                  {item.email ? (
                    <Text style={[styles.sub, { color: colors.mutedForeground }]}>{item.email}</Text>
                  ) : null}
                </View>
                {item.isActive === false ? (
                  <View style={[styles.inactiveBadge, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.inactiveText, { color: colors.mutedForeground }]}>Inactive</Text>
                  </View>
                ) : null}
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </GlowPressable>
            </Animated.View>
          );
        })
      )}
    </OperationalScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40, gap: 8 },
  inviteRow: { borderRadius: 14, borderWidth: 1, marginBottom: 4 },
  inviteInner: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, alignSelf: "stretch", width: "100%" },
  inviteText: { fontSize: 15, fontFamily: fonts.bodySemi },
  row: { borderRadius: 16, borderWidth: 1, marginBottom: 2, alignSelf: "stretch" },
  rowInner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, alignSelf: "stretch", width: "100%" },
  rowBody: { flex: 1, minWidth: 0 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  initials: { fontSize: 15, fontFamily: fonts.bodySemi },
  name: { fontSize: 16, fontFamily: fonts.bodyMed },
  sub: { ...type.caption, marginTop: 2 },
  inactiveBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  inactiveText: { fontSize: 11, fontFamily: fonts.bodyMed },
});
