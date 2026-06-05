import { useState } from "react";
import { Link } from "wouter";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { layoutMorphLabel } from "@/lib/presentation-surface";
import { useToast } from "@/hooks/use-toast";
import { PendingWhyLine } from "@/components/booking/pending-why-line";
import { WELLNESS_ROOM_TURNOVER_MINUTES } from "@workspace/policy";

export type RoomBoardResource = {
  id: string;
  name: string;
  resourceType?: string;
  capacity?: number;
};

export type RoomBoardBooking = {
  id: string;
  startTime?: string;
  startAt?: string;
  endAt?: string;
  endTime?: string;
  durationMinutes?: number;
  status?: string;
  pendingReason?: string | null;
  resourceId?: string | null;
  service?: { name?: string | null } | null;
  customer?: {
    firstName?: string | null;
    lastName?: string | null;
    displayName?: string | null;
  } | null;
  resource?: { id: string; name: string } | null;
};

const UNASSIGNED = "__unassigned__";

function guestName(c: RoomBoardBooking["customer"]): string {
  if (!c) return "Guest";
  return (
    c.displayName ||
    [c.firstName, c.lastName].filter(Boolean).join(" ").trim() ||
    "Guest"
  );
}

function formatTime(row: RoomBoardBooking): string {
  const iso = row.startTime ?? row.startAt ?? "";
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

function todayBookingsOnly(bookings: RoomBoardBooking[]): RoomBoardBooking[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return bookings.filter((b) => {
    const iso = b.startTime ?? b.startAt;
    if (!iso) return true;
    const t = new Date(iso);
    return t >= start && t <= end;
  });
}

function bookingStartMs(b: RoomBoardBooking): number {
  const iso = b.startTime ?? b.startAt;
  return iso ? new Date(iso).getTime() : 0;
}

function bookingEndMs(b: RoomBoardBooking): number {
  const endIso = b.endAt ?? b.endTime;
  if (endIso) return new Date(endIso).getTime();
  const start = bookingStartMs(b);
  const mins = b.durationMinutes ?? 60;
  return start ? start + mins * 60_000 : 0;
}

function sortLaneBookings(rows: RoomBoardBooking[]): RoomBoardBooking[] {
  return [...rows].sort((a, b) => bookingStartMs(a) - bookingStartMs(b));
}

function turnoverGapMinutes(prev: RoomBoardBooking, next: RoomBoardBooking): number | null {
  const prevEnd = bookingEndMs(prev);
  const nextStart = bookingStartMs(next);
  if (!prevEnd || !nextStart) return null;
  return Math.round((nextStart - prevEnd) / 60_000);
}

function TurnoverLane({ minutes }: { minutes: number }) {
  const tight = minutes < WELLNESS_ROOM_TURNOVER_MINUTES;
  return (
    <div
      className={cn(
        "wellness-turnover-lane my-1 rounded-md border border-dashed px-2 py-1 text-[10px] uppercase tracking-wide",
        tight
          ? "border-amber-500/50 bg-amber-500/15 text-amber-800 dark:text-amber-300 wellness-turnover-lane--pulse"
          : "border-muted-foreground/30 text-muted-foreground",
      )}
      data-testid="wellness-turnover-gap"
    >
      {tight ? `${minutes}m gap · turnover tight` : `${minutes}m turnover buffer`}
    </div>
  );
}

/** Live room swimlanes — drag sessions between resources (Track A). */
export function WellnessInteractiveRoomBoard({
  bookings,
  resources,
  onAssignBookingToResource,
  hero = false,
  roomBoardFootnote,
  assigningBookingId,
  vertical,
  category,
}: {
  bookings: RoomBoardBooking[];
  resources: RoomBoardResource[];
  onAssignBookingToResource?: (
    bookingId: string,
    resourceId: string | null,
  ) => Promise<boolean>;
  hero?: boolean;
  roomBoardFootnote?: string | null;
  assigningBookingId?: string | null;
  vertical?: string | null;
  category?: string | null;
}) {
  const { toast } = useToast();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const todayRows = todayBookingsOnly(bookings);
  const roomResources = resources.filter((r) => r.resourceType === "room" || !r.resourceType);
  const lanes: Array<{ id: string; label: string }> = [
    ...roomResources.map((r) => ({ id: r.id, label: r.name })),
    { id: UNASSIGNED, label: "Unassigned" },
  ];

  const buckets: Record<string, RoomBoardBooking[]> = Object.fromEntries(
    lanes.map((l) => [l.id, [] as RoomBoardBooking[]]),
  );

  for (const b of todayRows) {
    const key =
      b.resourceId && buckets[b.resourceId] ? b.resourceId : UNASSIGNED;
    buckets[key]!.push(b);
  }
  for (const lane of lanes) {
    buckets[lane.id] = sortLaneBookings(buckets[lane.id] ?? []);
  }

  async function handleDrop(bookingId: string, targetLaneId: string) {
    if (!onAssignBookingToResource) return;
    const resourceId = targetLaneId === UNASSIGNED ? null : targetLaneId;
    const ok = await onAssignBookingToResource(bookingId, resourceId);
    if (!ok) {
      toast({
        title: "Room unavailable",
        description: "Turnover buffer or capacity blocked that move. Try another room.",
        variant: "destructive",
      });
    }
  }

  return (
    <section
      className={cn("wellness-atrium-board space-y-3", hero && "wellness-atrium-board--hero")}
      data-testid="wellness-atrium-schedule"
    >
      {hero ? (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-lg font-serif tracking-tight">Today&apos;s rooms</h2>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {onAssignBookingToResource
              ? `${layoutMorphLabel("atrium")} · drag · ${WELLNESS_ROOM_TURNOVER_MINUTES}m turnover`
              : layoutMorphLabel("atrium")}
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight">Room swimlanes</h2>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {layoutMorphLabel("atrium")}
          </span>
        </div>
      )}
      <div className={cn("grid gap-3", hero ? "md:grid-cols-3 lg:grid-cols-4 gap-4" : "md:grid-cols-3 lg:grid-cols-4")}>
        {lanes.map((lane) => (
          <div
            key={lane.id}
            className={cn(
              "wellness-atrium-lane rounded-xl border bg-card/80 p-3 min-h-[120px] transition-colors",
              lane.id === UNASSIGNED && "border-dashed bg-muted/20",
            )}
            data-testid={`wellness-room-lane-${lane.id}`}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add("ring-2", "ring-primary/30", "wellness-atrium-lane--drop");
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove("ring-2", "ring-primary/30", "wellness-atrium-lane--drop");
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("ring-2", "ring-primary/30", "wellness-atrium-lane--drop");
              setDraggingId(null);
              const bookingId =
                e.dataTransfer.getData("text/plain") ||
                e.dataTransfer.getData("text/booking-id");
              if (bookingId) void handleDrop(bookingId, lane.id);
            }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-2">
              {lane.label}
            </p>
            <div className="space-y-2">
              {buckets[lane.id]?.length ? (
                buckets[lane.id]!.map((b, idx, arr) => {
                  const next = arr[idx + 1];
                  const gapMin = next ? turnoverGapMinutes(b, next) : null;
                  return (
                    <div key={b.id}>
                      <div
                        className={cn(
                          "rounded-lg border bg-background px-3 py-2 text-sm group flex gap-1.5 transition-shadow",
                          assigningBookingId === b.id && "opacity-60 pointer-events-none",
                          draggingId === b.id && "wellness-room-drag-glow ring-2 ring-primary/40 shadow-lg",
                        )}
                        data-testid={`wellness-room-booking-${b.id}`}
                      >
                        {onAssignBookingToResource ? (
                          <div
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/plain", b.id);
                              e.dataTransfer.setData("text/booking-id", b.id);
                              e.dataTransfer.effectAllowed = "move";
                              setDraggingId(b.id);
                            }}
                            onDragEnd={() => setDraggingId(null)}
                            className="cursor-grab active:cursor-grabbing shrink-0 pt-0.5 touch-none wellness-room-drag-handle"
                            aria-label={`Drag ${guestName(b.customer)} session to another room`}
                            data-testid={`wellness-room-drag-${b.id}`}
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground" aria-hidden />
                          </div>
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <Link href={`/bookings/${b.id}`} draggable={false}>
                            <div className="flex items-center gap-2">
                              <p className="font-medium tabular-nums hover:text-primary">{formatTime(b)}</p>
                              {b.status === "PENDING" ? (
                                <span className="text-[9px] font-semibold uppercase tracking-wide text-[hsl(var(--wellness-pending-fg,38_92%_35%))]">
                                  Pending
                                </span>
                              ) : null}
                            </div>
                          </Link>
                          <p className="text-xs text-muted-foreground truncate">
                            {guestName(b.customer)} · {b.service?.name ?? "Session"}
                          </p>
                          {b.status === "PENDING" ? (
                            <PendingWhyLine
                              reason={b.pendingReason}
                              vertical={vertical}
                              category={category}
                              className="mt-1"
                            />
                          ) : null}
                        </div>
                      </div>
                      {gapMin != null ? <TurnoverLane minutes={gapMin} /> : null}
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">Open</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {roomBoardFootnote ? (
        <p
          className="text-[11px] text-muted-foreground leading-relaxed"
          data-testid="wellness-room-board-footnote"
        >
          {roomBoardFootnote}
        </p>
      ) : null}
    </section>
  );
}

/** Fallback when no resources configured — legacy round-robin lanes (demo-only). */
export function WellnessDerivedRoomBoard({
  bookings,
  hero = false,
  roomBoardFootnote,
}: {
  bookings: RoomBoardBooking[];
  hero?: boolean;
  roomBoardFootnote?: string | null;
}) {
  const rooms = ["Serenity", "Stillness", "Garden"] as const;
  const buckets: Record<string, RoomBoardBooking[]> = {
    Serenity: [],
    Stillness: [],
    Garden: [],
  };
  todayBookingsOnly(bookings)
    .slice(0, 9)
    .forEach((b, i) => {
      buckets[rooms[i % 3]!].push(b);
    });

  return (
    <section
      className={cn("wellness-atrium-board space-y-3", hero && "wellness-atrium-board--hero")}
      data-testid="wellness-atrium-schedule-derived"
    >
      {hero ? (
        <h2 className="text-lg font-serif tracking-tight">Today&apos;s rooms</h2>
      ) : (
        <h2 className="text-sm font-semibold tracking-tight">Room swimlanes</h2>
      )}
      <p className="text-[11px] text-amber-700/90 dark:text-amber-400/90">
        Add rooms in Settings → Studio to enable live drag-and-drop.
      </p>
      <div className={cn("grid gap-3 md:grid-cols-3")}>
        {rooms.map((room) => (
          <div key={room} className="wellness-atrium-lane rounded-xl border bg-card/80 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-2">
              {room}
            </p>
            <div className="space-y-2">
              {buckets[room].length ? (
                buckets[room].map((b) => (
                  <div key={b.id} className="rounded-lg border bg-background px-3 py-2 text-sm">
                    <p className="font-medium tabular-nums">{formatTime(b)}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {guestName(b.customer)} · {b.service?.name ?? "Session"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">Open</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {roomBoardFootnote ? (
        <p className="text-[11px] text-muted-foreground">{roomBoardFootnote}</p>
      ) : null}
    </section>
  );
}
