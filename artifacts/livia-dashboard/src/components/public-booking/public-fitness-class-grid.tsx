import { useEffect, useState } from "react";
import { formatDate, formatTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type FitnessClass = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  enrolled: number;
  spotsLeft: number;
  waitlistOpen: boolean;
  coachName: string | null;
};

type EnrollResult = {
  ok: boolean;
  message: string;
};

export function PublicFitnessClassGrid({ slug }: { slug: string }) {
  const [classes, setClasses] = useState<FitnessClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<EnrollResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/public/b/${encodeURIComponent(slug)}/classes`)
      .then((r) => (r.ok ? r.json() : { classes: [] }))
      .then((j: { classes?: FitnessClass[] }) => {
        if (!cancelled) setClasses(j.classes ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function enroll(sessionId: string) {
    if (!firstName.trim() || phone.trim().length < 8) {
      setResult({ ok: false, message: "Add your name and mobile to enroll." });
      return;
    }
    setEnrollingId(sessionId);
    setResult(null);
    try {
      const r = await fetch(
        `/api/public/b/${encodeURIComponent(slug)}/classes/${encodeURIComponent(sessionId)}/enroll`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerFirstName: firstName.trim(),
            customerPhone: phone.trim(),
            saveToMyLivia: true,
          }),
        },
      );
      const j = (await r.json().catch(() => ({}))) as { error?: string; status?: string };
      if (!r.ok) throw new Error(j.error ?? "Could not enroll");
      setResult({
        ok: true,
        message:
          j.status === "waitlisted"
            ? "You are on the waitlist — we will text when a spot opens."
            : "You are in — see you at class!",
      });
      setActiveId(null);
    } catch (e) {
      setResult({
        ok: false,
        message: e instanceof Error ? e.message : "Could not enroll",
      });
    } finally {
      setEnrollingId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground py-4">Loading class schedule…</p>;
  }
  if (classes.length === 0) return null;

  return (
    <section className="mt-10 scroll-mt-16" id="public-book-classes" data-testid="public-fitness-classes">
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <h3 className="text-sm font-medium" style={{ fontFamily: "var(--app-font-serif)" }}>
          Group classes
        </h3>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground tabular-nums">
          {classes.length} upcoming
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Book a class directly — no time-slot picker needed.
      </p>

      {result ? (
        <p
          className={cn(
            "text-sm rounded-lg px-3 py-2 mb-4",
            result.ok
              ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
              : "bg-destructive/10 text-destructive",
          )}
        >
          {result.message}
        </p>
      ) : null}

      <div className="space-y-3">
        {classes.map((c) => {
          const open = activeId === c.id;
          const full = c.spotsLeft === 0 && !c.waitlistOpen;
          return (
            <div
              key={c.id}
              className="rounded-xl border border-border/80 p-4 transition-colors hover:border-primary/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{c.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {formatDate(c.startsAt)} · {formatTime(c.startsAt)}
                  </p>
                  {c.coachName ? (
                    <p className="text-xs text-muted-foreground mt-1">with {c.coachName}</p>
                  ) : null}
                </div>
                <Badge variant="secondary" className="shrink-0 gap-1 tabular-nums">
                  <Users className="h-3 w-3" />
                  {c.waitlistOpen
                    ? "Waitlist"
                    : full
                      ? "Full"
                      : `${c.spotsLeft} left`}
                </Badge>
              </div>

              {!open ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  disabled={full}
                  onClick={() => setActiveId(c.id)}
                >
                  {c.waitlistOpen ? "Join waitlist" : "Enroll"}
                </Button>
              ) : (
                <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor={`class-fn-${c.id}`}>First name</Label>
                      <Input
                        id={`class-fn-${c.id}`}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`class-ph-${c.id}`}>Mobile</Label>
                      <Input
                        id={`class-ph-${c.id}`}
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={enrollingId === c.id}
                      onClick={() => void enroll(c.id)}
                    >
                      {enrollingId === c.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : c.waitlistOpen ? (
                        "Confirm waitlist"
                      ) : (
                        "Confirm enroll"
                      )}
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setActiveId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
