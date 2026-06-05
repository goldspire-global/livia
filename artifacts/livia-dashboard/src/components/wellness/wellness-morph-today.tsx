import { Link } from "wouter";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PresentationLayoutMorph } from "@workspace/policy";
import {
  WellnessAtriumSchedule,
  WellnessLedgerSchedule,
  WellnessTimelineSchedule,
  type PackageCreditSummaryView,
} from "@/components/wellness/wellness-layout-surfaces";
import type { RoomBoardBooking, RoomBoardResource } from "@/components/wellness/wellness-room-board";

export type WellnessMorphTodayProps = {
  morph: PresentationLayoutMorph;
  firstName: string | null | undefined;
  headerDate: string;
  livLine: string;
  oneThingHref: string;
  oneThingLabel: string;
  pendingCount: number;
  handoffCount: number;
  bookings: RoomBoardBooking[];
  businessName?: string;
  roomBoardFootnote?: string | null;
  bookingResources?: RoomBoardResource[];
  onAssignBookingToResource?: (bookingId: string, resourceId: string | null) => Promise<boolean>;
  assigningBookingId?: string | null;
  packageCreditSummary?: PackageCreditSummaryView | null;
  tomorrowStress?: { score: number; pendingBookings: number; roomConflicts: number } | null;
  vertical?: string | null;
  category?: string | null;
};

function greeting(firstName: string | null | undefined): string {
  const h = new Date().getHours();
  const prefix = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return `${prefix}, ${firstName?.trim() || "there"}`;
}

/** Full Today replacement — not the default briefing + KPI stack with a widget bolted on. */
export function WellnessMorphTodayHome({
  morph,
  firstName,
  headerDate,
  livLine,
  oneThingHref,
  oneThingLabel,
  pendingCount,
  handoffCount,
  bookings,
  businessName,
  roomBoardFootnote,
  bookingResources,
  onAssignBookingToResource,
  assigningBookingId,
  packageCreditSummary,
  tomorrowStress,
  vertical,
  category,
}: WellnessMorphTodayProps) {
  if (morph === "atrium") {
    return (
      <div
        className="wellness-morph-today wellness-morph-today--atrium w-full min-w-0"
        data-testid="wellness-morph-today-atrium"
      >
        <div className="wellness-atrium-hero rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/15 via-card to-background px-5 py-5 md:px-8 md:py-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1
                className="text-2xl md:text-3xl font-serif tracking-tight"
                data-testid="owner-dashboard-greeting"
              >
                {greeting(firstName)}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {businessName ?? "Your studio"} · Rooms · {headerDate.split("·").pop()?.trim() ?? "today"}
              </p>
            </div>
            <p className="text-xs text-muted-foreground font-mono tabular-nums shrink-0">{headerDate}</p>
          </div>
          <div
            className="mt-4 rounded-xl border border-primary/25 bg-[hsl(40_33%_94%)] px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3"
            data-testid="owner-dashboard-briefing"
          >
            <div className="flex gap-2 min-w-0 flex-1">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-foreground/90 line-clamp-2">{livLine}</p>
            </div>
            {pendingCount > 0 ? (
              <Link href={oneThingHref} className="shrink-0">
                <Button size="sm" className="rounded-full gap-1.5">
                  {oneThingLabel}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
        <div className="mt-5">
          <WellnessAtriumSchedule
            bookings={bookings}
            resources={bookingResources}
            onAssignBookingToResource={onAssignBookingToResource}
            assigningBookingId={assigningBookingId}
            hero
            roomBoardFootnote={roomBoardFootnote}
            vertical={vertical}
            category={category}
          />
        </div>
        {tomorrowStress ? (
          <Link
            href="/wellness-reports"
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm"
            data-testid="wellness-tomorrow-stress"
          >
            <span className="font-medium">Tomorrow stress</span>
            <span className="font-serif text-lg tabular-nums">{tomorrowStress.score}</span>
            <span className="text-muted-foreground text-xs">/ 100</span>
          </Link>
        ) : null}
        <p className="mt-4 text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-1">
          <Link href="/wellness-reports" className="text-primary hover:underline">
            Reports
          </Link>
          <span aria-hidden>·</span>
          <Link href="/wellness-reception" className="text-primary hover:underline">
            Reception
          </Link>
          <span aria-hidden>·</span>
          <Link href="/bookings" className="text-primary hover:underline">
            Room calendar
          </Link>
          <span aria-hidden>·</span>
          <Link href="/day-packages" className="text-primary hover:underline">
            Packages
          </Link>
          {handoffCount > 0 ? (
            <>
              <span aria-hidden>·</span>
              <Link href="/inbox?lens=taken_over" className="text-primary hover:underline">
                {handoffCount} inbox handoff{handoffCount === 1 ? "" : "s"}
              </Link>
            </>
          ) : null}
        </p>
      </div>
    );
  }

  if (morph === "timeline-rail") {
    return (
      <div
        className="wellness-morph-today wellness-morph-today--timeline max-w-3xl w-full"
        data-testid="wellness-morph-today-timeline"
      >
        <header className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">My day</p>
          <h1 className="text-2xl font-bold tracking-tight mt-1" data-testid="owner-dashboard-greeting">
            {headerDate}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Practitioner timeline · buffer-aware</p>
        </header>
        <div
          className="rounded-lg border bg-card px-4 py-3 mb-4 text-sm"
          data-testid="owner-dashboard-briefing"
        >
          {livLine}
        </div>
        <WellnessTimelineSchedule bookings={bookings} vertical={vertical} category={category} />
        {pendingCount > 0 ? (
          <Link href={oneThingHref} className="inline-block mt-4">
            <Button variant="outline" size="sm">
              {oneThingLabel}
            </Button>
          </Link>
        ) : null}
      </div>
    );
  }

  if (morph === "ledger") {
    return (
      <div
        className="wellness-morph-today wellness-morph-today--ledger w-full min-w-0"
        data-testid="wellness-morph-today-ledger"
      >
        <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between mb-4">
          <div>
            <h1
              className="text-2xl font-serif tracking-tight"
              data-testid="owner-dashboard-greeting"
            >
              {greeting(firstName)}
            </h1>
            <p className="text-sm text-muted-foreground">Package credits · room utilisation</p>
          </div>
          <p className="text-xs font-mono text-muted-foreground">{headerDate}</p>
        </header>
        <div
          className="rounded-lg border border-primary/30 bg-card/80 px-4 py-3 mb-4 text-sm"
          data-testid="owner-dashboard-briefing"
        >
          <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">Liv · evening</span>
          <p className="mt-1 text-foreground/90">{livLine}</p>
        </div>
        <WellnessLedgerSchedule
          bookings={bookings}
          packageCreditSummary={packageCreditSummary}
          vertical={vertical}
          category={category}
        />
      </div>
    );
  }

  return null;
}
