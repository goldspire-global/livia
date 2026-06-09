import { useMemo } from "react";
import { Link } from "wouter";
import { useGetActivityFeed } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import { History } from "lucide-react";

type FeedEvent = {
  id: string;
  type: string;
  entityType?: string | null;
  entityId?: string | null;
  context?: Record<string, unknown> | null;
  createdAt: string;
};

type BookingRow = {
  id: string;
  status: string;
  startAt: string;
  service?: { name?: string } | null;
};

type TimelineItem = {
  id: string;
  at: string;
  title: string;
  sub?: string;
  href?: string;
  status?: string;
  source: "booking" | "event";
};

const EVENT_LABELS: Record<string, string> = {
  BOOKING_CREATED: "Booking created",
  BOOKING_CONFIRMED: "Booking confirmed",
  BOOKING_CANCELLED: "Booking cancelled",
  BOOKING_COMPLETED: "Booking completed",
  BOOKING_NO_SHOW: "Marked no-show",
  CUSTOMER_CREATED: "Client added",
  CUSTOMER_UPDATED: "Client updated",
  MESSAGE_RECEIVED: "Message received",
  MESSAGE_SENT: "Message sent",
  NOTIFICATION_SENT: "Notification sent",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-[hsl(var(--chart-4))]",
  CONFIRMED: "text-primary",
  COMPLETED: "text-[hsl(var(--chart-3))]",
  CANCELLED: "text-destructive",
  NO_SHOW: "text-muted-foreground",
};

function labelFor(type: string): string {
  return EVENT_LABELS[type] ?? type.replace(/_/g, " ").toLowerCase();
}

function bookingTimelineTitle(status: string, serviceName: string): string {
  if (status === "COMPLETED") return `Visit · ${serviceName}`;
  if (status === "CONFIRMED") return `Upcoming · ${serviceName}`;
  if (status === "PENDING") return `Pending · ${serviceName}`;
  if (status === "CANCELLED") return `Cancelled · ${serviceName}`;
  if (status === "NO_SHOW") return `No-show · ${serviceName}`;
  return `${serviceName}`;
}

export function CustomerTimeline({
  businessId,
  customerId,
  embedded = false,
  recentBookings,
}: {
  businessId: string;
  customerId: string;
  /** Render without outer card — for combined history panel. */
  embedded?: boolean;
  recentBookings?: BookingRow[];
}) {
  const { data, isLoading } = useGetActivityFeed(businessId, { limit: 40 }, {
    query: { enabled: !!businessId },
  } as never);

  const items = useMemo(() => {
    const bookingIds = new Set((recentBookings ?? []).map((b) => b.id));
    const rows = (data ?? []) as FeedEvent[];
    const events = rows.filter((e) => {
      if (e.entityType === "customer" && e.entityId === customerId) return true;
      const ctx = e.context as { customerId?: string } | null | undefined;
      if (ctx?.customerId === customerId) return true;
      if (
        e.entityType === "booking" &&
        typeof e.context === "object" &&
        e.context &&
        (e.context as { customerId?: string }).customerId === customerId
      ) {
        return true;
      }
      return false;
    });

    const merged: TimelineItem[] = [];

    for (const b of recentBookings ?? []) {
      const serviceName = b.service?.name ?? "Appointment";
      merged.push({
        id: `booking-${b.id}`,
        at: b.startAt,
        title: bookingTimelineTitle(b.status, serviceName),
        sub: formatDateTime(b.startAt),
        href: `/bookings/${b.id}`,
        status: b.status,
        source: "booking",
      });
    }

    for (const e of events) {
      if (e.entityType === "booking" && e.entityId && bookingIds.has(e.entityId)) {
        continue;
      }
      merged.push({
        id: `event-${e.id}`,
        at: e.createdAt,
        title: labelFor(e.type),
        sub: formatDateTime(e.createdAt),
        href:
          e.entityType === "booking" && e.entityId ? `/bookings/${e.entityId}` : undefined,
        source: "event",
      });
    }

    return merged.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [data, customerId, recentBookings]);

  const body = isLoading ? (
    <Skeleton className="h-24 w-full" />
  ) : items.length === 0 ? (
    <p className="text-sm text-muted-foreground">
      No visits or messages yet — relationship updates automatically after the first booking or inbox thread.
    </p>
  ) : (
    <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-col gap-0.5 text-sm border-l-2 border-primary/30 pl-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            {item.href ? (
              <Link href={item.href} className="font-medium hover:text-primary transition-colors">
                {item.title}
              </Link>
            ) : (
              <span className="font-medium">{item.title}</span>
            )}
            {item.status ? (
              <Badge
                variant="outline"
                className={`text-[10px] ${STATUS_COLORS[item.status] ?? ""}`}
              >
                {item.status}
              </Badge>
            ) : null}
          </div>
          {item.sub ? <span className="text-xs text-muted-foreground">{item.sub}</span> : null}
        </li>
      ))}
    </ul>
  );

  if (embedded) {
    return (
      <div data-testid="customer-timeline">
        {body}
      </div>
    );
  }

  return (
    <Card data-testid="customer-timeline">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          Bookings & activity
        </CardTitle>
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
}
