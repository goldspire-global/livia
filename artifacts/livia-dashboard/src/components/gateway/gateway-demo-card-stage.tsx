import {
  Calendar,
  ClipboardCheck,
  ImageIcon,
  Inbox,
  Loader2,
  MessageSquare,
  Sparkles,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import type { WedgeDemoBeat } from "@workspace/policy";
import type { DemoRosterEntry } from "@/lib/demo-portal";
import { cn } from "@/lib/utils";

const CROP_META: Record<
  string,
  { label: string; icon: LucideIcon; chip: string; ring: string }
> = {
  inbox: {
    label: "Inbox",
    icon: Inbox,
    chip: "bg-violet-500/15 text-violet-300",
    ring: "border-violet-500/30",
  },
  "public-book": {
    label: "Book",
    icon: Calendar,
    chip: "bg-cyan-500/15 text-cyan-300",
    ring: "border-cyan-500/30",
  },
  proof: {
    label: "Proof",
    icon: ImageIcon,
    chip: "bg-amber-500/15 text-amber-300",
    ring: "border-amber-500/30",
  },
  consent: {
    label: "Consent",
    icon: ClipboardCheck,
    chip: "bg-rose-500/15 text-rose-300",
    ring: "border-rose-500/30",
  },
  sms: {
    label: "SMS",
    icon: MessageSquare,
    chip: "bg-emerald-500/15 text-emerald-300",
    ring: "border-emerald-500/30",
  },
  today: {
    label: "Today",
    icon: Sparkles,
    chip: "bg-sky-500/15 text-sky-300",
    ring: "border-sky-500/30",
  },
};

type Props = {
  tradeLabel: string;
  businessName: string;
  beat: WedgeDemoBeat;
  beatIndex: number;
  beatCount: number;
  enterMode: boolean;
  roster: DemoRosterEntry[];
  busy: string | null;
  disabled?: boolean;
  onNextBeat: () => void;
  onSelectRole: (email: string) => void;
};

export function GatewayDemoCardStage({
  tradeLabel,
  businessName,
  beat,
  beatIndex,
  beatCount,
  enterMode,
  roster,
  busy,
  disabled,
  onNextBeat,
  onSelectRole,
}: Props) {
  const meta = CROP_META[beat.cropHint] ?? CROP_META.inbox;
  const Icon = meta.icon;

  return (
    <article
      className="rounded-3xl border-2 border-aurum-champagne/50 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-1 shadow-[0_0_60px_-20px_rgba(34,211,238,0.35)]"
      data-testid="gateway-demo-card-stage"
    >
      <div className="rounded-[1.35rem] border border-primary/25 bg-[#0a0c12]/90 p-4 sm:p-5">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border bg-[#080a10] p-4 sm:min-h-[140px]",
            meta.ring,
          )}
        >
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" aria-hidden />
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary">{meta.label}</span>
          </div>
          <p className="mt-6 text-xs text-muted-foreground/80">Seeded demo · live product chrome</p>
          {!enterMode ? (
            <div
              className="absolute right-3 top-3 max-w-[200px] rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 backdrop-blur-sm"
              data-testid="gateway-sign-in-liv-briefing"
            >
              <p className="text-[10px] font-medium text-primary">Liv · briefing</p>
              <p className="mt-1 text-xs text-foreground/90">Patch test due — Emma, 2pm.</p>
            </div>
          ) : null}
        </div>

        <div className="mt-4 space-y-1">
          <p className="font-serif text-lg text-aurum-champagne/95">{tradeLabel}</p>
          {enterMode ? (
            <>
              <p className="text-base font-medium text-foreground">{businessName}</p>
              <p className="text-sm text-muted-foreground">
                Beat {beatIndex + 1} · {beat.headline}
              </p>
            </>
          ) : (
            <>
              <p className="text-base font-medium text-foreground">{beat.headline}</p>
              <p className="text-sm text-muted-foreground">{beat.detail}</p>
            </>
          )}
        </div>

        {enterMode ? (
          <div className="mt-5">
            <p className="mb-2 text-xs text-muted-foreground">Tap a role to enter the live demo</p>
            <div className="grid grid-cols-2 gap-2">
              {roster.map((entry) => {
                const loading = busy === entry.email;
                const primary = entry.role === "owner";
                return (
                  <button
                    key={entry.email}
                    type="button"
                    disabled={!!busy || disabled}
                    onClick={() => onSelectRole(entry.email)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-left transition disabled:opacity-60",
                      primary
                        ? "border-primary/50 bg-primary/15 hover:border-primary/70"
                        : "border-white/15 bg-white/5 hover:border-white/30",
                    )}
                  >
                    <span className="flex items-center justify-between gap-1">
                      <span className="text-sm font-medium">
                        {loading ? "Signing in…" : entry.label.split(" · ").pop()}
                      </span>
                      {!loading ? <ArrowRight className="h-3.5 w-3.5 text-primary" /> : null}
                    </span>
                    <span className="mt-0.5 block truncate text-[9px] font-mono text-muted-foreground">
                      {entry.email}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={onNextBeat}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            Next beat
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </article>
  );
}

export function GatewayBeatDots({
  beatIndex,
  beatCount,
  className,
}: {
  beatIndex: number;
  beatCount: number;
  className?: string;
}) {
  return (
    <div className={cn("flex justify-center gap-2", className)} aria-label={`Beat ${beatIndex + 1} of ${beatCount}`}>
      {Array.from({ length: beatCount }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-2.5 w-2.5 rounded-full transition-colors",
            i <= beatIndex ? "bg-primary" : "bg-primary/25",
          )}
        />
      ))}
    </div>
  );
}

export function GatewayBusyOverlay({ label }: { label: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-[#0c0e14] px-4 py-3 text-sm">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        {label}
      </div>
    </div>
  );
}
