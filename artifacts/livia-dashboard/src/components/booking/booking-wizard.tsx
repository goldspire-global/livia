import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useBusiness } from "@/lib/business-context";
import { staffListParams } from "@/lib/staff-params";
import { formatDateTime, formatTime } from "@/lib/format";
import { verticalPackUi } from "@/lib/vertical-pack-ui";
import {
  useListCustomers,
  useListFrequentCustomers,
  useListServices,
  useListStaff,
  useGetAvailableSlots,
  useCreateBooking,
  getListBookingsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { invalidateOperationalState } from "@/lib/operational-cache";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CalendarPlus, Check, ChevronRight, Clock, UserPlus } from "lucide-react";
import { customFetch } from "@workspace/api-client-react";
import { inferFillRecommendation, resolveVerticalKey } from "@workspace/policy";

const STEPS = ["Client", "Service", "Team", "Time", "Confirm"] as const;
const QUICK_STEPS = ["Client", "Schedule", "Confirm"] as const;
type Step = (typeof STEPS)[number] | "Schedule";

const PAGE_SIZE = 30;
const FREQUENT_CLIENT_CAP = 10;

type BookingWizardProps = {
  mode?: "page" | "dialog";
  /** Minimal flow for front-desk / quick add. */
  quick?: boolean;
  onCreated?: (bookingId: string) => void;
  onCancel?: () => void;
};

export function BookingWizard({ mode = "page", quick = false, onCreated, onCancel }: BookingWizardProps) {
  const [, setLocation] = useLocation();
  const { business } = useBusiness();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [step, setStep] = useState<Step>("Client");
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [customerIds, setCustomerIds] = useState<string[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const customerId = customerIds[0] ?? "";
  const serviceId = serviceIds[0] ?? "";
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [notes, setNotes] = useState("");

  const bid = business?.id ?? "";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefillCustomer = params.get("customerId");
    const prefillService = params.get("serviceId");
    if (prefillCustomer) {
      setCustomerIds([prefillCustomer]);
      if (quick) setStep("Schedule");
    }
    if (prefillService) setServiceIds([prefillService]);
  }, [quick]);

  const businessVertical = (business as { vertical?: string; category?: string } | null)?.vertical;
  const verticalKey = resolveVerticalKey(businessVertical, (business as { category?: string } | null)?.category);

  const debouncedCustomerSearch = useDebouncedValue(customerSearch, 300);

  const { data: customersData, isLoading: customersLoading } = useListCustomers(
    bid,
    { search: debouncedCustomerSearch || undefined, limit: PAGE_SIZE },
    { query: { enabled: !!bid && step === "Client" && !!debouncedCustomerSearch } as never },
  );

  const { data: frequentData } = useListFrequentCustomers(
    bid,
    { limit: FREQUENT_CLIENT_CAP },
    { query: { enabled: !!bid && step === "Client" } as never },
  );

  const { data: servicesData } = useListServices(
    bid,
    { isActive: true },
    { query: { enabled: !!bid } as never },
  );

  const { data: staffData, isLoading: staffLoading } = useListStaff(
    bid,
    staffListParams({ isActive: true, serviceId: serviceId || undefined }),
    { query: { enabled: !!bid && !!serviceId } as never },
  );

  const { data: slotsData, isLoading: isLoadingSlots } = useGetAvailableSlots(
    bid,
    { serviceId, date, staffId: staffId || undefined },
    {
      query: {
        enabled: !!bid && !!serviceId && !!date && (step === "Time" || step === "Schedule"),
      } as never,
    },
  );

  const createBooking = useCreateBooking();

  const customers = (customersData as { data?: unknown[] })?.data ?? customersData ?? [];
  const frequentClients =
    (frequentData as { data?: { id: string; firstName?: string; lastName?: string }[] })?.data ?? [];
  const services = servicesData ?? [];
  const staff = staffData ?? [];

  useEffect(() => {
    if (!bid || !customerId || verticalKey !== "beauty" || serviceId) return;
    const svcList = Array.isArray(services) ? services : [];
    if (!svcList.length) return;
    void customFetch<{
      recentBookings?: Array<{ serviceId: string; status: string; startAt: string; endAt?: string }>;
    }>(`/api/businesses/${bid}/customers/${customerId}`).then((detail) => {
      const lastCompleted = detail.recentBookings?.find((b) => b.status === "COMPLETED");
      if (!lastCompleted) return;
      const lastSvc = svcList.find((s) => s.id === lastCompleted.serviceId) as
        | { serviceKind?: string | null; rebookIntervalDays?: number | null }
        | undefined;
      const rec = inferFillRecommendation({
        serviceKind: (lastSvc?.serviceKind as import("@workspace/policy").BeautyServiceKind | null) ?? "fill",
        rebookIntervalDays: lastSvc?.rebookIntervalDays ?? 14,
        lastVisitAt: lastCompleted.endAt ?? lastCompleted.startAt,
      });
      const targetKind = rec.suggestFullSet ? "full_set" : rec.dueForFill ? "fill" : lastSvc?.serviceKind ?? "fill";
      const match =
        svcList.find((s) => (s as { serviceKind?: string }).serviceKind === targetKind) ??
        svcList.find((s) => s.id === lastCompleted.serviceId);
      if (match) setServiceIds([match.id]);
    });
  }, [bid, customerId, verticalKey, serviceId, services]);

  const availableSlots = useMemo(() => {
    const raw = (
      (slotsData as { slots?: { startAt: string; available: boolean }[] })?.slots ?? []
    ).filter((s) => s.available);
    const byStart = new Map<string, (typeof raw)[number]>();
    for (const slot of raw) byStart.set(slot.startAt, slot);
    return [...byStart.values()];
  }, [slotsData]);

  const selectedCustomer = (customers as { id: string; firstName?: string; lastName?: string }[]).find(
    (c) => c.id === customerId,
  );
  const selectedService = (services as { id: string; name: string; durationMinutes?: number }[]).find(
    (s) => s.id === serviceId,
  );
  const selectedStaff = (staff as { id: string; displayName: string }[]).find((s) => s.id === staffId);

  const vocab = verticalPackUi(
    (business as { vertical?: string } | null)?.vertical,
    business?.category,
  );

  const activeSteps = useMemo((): Step[] => {
    if (quick) return [...QUICK_STEPS];
    const base = [...STEPS] as Step[];
    if (!serviceId || staffLoading) return base;
    const eligibleCount = staff.length;
    if (eligibleCount === 0) {
      return base.filter((s) => s !== "Team");
    }
    return base;
  }, [quick, serviceId, staffLoading, staff.length]);

  // Auto-pick the only eligible staff member in quick mode.
  useEffect(() => {
    if (!quick) return;
    if (!serviceId || staffLoading) return;
    if (staff.length === 1) {
      const only = (staff as { id: string }[])[0];
      if (only?.id && staffId !== only.id) {
        setStaffId(only.id);
        setSelectedSlot("");
      }
    }
  }, [quick, serviceId, staffLoading, staff, staffId]);

  useEffect(() => {
    if (!activeSteps.includes(step)) {
      const fallback = activeSteps[Math.max(0, activeSteps.length - 1)] ?? "Client";
      setStep(fallback);
    }
  }, [activeSteps, step]);

  useEffect(() => {
    if (!serviceId) return;
    if (staffId && !(staff as { id: string }[]).some((s) => s.id === staffId)) {
      setStaffId("");
      setSelectedSlot("");
    }
  }, [serviceId, staff, staffId]);

  const stepIndex = activeSteps.indexOf(step);

  function goNext() {
    if (step === "Client" && customerIds.length === 0) {
      toast({ title: "Choose at least one client to continue", variant: "destructive" });
      return;
    }
    if (step === "Service" && serviceIds.length === 0) {
      toast({ title: "Choose at least one service to continue", variant: "destructive" });
      return;
    }
    if (step === "Schedule") {
      if (!serviceId) {
        toast({ title: "Choose a service to continue", variant: "destructive" });
        return;
      }
      if (!selectedSlot) {
        toast({ title: "Pick an available time", variant: "destructive" });
        return;
      }
    }
    if (step === "Time" && !selectedSlot) {
      toast({ title: "Pick an available time", variant: "destructive" });
      return;
    }
    const next = activeSteps[stepIndex + 1];
    if (next) setStep(next);
  }

  function goBack() {
    const prev = activeSteps[stepIndex - 1];
    if (prev) setStep(prev);
  }

  function toggleClient(id: string) {
    setCustomerIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    if (quick && step === "Client") {
      setStep("Schedule");
    }
  }

  function toggleService(id: string) {
    setServiceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setStaffId("");
    setSelectedSlot("");
  }

  // Solo studios: skip picking the only active service in quick add.
  useEffect(() => {
    if (!quick || step !== "Schedule" || serviceId) return;
    const active = (services as { id: string }[]).filter(Boolean);
    if (active.length === 1) setServiceIds([active[0]!.id]);
  }, [quick, step, serviceId, services]);

  async function handleSubmit() {
    if (!bid || customerIds.length === 0 || serviceIds.length === 0 || !selectedSlot) {
      toast({ title: "Missing required fields", variant: "destructive" });
      return;
    }
    try {
      let cursor = new Date(selectedSlot);
      let lastBookingId = "";
      for (const sid of serviceIds) {
        const svc = (services as { id: string; durationMinutes?: number; bufferAfterMinutes?: number }[]).find(
          (s) => s.id === sid,
        );
        const blockMs = ((svc?.durationMinutes ?? 60) + (svc?.bufferAfterMinutes ?? 0)) * 60_000;
        for (const cid of customerIds) {
          const booking = await createBooking.mutateAsync({
            businessId: bid,
            data: {
              customerId: cid,
              serviceId: sid,
              staffId: staffId || undefined,
              startAt: cursor.toISOString(),
              notes: notes || undefined,
            },
          });
          lastBookingId = (booking as { id: string }).id;
        }
        cursor = new Date(cursor.getTime() + blockMs);
      }
      invalidateOperationalState(qc, bid);
      toast({
        title:
          customerIds.length * serviceIds.length > 1 ? "Bookings created" : "Booking created",
      });
      if (onCreated) {
        onCreated(lastBookingId);
      } else if (lastBookingId) {
        setLocation(`/bookings/${lastBookingId}`);
      }
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Failed to create booking";
      toast({ title: msg, variant: "destructive" });
    }
  }

  const staffEmptyHint = useMemo(() => {
    if (!serviceId || staffLoading) return null;
    if (staff.length > 0) return null;
    return `No ${vocab.teamNoun.toLowerCase()} assigned to this service yet. Assign them under Team, or pick another service.`;
  }, [serviceId, staff.length, staffLoading, vocab.teamNoun]);

  return (
    <div
      data-testid={mode === "page" ? "booking-new-page" : undefined}
      className={
        mode === "dialog"
          ? "space-y-4"
          : "space-y-4"
      }
    >
      <p className="text-sm text-muted-foreground" data-testid="booking-wizard-step-label">
        Step {stepIndex + 1} of {activeSteps.length} — <span className="text-foreground font-medium">{step}</span>
      </p>

      <div className="flex gap-1">
        {activeSteps.map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${i <= stepIndex ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>

      {step === "Client" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Who is this for?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!customerSearch && frequentClients.length > 0 ? (
              <div className="space-y-2">
                <Label>Frequent clients</Label>
                <div className="flex flex-wrap gap-2">
                  {frequentClients.slice(0, FREQUENT_CLIENT_CAP).map((c) => {
                    const selected = customerIds.includes(c.id);
                    return (
                      <button
                        key={`freq-${c.id}`}
                        type="button"
                        onClick={() => toggleClient(c.id)}
                        className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                          selected
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        {c.firstName} {c.lastName}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
            <div className="space-y-2">
              <Label>Search clients</Label>
              <Input
                placeholder="Name, email, or phone…"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                data-testid="booking-wizard-customer-search"
              />
            </div>
            {customersLoading ? (
              <Skeleton className="h-32" />
            ) : debouncedCustomerSearch &&
              (customers as { id: string; firstName?: string; lastName?: string }[]).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No clients match — try another search.
              </p>
            ) : debouncedCustomerSearch ? (
              <div className="flex flex-wrap gap-2">
                {(customers as { id: string; firstName?: string; lastName?: string }[]).map((c) => {
                  const selected = customerIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      data-testid={`booking-wizard-client-${c.id}`}
                      onClick={() => toggleClient(c.id)}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                        selected
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      {c.firstName} {c.lastName}
                    </button>
                  );
                })}
              </div>
            ) : null}
            <Link href="/customers">
              <Button type="button" variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add new client
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {step === "Schedule" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Service & time</CardTitle>
          </CardHeader>
          <CardContent className="livia-form-stack space-y-5">
            <div className="space-y-2">
              <Label>Service</Label>
              <div className="flex flex-wrap gap-2">
                {(services as { id: string; name: string; durationMinutes?: number }[]).map((s) => {
                  const selected = serviceIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleService(s.id)}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                        selected
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      {s.name} ({s.durationMinutes} min)
                    </button>
                  );
                })}
              </div>
            </div>
            {serviceId && staff.length > 1 ? (
              <div className="space-y-2">
                <Label>{vocab.teamNoun}</Label>
                <Select
                  value={staffId || "__any__"}
                  onValueChange={(v) => {
                    setStaffId(v === "__any__" ? "" : v);
                    setSelectedSlot("");
                  }}
                >
                  <SelectTrigger data-testid="select-staff">
                    <SelectValue placeholder="First available" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__any__">First available</SelectItem>
                    {(staff as { id: string; displayName: string }[]).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="space-y-2 pt-1">
              <Label
                className="cursor-pointer"
                onClick={() => {
                  const el = dateInputRef.current;
                  if (el && typeof el.showPicker === "function") el.showPicker();
                  else el?.focus();
                }}
              >
                Date
              </Label>
              <Input
                ref={dateInputRef}
                type="date"
                className="cursor-pointer"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onClick={(e) => {
                  const el = e.currentTarget;
                  if (typeof el.showPicker === "function") el.showPicker();
                }}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSelectedSlot("");
                }}
                data-testid="input-date"
              />
            </div>
            {serviceId && date ? (
              <div className="space-y-2 pt-1">
                <Label>Available times</Label>
                {isLoadingSlots ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} className="h-10" />
                    ))}
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center border rounded-md">
                    No slots on this day — try another date.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.startAt}
                        type="button"
                        data-testid={`button-slot-${slot.startAt}`}
                        onClick={() => {
                          setSelectedSlot(slot.startAt);
                          if (quick) setStep("Confirm");
                        }}
                        className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                          selectedSlot === slot.startAt
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {formatTime(slot.startAt)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {step === "Service" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Which service?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Select one or more — multiple treatments run back-to-back from your chosen time.
            </p>
            <div className="flex flex-wrap gap-2">
              {(services as { id: string; name: string; durationMinutes?: number }[]).map((s) => {
                const selected = serviceIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    data-testid={`booking-wizard-service-${s.id}`}
                    onClick={() => toggleService(s.id)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      selected
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    {s.name} ({s.durationMinutes} min)
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {step === "Team" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Who will take it?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {staffEmptyHint && (
              <p className="text-sm text-muted-foreground border rounded-md p-3">
                {staffEmptyHint}{" "}
                <Link href="/staff" className="text-primary underline-offset-2 hover:underline">
                  Open team
                </Link>
              </p>
            )}
            <Select
              value={staffId}
              onValueChange={(v) => {
                setStaffId(v === "__any__" ? "" : v);
                setSelectedSlot("");
              }}
            >
              <SelectTrigger data-testid="select-staff">
                <SelectValue
                  placeholder={staffLoading ? "Loading…" : `Choose ${vocab.teamNoun.toLowerCase()} member…`}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__any__">First available</SelectItem>
                {(staff as { id: string; displayName: string }[]).map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {step === "Time" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              When?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSelectedSlot("");
                }}
                data-testid="input-date"
              />
            </div>
            {serviceId && date && (
              <div className="space-y-2">
                <Label>Available times</Label>
                {isLoadingSlots ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} className="h-10" />
                    ))}
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center border rounded-md">
                    No slots on this day — try another date or team member.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.startAt}
                        type="button"
                        data-testid={`button-slot-${slot.startAt}`}
                        onClick={() => setSelectedSlot(slot.startAt)}
                        className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                          selectedSlot === slot.startAt
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {formatTime(slot.startAt)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === "Confirm" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Client</span>
              <span className="font-medium text-right">
                {customerIds.length
                  ? customerIds
                      .map((id) => {
                        const c = [
                          ...frequentClients,
                          ...(customers as { id: string; firstName?: string; lastName?: string }[]),
                        ].find((x) => x.id === id);
                        return c
                          ? `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim()
                          : null;
                      })
                      .filter(Boolean)
                      .join(", ") || "—"
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Service</span>
              <span className="font-medium text-right">
                {serviceIds.length
                  ? serviceIds
                      .map(
                        (id) =>
                          (services as { id: string; name: string }[]).find((s) => s.id === id)?.name,
                      )
                      .filter(Boolean)
                      .join(" → ")
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Team</span>
              <span className="font-medium">{selectedStaff?.displayName ?? "First available"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Time</span>
              <span className="font-medium text-right">
                {selectedSlot ? formatDateTime(selectedSlot) : "—"}
              </span>
            </div>
            {!quick ? (
              <div className="space-y-2 pt-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  placeholder="Colour formula, preferences…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  data-testid="input-notes"
                />
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        {stepIndex > 0 ? (
          <Button type="button" variant="outline" onClick={goBack}>
            Back
          </Button>
        ) : mode === "dialog" ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : (
          <Link href="/bookings">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        )}
        {step !== "Confirm" ? (
          <Button type="button" onClick={goNext} className="ml-auto" data-testid="booking-wizard-next">
            Continue
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            type="button"
            className="ml-auto"
            disabled={createBooking.isPending}
            onClick={() => void handleSubmit()}
            data-testid="button-submit-booking"
          >
            <CalendarPlus className="h-4 w-4 mr-2" />
            {createBooking.isPending ? "Creating…" : "Create booking"}
          </Button>
        )}
      </div>
    </div>
  );
}
