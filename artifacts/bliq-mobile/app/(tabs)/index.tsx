import { useGetDashboardSummary } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BookingCard } from "@/components/BookingCard";
import { EmptyState } from "@/components/EmptyState";
import { StatsCard } from "@/components/StatsCard";
import { useBusiness } from "@/contexts/BusinessContext";
import { useColors } from "@/hooks/useColors";

export default function DashboardScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentBusiness, isLoading: bizLoading } = useBusiness();

  useEffect(() => {
    if (!bizLoading && !currentBusiness) {
      router.replace("/onboarding");
    }
  }, [currentBusiness, bizLoading]);

  const {
    data: summary,
    isLoading,
    refetch,
    isRefetching,
  } = useGetDashboardSummary(currentBusiness?.id ?? "", {
    query: { enabled: !!currentBusiness?.id } as any,
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!currentBusiness && !bizLoading) return null;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16 }]}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.headRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <Text style={[styles.bizName, { color: colors.foreground }]} numberOfLines={1}>
            {currentBusiness?.name ?? "Loading…"}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.newBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/booking/new")}
          activeOpacity={0.85}
          testID="new-booking-button"
        >
          <Text style={styles.newBtnText}>+ Book</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <StatsCard
          label="Today"
          value={isLoading ? "—" : (summary?.todayBookings ?? 0)}
          color={colors.primary}
        />
        <StatsCard
          label="Pending"
          value={isLoading ? "—" : (summary?.pendingCount ?? 0)}
          color={colors.warning}
        />
        <StatsCard
          label="Done"
          value={isLoading ? "—" : (summary?.completedTodayCount ?? 0)}
          color={colors.success}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Upcoming bookings
        </Text>
        {isLoading ? (
          <EmptyState icon="calendar" title="Loading…" isLoading />
        ) : !summary?.upcomingBookings?.length ? (
          <EmptyState
            icon="calendar"
            title="No upcoming bookings"
            subtitle="All clear for now"
          />
        ) : (
          summary.upcomingBookings.slice(0, 10).map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              showDate
              onPress={() => router.push(`/booking/${b.id}`)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 120, gap: 20 },
  headRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  bizName: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  newBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  newBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  statsRow: { flexDirection: "row", gap: 10 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
});
