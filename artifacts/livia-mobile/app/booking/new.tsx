import {
  useCreateBooking,
  useListCustomers,
  useListFrequentCustomers,
  useListServices,
  useListStaff,
  useGetAvailableSlots,
  listCustomers,
  type Customer,
} from "@workspace/api-client-react";
import { bookingExperienceCopy } from "@workspace/policy";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OperationalScreen } from "@/components/OperationalScreen";
import { ConstellationGlassCard } from "@/components/constellation/ConstellationGlassCard";
import { GlowPressable } from "@/components/ui/GlowPressable";
import { fonts, type } from "@/constants/typography";
import { useBusiness } from "@/contexts/BusinessContext";
import { useColors } from "@/hooks/useColors";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useOperationalChrome, type OperationalChrome } from "@/lib/operational-chrome";
import { staffListParams } from "@/lib/staff-params";
import { gatewayTheme } from "@/lib/gateway-theme";

const STEPS = ["Client", "Service", "Team", "Time", "Confirm"] as const;
type Step = (typeof STEPS)[number];
const PAGE_SIZE = 30;
const FREQUENT_CLIENT_CAP = 10;

const STEP_HINTS: Record<Step, string> = {
  Client: "Who is this for?",
  Service: "What are they booking?",
  Team: "Who's on the team?",
  Time: "When works?",
  Confirm: "Review before you save",
};

function formatSlotTime(iso: string, timeZone: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  });
}

function formatSlotDateTime(iso: string, timeZone: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  });
}

function StepPanel({
  chrome,
  children,
}: {
  chrome: OperationalChrome;
  children: React.ReactNode;
}) {
  if (chrome.constellation) {
    return <ConstellationGlassCard style={styles.stepCard}>{children}</ConstellationGlassCard>;
  }
  return <View style={[chrome.panel({ padding: 14, gap: 10 }), styles.stepCard]}>{children}</View>;
}

function SelectionChip({
  label,
  selected,
  onPress,
  chrome,
  accent,
  colors,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  chrome: OperationalChrome;
  accent: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <GlowPressable
      onPress={onPress}
      glowColor={accent}
      haptic="selection"
      style={
        chrome.native
          ? chrome.chip(selected)
          : {
              borderWidth: 1,
              borderColor: selected ? accent : colors.border,
              backgroundColor: selected ? accent + "22" : colors.input + "88",
              borderRadius: 999,
            }
      }
      contentStyle={styles.chipInner}
    >
      <Text
        style={
          chrome.native
            ? chrome.chipText(selected)
            : {
                color: selected ? accent : colors.foreground,
                fontSize: 13,
                fontFamily: fonts.bodySemi,
              }
        }
      >
        {label}
      </Text>
    </GlowPressable>
  );
}

export default function NewBookingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    customerId?: string;
    serviceId?: string;
    staffId?: string;
    noteSeed?: string;
  }>();
  const { currentBusiness } = useBusiness();
  const bid = currentBusiness?.id ?? "";
  const chrome = useOperationalChrome(bid);
  const accent = chrome.constellation ? gatewayTheme.aurumChampagne : colors.primary;
  const exp = bookingExperienceCopy(
    (currentBusiness as { vertical?: string } | null)?.vertical,
    (currentBusiness as { category?: string | null } | null)?.category,
  );
  const tz =
    currentBusiness?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [step, setStep] = useState<Step>("Client");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [customerOffset, setCustomerOffset] = useState(0);
  const [customerRows, setCustomerRows] = useState<Customer[]>([]);

  const debouncedSearch = useDebouncedValue(customerSearch, 300);

  useEffect(() => {
    if (params.customerId) setSelectedCustomerIds([params.customerId]);
    if (params.serviceId) setSelectedServiceIds([params.serviceId]);
    if (params.staffId) setSelectedStaffId(params.staffId || null);
    if (params.noteSeed) setNotes(params.noteSeed);
  }, [params.customerId, params.serviceId, params.staffId, params.noteSeed]);

  const { data: frequentPage } = useListFrequentCustomers(
    bid,
    { limit: FREQUENT_CLIENT_CAP },
    { query: { enabled: !!bid && step === "Client" } as never },
  );
  const frequentClients = frequentPage?.data ?? [];

  const primaryServiceId = selectedServiceIds[0] ?? null;

  const toggleCustomer = (id: string) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      return next;
    });
    setSelectedSlot("");
  };

  useEffect(() => {
    setCustomerOffset(0);
    setCustomerRows([]);
  }, [debouncedSearch, bid]);

  const { data: customerPage, isLoading: customersLoading } = useListCustomers(
    bid,
    { search: debouncedSearch || undefined, limit: PAGE_SIZE, offset: customerOffset },
    { query: { enabled: !!bid && step === "Client" } as never },
  );

  useEffect(() => {
    const rows = customerPage?.data ?? [];
    setCustomerRows((prev) => (customerOffset === 0 ? rows : [...prev, ...rows]));
  }, [customerPage, customerOffset]);

  const { data: services } = useListServices(bid, { isActive: true }, { query: { enabled: !!bid } as never });
  const { data: staffList, isLoading: staffLoading } = useListStaff(
    bid,
    staffListParams({ isActive: true, serviceId: primaryServiceId ?? undefined }),
    { query: { enabled: !!bid && !!primaryServiceId } as never },
  );

  const { data: slotsData, isLoading: slotsLoading } = useGetAvailableSlots(
    bid,
    {
      serviceId: primaryServiceId ?? "",
      date,
      staffId: selectedStaffId ?? undefined,
    },
    {
      query: {
        enabled: !!bid && !!primaryServiceId && !!date && step === "Time",
      } as never,
    },
  );

  const { mutateAsync: createBooking, isPending } = useCreateBooking();

  const availableSlots = useMemo(
    () =>
      ((slotsData as { slots?: { startAt: string; available: boolean }[] })?.slots ?? []).filter(
        (s) => s.available,
      ),
    [slotsData],
  );

  const stepIndex = STEPS.indexOf(step);

  useEffect(() => {
    if (!primaryServiceId || !selectedStaffId) return;
    const ok = (staffList ?? []).some((s) => s.id === selectedStaffId);
    if (!ok) setSelectedStaffId(null);
  }, [primaryServiceId, staffList, selectedStaffId]);

  const goNext = () => {
    setError("");
    if (step === "Client" && selectedCustomerIds.length === 0) {
      setError(`Choose at least one ${exp.clientFieldLabel.toLowerCase()}.`);
      return;
    }
    if (step === "Service" && selectedServiceIds.length === 0) {
      setError(`Choose at least one ${exp.serviceFieldLabel.toLowerCase()}.`);
      return;
    }
    if (step === "Time" && !selectedSlot) {
      setError("Pick an available time.");
      return;
    }
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next);
  };

  const goBack = () => {
    setError("");
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev);
    else router.back();
  };

  const handleCreate = async () => {
    if (!selectedCustomerIds.length || !selectedServiceIds.length || !selectedSlot) {
      setError("Missing required fields.");
      return;
    }
    setError("");
    try {
      let cursor = new Date(selectedSlot);
      for (const serviceId of selectedServiceIds) {
        const svc = (services ?? []).find((s) => s.id === serviceId);
        const blockMs =
          ((svc?.durationMinutes ?? 60) + ((svc as { bufferAfterMinutes?: number }).bufferAfterMinutes ?? 0)) *
          60_000;
        for (const customerId of selectedCustomerIds) {
          await createBooking({
            businessId: bid,
            data: {
              staffId: selectedStaffId ?? undefined,
              serviceId,
              customerId,
              startAt: cursor.toISOString(),
              notes: notes || undefined,
            },
          });
        }
        cursor = new Date(cursor.getTime() + blockMs);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? "Could not create booking.");
    }
  };

  const staffHint =
    primaryServiceId && !staffLoading && (staffList ?? []).length === 0
      ? "No one is assigned to this service yet. Assign team members under Staff → Services."
      : null;

  const allKnownClients = useMemo(() => {
    const map = new Map<string, Customer>();
    for (const c of frequentClients) map.set(c.id, c);
    for (const c of customerRows) map.set(c.id, c);
    return map;
  }, [frequentClients, customerRows]);

  const selectedClients = selectedCustomerIds
    .map((id) => allKnownClients.get(id))
    .filter((c): c is Customer => !!c);
  const selectedServices = selectedServiceIds
    .map((id) => (services ?? []).find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => !!s);
  const selectedStaff = (staffList ?? []).find((s) => s.id === selectedStaffId);

  const inputStyle = [
    styles.input,
    chrome.native
      ? {
          backgroundColor: "rgba(255,255,255,0.06)",
          borderColor: chrome.constellation ? "rgba(217,195,154,0.2)" : colors.border,
          color: colors.foreground,
        }
      : { backgroundColor: colors.input + "88", color: colors.foreground, borderColor: colors.border },
  ];

  return (
    <OperationalScreen
      scroll={false}
      showHalo={false}
      title={exp.listGuidedBookingTitle}
      subtitle={exp.listGuidedBookingDescription}
      actions={
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
          <Feather name="x" size={20} color={colors.foreground} />
        </Pressable>
      }
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={8}
      >
        <View style={styles.progressRow}>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.progressItem}>
              <View
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: i <= stepIndex ? accent : colors.border + "88",
                    opacity: i === stepIndex ? 1 : i < stepIndex ? 0.9 : 0.45,
                  },
                ]}
              />
              <Text
                style={[
                  styles.progressLabel,
                  { color: i === stepIndex ? colors.foreground : colors.mutedForeground },
                ]}
                numberOfLines={1}
              >
                {s}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.stepHint, { color: colors.mutedForeground }]}>
          Step {stepIndex + 1} of {STEPS.length} · {STEP_HINTS[step]}
        </Text>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === "Client" && (
            <StepPanel chrome={chrome}>
              <Text style={[styles.panelTitle, { color: colors.foreground }]}>
                {exp.clientFieldLabel}
              </Text>
              <Text style={[styles.panelSub, { color: colors.mutedForeground }]}>
                Tap to select one or more · couples and parties supported
              </Text>
              {!debouncedSearch && frequentClients.length > 0 ? (
                <>
                  <Text style={[styles.sectionEyebrow, { color: colors.mutedForeground }]}>
                    Frequent ({Math.min(frequentClients.length, FREQUENT_CLIENT_CAP)})
                  </Text>
                  <View style={styles.chips}>
                    {frequentClients.slice(0, FREQUENT_CLIENT_CAP).map((c) => {
                      const label = c.displayName ?? c.firstName ?? "Guest";
                      return (
                        <SelectionChip
                          key={`freq-${c.id}`}
                          label={label}
                          selected={selectedCustomerIds.includes(c.id)}
                          onPress={() => toggleCustomer(c.id)}
                          chrome={chrome}
                          accent={accent}
                          colors={colors}
                        />
                      );
                    })}
                  </View>
                </>
              ) : null}
              <Text style={[styles.sectionEyebrow, { color: colors.mutedForeground }]}>
                {debouncedSearch ? "Search results" : "Or search"}
              </Text>
              <TextInput
                style={inputStyle}
                placeholder="Name, email, phone…"
                placeholderTextColor={colors.mutedForeground}
                value={customerSearch}
                onChangeText={setCustomerSearch}
              />
              {customersLoading && customerRows.length === 0 ? (
                <ActivityIndicator color={accent} style={{ marginTop: 12 }} />
              ) : customerRows.length === 0 ? (
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                  {customerSearch ? "No matches." : "No clients yet — add one first."}
                </Text>
              ) : (
                <View style={styles.chips}>
                  {customerRows.map((c) => {
                    const label = c.displayName ?? c.firstName ?? "Guest";
                    return (
                      <SelectionChip
                        key={c.id}
                        label={label}
                        selected={selectedCustomerIds.includes(c.id)}
                        onPress={() => toggleCustomer(c.id)}
                        chrome={chrome}
                        accent={accent}
                        colors={colors}
                      />
                    );
                  })}
                </View>
              )}
              {(customerPage?.total ?? 0) > customerRows.length ? (
                <Pressable
                  onPress={async () => {
                    const next = customerOffset + PAGE_SIZE;
                    const more = await listCustomers(bid, {
                      search: debouncedSearch || undefined,
                      limit: PAGE_SIZE,
                      offset: next,
                    });
                    setCustomerOffset(next);
                    const rows = more.data ?? [];
                    setCustomerRows((prev) => {
                      const ids = new Set(prev.map((x) => x.id));
                      return [...prev, ...rows.filter((x) => !ids.has(x.id))];
                    });
                  }}
                >
                  <Text style={[styles.link, { color: accent }]}>Load more</Text>
                </Pressable>
              ) : null}
            </StepPanel>
          )}

          {step === "Service" && (
            <StepPanel chrome={chrome}>
              <Text style={[styles.panelTitle, { color: colors.foreground }]}>
                {exp.serviceFieldLabel}
              </Text>
              <Text style={[styles.panelSub, { color: colors.mutedForeground }]}>
                Select one or more — multiple run back-to-back from your chosen time
              </Text>
              <View style={styles.chips}>
                {(services ?? [])
                  .filter((s) => s.isActive !== false)
                  .map((s) => (
                    <SelectionChip
                      key={s.id}
                      label={s.name}
                      selected={selectedServiceIds.includes(s.id)}
                      onPress={() => {
                        toggleService(s.id);
                        setSelectedStaffId(null);
                      }}
                      chrome={chrome}
                      accent={accent}
                      colors={colors}
                    />
                  ))}
              </View>
            </StepPanel>
          )}

          {step === "Team" && (
            <StepPanel chrome={chrome}>
              <Text style={[styles.panelTitle, { color: colors.foreground }]}>Team</Text>
              {staffHint ? (
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>{staffHint}</Text>
              ) : null}
              <View style={styles.chips}>
                <SelectionChip
                  label="First available"
                  selected={!selectedStaffId}
                  onPress={() => {
                    setSelectedStaffId(null);
                    setSelectedSlot("");
                  }}
                  chrome={chrome}
                  accent={accent}
                  colors={colors}
                />
                {(staffList ?? []).map((s) => (
                  <SelectionChip
                    key={s.id}
                    label={s.displayName}
                    selected={selectedStaffId === s.id}
                    onPress={() => {
                      setSelectedStaffId(s.id);
                      setSelectedSlot("");
                    }}
                    chrome={chrome}
                    accent={accent}
                    colors={colors}
                  />
                ))}
              </View>
            </StepPanel>
          )}

          {step === "Time" && (
            <StepPanel chrome={chrome}>
              <Text style={[styles.panelTitle, { color: colors.foreground }]}>Date & time</Text>
              <Text style={[styles.panelSub, { color: colors.mutedForeground }]}>
                Timezone: {tz}
                {selectedServiceIds.length > 1
                  ? ` · first ${exp.serviceFieldLabel.toLowerCase()} at slot, others follow`
                  : ""}
              </Text>
              <TextInput
                style={inputStyle}
                value={date}
                onChangeText={(v) => {
                  setDate(v);
                  setSelectedSlot("");
                }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.mutedForeground}
              />
              {slotsLoading ? (
                <ActivityIndicator color={accent} />
              ) : availableSlots.length === 0 ? (
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                  No slots this day — try another date or team member.
                </Text>
              ) : (
                <View style={styles.slotGrid}>
                  {availableSlots.map((slot) => (
                    <SelectionChip
                      key={slot.startAt}
                      label={formatSlotTime(slot.startAt, tz)}
                      selected={selectedSlot === slot.startAt}
                      onPress={() => setSelectedSlot(slot.startAt)}
                      chrome={chrome}
                      accent={accent}
                      colors={colors}
                    />
                  ))}
                </View>
              )}
            </StepPanel>
          )}

          {step === "Confirm" && (
            <StepPanel chrome={chrome}>
              <Text style={[styles.panelTitle, { color: colors.foreground }]}>Review</Text>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.mutedForeground }]}>
                  {exp.clientFieldLabel}
                </Text>
                <Text style={[styles.reviewValue, { color: colors.foreground }]}>
                  {selectedClients.length
                    ? selectedClients
                        .map((c) => c.displayName ?? c.firstName ?? "Guest")
                        .join(", ")
                    : "—"}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.mutedForeground }]}>
                  {exp.serviceFieldLabel}
                </Text>
                <Text style={[styles.reviewValue, { color: colors.foreground }]}>
                  {selectedServices.length ? selectedServices.map((s) => s.name).join(" → ") : "—"}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.mutedForeground }]}>Team</Text>
                <Text style={[styles.reviewValue, { color: colors.foreground }]}>
                  {selectedStaff?.displayName ?? "First available"}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.mutedForeground }]}>Time</Text>
                <Text style={[styles.reviewValue, { color: colors.foreground }]}>
                  {selectedSlot ? formatSlotDateTime(selectedSlot, tz) : "—"}
                </Text>
              </View>
              <TextInput
                style={[...inputStyle, styles.textarea]}
                placeholder="Notes (optional)"
                placeholderTextColor={colors.mutedForeground}
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </StepPanel>
          )}

          {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
        </ScrollView>

        <View
          style={[
            styles.footer,
            chrome.native
              ? {
                  borderTopColor: chrome.constellation
                    ? "rgba(217,195,154,0.18)"
                    : colors.border,
                  backgroundColor: chrome.constellation ? "rgba(28,30,40,0.92)" : colors.card + "ee",
                }
              : { borderTopColor: colors.border, backgroundColor: colors.background },
            { paddingBottom: insets.bottom + 12 },
          ]}
        >
          <Pressable onPress={goBack} style={styles.footerBack} accessibilityRole="button">
            <Feather name="arrow-left" size={16} color={colors.foreground} />
            <Text style={[styles.footerBackText, { color: colors.foreground }]}>
              {stepIndex === 0 ? "Cancel" : "Back"}
            </Text>
          </Pressable>
          {step !== "Confirm" ? (
            <GlowPressable
              onPress={goNext}
              glowColor={accent}
              haptic="impact"
              style={[
                styles.cta,
                chrome.native ? chrome.primaryButton() : { backgroundColor: colors.primary },
              ]}
              contentStyle={styles.ctaInner}
            >
              <Text
                style={[
                  styles.ctaText,
                  { color: chrome.constellation ? gatewayTheme.platformInk : colors.primaryForeground },
                ]}
              >
                Continue
              </Text>
              <Feather
                name="arrow-right"
                size={16}
                color={chrome.constellation ? gatewayTheme.platformInk : colors.primaryForeground}
              />
            </GlowPressable>
          ) : (
            <GlowPressable
              onPress={() => void handleCreate()}
              disabled={isPending}
              glowColor={accent}
              haptic="impact"
              style={[
                styles.cta,
                chrome.native ? chrome.primaryButton() : { backgroundColor: colors.primary },
                isPending && { opacity: 0.6 },
              ]}
              contentStyle={styles.ctaInner}
              testID="create-booking-submit"
            >
              {isPending ? (
                <ActivityIndicator color={chrome.constellation ? gatewayTheme.platformInk : "#fff"} />
              ) : (
                <>
                  <Feather
                    name="calendar"
                    size={16}
                    color={chrome.constellation ? gatewayTheme.platformInk : colors.primaryForeground}
                  />
                  <Text
                    style={[
                      styles.ctaText,
                      { color: chrome.constellation ? gatewayTheme.platformInk : colors.primaryForeground },
                    ]}
                  >
                    Create booking
                  </Text>
                </>
              )}
            </GlowPressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </OperationalScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  progressRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 6,
  },
  progressItem: { flex: 1, gap: 4, alignItems: "center" },
  progressDot: { width: "100%", height: 3, borderRadius: 2 },
  progressLabel: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 0.3, textTransform: "uppercase" },
  stepHint: { ...type.caption, marginBottom: 10 },
  scrollContent: { gap: 12, paddingBottom: 16 },
  stepCard: { gap: 10 },
  panelTitle: { fontFamily: fonts.serifMedium, fontSize: 18 },
  panelSub: { ...type.caption, marginTop: -4 },
  sectionEyebrow: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: 4,
  },
  hint: { fontSize: 13, fontFamily: fonts.body, lineHeight: 18 },
  link: { fontSize: 13, fontFamily: fonts.bodySemi, marginTop: 4 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: fonts.body,
  },
  textarea: { minHeight: 72, textAlignVertical: "top", marginTop: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  slotGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chipInner: { paddingHorizontal: 14, paddingVertical: 8 },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 4,
  },
  reviewLabel: { ...type.caption, flex: 1 },
  reviewValue: { fontFamily: fonts.bodySemi, fontSize: 14, flex: 1, textAlign: "right" },
  error: { fontSize: 13, textAlign: "center", marginTop: 4 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 12,
    paddingHorizontal: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerBack: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10, paddingHorizontal: 4 },
  footerBackText: { fontFamily: fonts.bodySemi, fontSize: 14 },
  cta: { borderRadius: 999, paddingHorizontal: 20, paddingVertical: 12 },
  ctaInner: { flexDirection: "row", alignItems: "center", gap: 6 },
  ctaText: { fontFamily: fonts.bodySemi, fontSize: 15 },
});
