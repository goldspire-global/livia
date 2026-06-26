import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GUEST_HUB_COPY, GUEST_HUB_WELCOME_SLIDES } from "@workspace/policy";
import { cn } from "@/lib/utils";

export function GuestHubWelcome({
  guestId,
  hubToken,
  welcomeCompleted,
  onCompleted,
}: {
  guestId: string;
  hubToken: string;
  welcomeCompleted?: boolean;
  onCompleted: () => void;
}) {
  const storageKey = `livia_guest_hub_welcome_${guestId}`;
  const [dismissed, setDismissed] = useState(() => {
    if (welcomeCompleted) return true;
    if (typeof window === "undefined") return false;
    return localStorage.getItem(storageKey) === "1";
  });
  const [slide, setSlide] = useState(0);
  const [busy, setBusy] = useState(false);

  if (dismissed) return null;

  const current = GUEST_HUB_WELCOME_SLIDES[slide]!;
  const isLast = slide >= GUEST_HUB_WELCOME_SLIDES.length - 1;

  async function finish() {
    setBusy(true);
    try {
      await fetch("/api/public/guest-hub/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Guest-Hub-Token": hubToken,
        },
        body: JSON.stringify({ welcomeCompleted: true }),
      });
      localStorage.setItem(storageKey, "1");
      setDismissed(true);
      onCompleted();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      className="border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card overflow-hidden"
      data-testid="guest-hub-welcome"
    >
      <CardContent className="py-8 px-6 text-center space-y-5 max-w-lg mx-auto">
        <p className="text-[10px] uppercase tracking-widest font-mono text-primary">
          {GUEST_HUB_COPY.welcomeTitle}
        </p>
        <h2 className="text-xl font-serif">{current.title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{current.body}</p>
        <div className="flex justify-center gap-1.5" aria-hidden>
          {GUEST_HUB_WELCOME_SLIDES.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 w-6 rounded-full transition-colors",
                i === slide ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          <Button
            type="button"
            variant="ghost"
            className="min-h-[44px]"
            disabled={busy}
            onClick={() => void finish()}
          >
            {GUEST_HUB_COPY.welcomeSkip}
          </Button>
          {isLast ? (
            <Button
              type="button"
              className="min-h-[44px]"
              disabled={busy}
              data-testid="guest-hub-welcome-done"
              onClick={() => void finish()}
            >
              {GUEST_HUB_COPY.welcomeDone}
            </Button>
          ) : (
            <Button
              type="button"
              className="min-h-[44px]"
              disabled={busy}
              onClick={() => setSlide((s) => s + 1)}
            >
              {GUEST_HUB_COPY.welcomeNext}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
