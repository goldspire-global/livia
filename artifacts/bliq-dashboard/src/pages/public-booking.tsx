import { useState } from "react";
import { useParams } from "wouter";
import {
  useGetPublicBusiness,
  useGetPublicSlots,
  useCreatePublicBooking,
} from "@workspace/api-client-react";
import { formatTime, formatDate, formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, MapPin, ChevronRight, ChevronLeft, Calendar } from "lucide-react";

type Step = "services" | "slots" | "details" | "confirmed";

export default function PublicBookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [step, setStep] = useState<Step>("services");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmation, setConfirmation] = useState<any>(null);

  const sl = slug ?? "";

  const { data: biz, isLoading: isLoadingBiz } = useGetPublicBusiness(
    sl,
    { query: { enabled: !!sl } as any }
  );

  const { data: slotsData, isLoading: isLoadingSlots } = useGetPublicSlots(
    sl,
    {
      serviceId: selectedService?.id ?? "",
      date: selectedDate,
      staffId: selectedStaff || undefined,
    },
    {
      query: {
        enabled: !!sl && !!selectedService?.id && !!selectedDate && step === "slots",
      } as any,
    }
  );

  const createBooking = useCreatePublicBooking();

  const b = biz as any;
  const availableSlots = ((slotsData as any)?.slots ?? []).filter((s: any) => s.available);

  function handleBook() {
    if (!sl || !selectedService || !selectedSlot || !firstName) return;
    createBooking.mutate(
      {
        slug: sl,
        data: {
          serviceId: selectedService.id,
          staffId: selectedStaff || undefined,
          startAt: selectedSlot,
          customerFirstName: firstName,
          customerLastName: lastName || undefined,
          customerEmail: email || undefined,
          customerPhone: phone || undefined,
        },
      },
      {
        onSuccess: (data: any) => {
          setConfirmation(data);
          setStep("confirmed");
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.error ?? "Slot no longer available";
          alert(msg);
          setStep("slots");
          setSelectedSlot("");
        },
      }
    );
  }

  if (isLoadingBiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-md p-6 space-y-4">
          <Skeleton className="h-12 w-48 mx-auto" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!b) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold">Business not found</p>
          <p className="text-muted-foreground mt-2">This booking page doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4">
            <span className="text-2xl font-bold text-primary">{b.name?.charAt(0)}</span>
          </div>
          <h1 className="text-2xl font-bold" data-testid="text-business-name">
            {b.name}
          </h1>
          {b.city && (
            <p className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              {b.city}
            </p>
          )}
          {b.description && (
            <p className="text-sm text-muted-foreground mt-2">{b.description}</p>
          )}
        </div>

        {/* Step: Services */}
        {step === "services" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-semibold">Choose a service</h2>
            {!b.services || b.services.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No services available</p>
            ) : (
              <div className="space-y-3">
                {b.services.map((svc: any) => (
                  <button
                    key={svc.id}
                    data-testid={`button-service-${svc.id}`}
                    className="w-full text-left"
                    onClick={() => { setSelectedService(svc); setStep("slots"); }}
                  >
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-medium">{svc.name}</p>
                          {svc.description && (
                            <p className="text-sm text-muted-foreground">{svc.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {svc.durationMinutes} min
                            </span>
                            <span className="text-sm font-semibold text-primary">
                              {formatCurrency(svc.priceMinor, svc.currency)}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                      </CardContent>
                    </Card>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step: Slots */}
        {step === "slots" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setStep("services")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-lg font-semibold">{selectedService?.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedService?.durationMinutes} min ·{" "}
                  {formatCurrency(selectedService?.priceMinor, selectedService?.currency)}
                </p>
              </div>
            </div>

            {b.staff && b.staff.length > 1 && (
              <div className="space-y-2">
                <Label>Staff member</Label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger data-testid="select-staff">
                    <SelectValue placeholder="Any available" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any available</SelectItem>
                    {b.staff.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.displayName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Select date
              </Label>
              <Input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(""); }}
                data-testid="input-date"
              />
            </div>

            {isLoadingSlots ? (
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : availableSlots.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6 border rounded-md">
                No available times on this date
              </p>
            ) : (
              <div>
                <Label className="mb-2 block">Pick a time</Label>
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot: any) => (
                    <button
                      key={slot.startAt}
                      type="button"
                      data-testid={`button-slot-${slot.startAt}`}
                      onClick={() => { setSelectedSlot(slot.startAt); setStep("details"); }}
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
              </div>
            )}
          </div>
        )}

        {/* Step: Details */}
        {step === "details" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setStep("slots")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-lg font-semibold">Your details</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedService?.name} · {formatDate(selectedSlot)} at {formatTime(selectedSlot)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    data-testid="input-first-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Smith"
                    data-testid="input-last-name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 000 0000"
                  data-testid="input-phone"
                />
              </div>

              <Card className="bg-muted/50">
                <CardContent className="pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-medium">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date & Time</span>
                    <span className="font-medium">
                      {formatDate(selectedSlot)} {formatTime(selectedSlot)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{selectedService?.durationMinutes} min</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatCurrency(selectedService?.priceMinor, selectedService?.currency)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Button
                className="w-full"
                disabled={!firstName || createBooking.isPending}
                onClick={handleBook}
                data-testid="button-confirm-booking"
              >
                {createBooking.isPending ? "Booking..." : "Confirm Booking"}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Confirmed */}
        {step === "confirmed" && confirmation && (
          <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 mx-auto">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold" data-testid="text-confirmed">
                Booking Confirmed!
              </h2>
              <p className="text-muted-foreground mt-2">Your appointment has been received</p>
            </div>
            <Card>
              <CardContent className="pt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium">{confirmation.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date & Time</span>
                  <span className="font-medium">
                    {formatDate(confirmation.startAt)} at {formatTime(confirmation.startAt)}
                  </span>
                </div>
                {confirmation.staffDisplayName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">With</span>
                    <span className="font-medium">{confirmation.staffDisplayName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                    {confirmation.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setStep("services");
                setSelectedService(null);
                setSelectedSlot("");
                setSelectedStaff("");
                setFirstName("");
                setLastName("");
                setEmail("");
                setPhone("");
                setConfirmation(null);
              }}
              data-testid="button-book-another"
            >
              Book Another Appointment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
