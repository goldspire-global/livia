import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PresentationLayoutMorph } from "@workspace/policy";
import { layoutMorphLabel } from "@/lib/presentation-surface";
import { PendingWhyLine } from "@/components/booking/pending-why-line";
import {
  WellnessDerivedRoomBoard,
  WellnessInteractiveRoomBoard,
  type RoomBoardBooking,
  type RoomBoardResource,
} from "@/components/wellness/wellness-room-board";

type BookingRow = RoomBoardBooking;

function guestName(c: BookingRow["customer"]): string {
  if (!c) return "Guest";
  return (
    c.displayName ||
    [c.firstName, c.lastName].filter(Boolean).join(" ").trim() ||
    "Guest"
  );
}

function formatTime(row: BookingRow): string {
  const iso = row.startTime ?? row.startAt ?? "";
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export type PackageCreditSummaryView = {
  ledgerCount?: number;
  creditsSold: number;
  creditsRedeemed: number;
  creditsRemaining: number;
  activePackages: number;
};

/** Harbour-light — live resource lanes or derived fallback. */
export function WellnessAtriumSchedule({
  bookings,
  resources,
  onAssignBookingToResource,
  assigningBookingId,
  className,
  hero = false,
  roomBoardFootnote,
  vertical,
  category,
}: {
  bookings: RoomBoardBooking[];
  resources?: RoomBoardResource[];
  onAssignBookingToResource?: (bookingId: string, resourceId: string | null) => Promise<boolean>;
  assigningBookingId?: string | null;
  className?: string;
  hero?: boolean;
  roomBoardFootnote?: string | null;
  vertical?: string | null;
  category?: string | null;
}) {
  const roomResources = (resources ?? []).filter(
    (r) => r.resourceType === "room" || !r.resourceType,
  );
  if (roomResources.length > 0) {
    return (
      <div className={className}>
        <WellnessInteractiveRoomBoard
          bookings={bookings}
          resources={roomResources}
          onAssignBookingToResource={onAssignBookingToResource}
          hero={hero}
          roomBoardFootnote={roomBoardFootnote}
          assigningBookingId={assigningBookingId}
          vertical={vertical}
          category={category}
        />
      </div>
    );
  }
  return (
    <div className={className}>
      <WellnessDerivedRoomBoard
        bookings={bookings}
        hero={hero}
        roomBoardFootnote={roomBoardFootnote}
      />
    </div>
  );
}

/** Session-rail — vertical timeline (layout morph timeline-rail). */
export function WellnessTimelineSchedule({
  bookings,
  className,
  vertical,
  category,
}: {
  bookings: BookingRow[];
  className?: string;
  vertical?: string | null;
  category?: string | null;
}) {
  const rows = bookings.slice(0, 5);
  return (
    <section className={cn("wellness-timeline-board", className)} data-testid="wellness-timeline-schedule">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-sm font-semibold">My day</h2>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {layoutMorphLabel("timeline-rail")}
        </span>
      </div>
      <div className="relative pl-10 space-y-3 border-l-2 border-border ml-3">
        {rows.map((b, i) => (
          <div key={b.id} className={cn("relative", i === 0 && "wellness-timeline-active")}>
            <span
              className={cn(
                "absolute -left-[1.35rem] top-2 h-3 w-3 rounded-full border-2 bg-background",
                i === 0 ? "border-foreground bg-foreground" : "border-muted-foreground",
              )}
              aria-hidden
            />
            <div
              className={cn(
                "rounded-lg border px-3 py-2",
                i === 0 ? "border-foreground bg-card shadow-sm" : "border-border/80 bg-muted/30",
              )}
            >
              <p className="text-xs font-mono tabular-nums text-muted-foreground">{formatTime(b)}</p>
              <p className="text-sm font-medium">{b.service?.name ?? "Session"}</p>
              <p className="text-xs text-muted-foreground">{guestName(b.customer)}</p>
              {b.status === "PENDING" ? (
                <PendingWhyLine reason={b.pendingReason} vertical={vertical} category={category} className="mt-1" />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Evening-ledger — package credit metrics + slim rows (layout morph ledger). */
export function WellnessLedgerSchedule({
  bookings,
  className,
  packageCreditSummary,
  vertical,
  category,
}: {
  bookings: BookingRow[];
  className?: string;
  packageCreditSummary?: PackageCreditSummaryView | null;
  vertical?: string | null;
  category?: string | null;
}) {
  const showLedger = packageCreditSummary && (packageCreditSummary.ledgerCount ?? 0) > 0;
  return (
    <section className={cn("wellness-ledger-board space-y-4", className)} data-testid="wellness-ledger-schedule">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Prepaid sessions today</h2>
        <span className="text-[10px] uppercase tracking-wider text-primary/80">
          {layoutMorphLabel("ledger")}
        </span>
      </div>
      {showLedger ? (
        <div className="grid gap-3 sm:grid-cols-3" data-testid="wellness-voucher-ledger-live">
          {[
            ["Sessions sold", String(packageCreditSummary!.creditsSold)],
            ["Redeemed", String(packageCreditSummary!.creditsRedeemed)],
            ["Remaining", String(packageCreditSummary!.creditsRemaining)],
          ].map(([label, val]) => (
            <div key={label} className="wellness-ledger-metric rounded-lg border bg-card p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className="text-xl font-serif mt-1 text-primary">{val}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground" data-testid="wellness-voucher-ledger-empty">
          Record prepaid series or gift vouchers on{" "}
          <Link href="/day-packages" className="text-primary hover:underline">
            Packages
          </Link>{" "}
          to see sold vs remaining sessions here.
        </p>
      )}
      <div className="rounded-lg border overflow-hidden">
        <div className="grid grid-cols-[4rem_1fr_5rem] gap-2 bg-muted/50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Time</span>
          <span>Service · guest</span>
          <span>Status</span>
        </div>
        {bookings.slice(0, 4).map((b) => (
          <div
            key={b.id}
            className="grid grid-cols-[4rem_1fr_5rem] gap-2 border-t px-3 py-2 text-sm items-center"
          >
            <span className="font-mono tabular-nums text-xs">{formatTime(b)}</span>
            <span className="truncate min-w-0">
              {b.service?.name ?? "Session"} · {guestName(b.customer)}
            </span>
            {b.status === "PENDING" ? (
              <span className="text-[9px] font-semibold uppercase text-[hsl(var(--wellness-pending-fg,38_92%_35%))] shrink-0">
                Pending
              </span>
            ) : (
              <span className="text-[10px] font-semibold uppercase text-primary shrink-0">Open</span>
            )}
          </div>
        ))}
        {bookings.some((b) => b.status === "PENDING") ? (
          <div className="px-3 py-2 border-t space-y-2">
            {bookings
              .filter((b) => b.status === "PENDING")
              .slice(0, 3)
              .map((b) => (
                <div key={`pending-why-${b.id}`}>
                  <p className="text-xs font-medium truncate">
                    {formatTime(b)} · {guestName(b.customer)}
                  </p>
                  <PendingWhyLine
                    reason={b.pendingReason}
                    vertical={vertical}
                    category={category}
                  />
                </div>
              ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function WellnessMorphSchedule({
  morph,
  bookings,
  resources,
  onAssignBookingToResource,
  assigningBookingId,
  roomBoardFootnote,
  packageCreditSummary,
  vertical,
  category,
}: {
  morph: PresentationLayoutMorph | null;
  bookings: BookingRow[];
  resources?: RoomBoardResource[];
  onAssignBookingToResource?: (bookingId: string, resourceId: string | null) => Promise<boolean>;
  assigningBookingId?: string | null;
  roomBoardFootnote?: string | null;
  packageCreditSummary?: PackageCreditSummaryView | null;
  vertical?: string | null;
  category?: string | null;
}) {
  switch (morph) {
    case "atrium":
      return (
        <WellnessAtriumSchedule
          bookings={bookings}
          resources={resources}
          onAssignBookingToResource={onAssignBookingToResource}
          assigningBookingId={assigningBookingId}
          roomBoardFootnote={roomBoardFootnote}
          vertical={vertical}
          category={category}
        />
      );
    case "timeline-rail":
      return (
        <WellnessTimelineSchedule
          bookings={bookings}
          vertical={vertical}
          category={category}
        />
      );
    case "ledger":
      return (
        <WellnessLedgerSchedule
          bookings={bookings}
          packageCreditSummary={packageCreditSummary}
          vertical={vertical}
          category={category}
        />
      );
    default:
      return null;
  }
}

export function WellnessAtriumTopNav({ active }: { active: "today" | "inbox" }) {
  const tabs = [
    { id: "today" as const, label: "Today", href: "/dashboard" },
    { id: "inbox" as const, label: "Inbox", href: "/inbox" },
    { id: "rooms" as const, label: "Rooms", href: "/bookings" },
  ];
  return (
    <nav
      className="wellness-atrium-topnav flex flex-wrap items-center gap-2 border-b bg-card/60 px-4 py-2 md:hidden"
      data-testid="wellness-atrium-topnav"
      aria-label="Wellness atrium"
    >
      {tabs.map((t) => (
        <Link
          key={t.id}
          href={t.href}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium",
            active === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground",
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

export function WellnessMorphCta({ morph }: { morph: PresentationLayoutMorph | null }) {
  if (!morph || morph === "constellation" || morph === "standard") return null;
  return (
    <p className="text-[10px] text-muted-foreground flex items-center gap-1" data-testid="wellness-morph-badge">
      Layout · {layoutMorphLabel(morph)}
      <ArrowRight className="h-3 w-3" aria-hidden />
    </p>
  );
}
