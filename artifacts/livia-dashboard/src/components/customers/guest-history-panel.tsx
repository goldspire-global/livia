import { SettingsDisclosure } from "@/components/ui/settings-disclosure";
import { CustomerTimeline } from "@/components/customer-timeline";

type BookingRow = {
  id: string;
  status: string;
  startAt: string;
  service?: { name?: string } | null;
};

export function GuestHistoryPanel({
  businessId,
  customerId,
  recentBookings,
}: {
  businessId: string;
  customerId: string;
  recentBookings?: BookingRow[];
}) {
  const bookings = recentBookings ?? [];
  const summary =
    bookings.length > 0
      ? `${bookings.length} visit${bookings.length === 1 ? "" : "s"} and messages — newest first`
      : "Visits and messages appear here after the first booking or thread";

  return (
    <SettingsDisclosure
      title="Bookings & activity"
      description={summary}
      defaultOpen={bookings.length > 0}
      data-testid="guest-history-panel"
    >
      <div className="pt-1">
        <CustomerTimeline
          businessId={businessId}
          customerId={customerId}
          embedded
          recentBookings={bookings}
        />
      </div>
    </SettingsDisclosure>
  );
}
