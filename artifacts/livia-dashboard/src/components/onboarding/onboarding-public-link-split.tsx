import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PublicBookLinkCard } from "@/components/settings/public-book-link-card";
import { clientGuestBookHref } from "@/lib/guest-book-url";
import { apiFetch } from "@/lib/api-fetch";
import { MOTION } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { OnboardingPresentationPick } from "./onboarding-presentation-pick";

type Props = {
  slug: string;
  businessName?: string;
  businessId?: string | null;
  onPresentationReviewed?: () => void;
};

export function OnboardingPublicLinkSplit({
  slug,
  businessName,
  businessId,
  onPresentationReviewed,
}: Props) {
  const { toast } = useToast();
  const [frameKey, setFrameKey] = useState(0);
  const [hasHours, setHasHours] = useState<boolean | null>(null);
  const path = clientGuestBookHref(slug);

  useEffect(() => {
    if (!businessId) return;
    void apiFetch<{ dayOfWeek: number }[]>(`/businesses/${businessId}/availability`)
      .then((rules) => setHasHours(rules.some((r) => r.dayOfWeek != null)))
      .catch(() => setHasHours(false));
  }, [businessId, frameKey]);

  const refreshPreview = () => setFrameKey((k) => k + 1);

  return (
    <div className="space-y-4" data-testid="onboarding-public-link-split">
      {hasHours === false ? (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-foreground">
          No opening hours yet — go back to the <strong>Hours</strong> step and save when you&apos;re
          open. Your booking page cannot show times until then.
        </p>
      ) : null}
      {businessId ? (
        <OnboardingPresentationPick
          businessId={businessId}
          onReviewed={() => {
            refreshPreview();
            onPresentationReviewed?.();
          }}
        />
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="space-y-3">
          <PublicBookLinkCard
            slug={slug}
            businessName={businessName}
            onCopy={() => toast({ title: "Link copied" })}
          />
          <Button type="button" variant="ghost" size="sm" onClick={refreshPreview}>
            Refresh preview
          </Button>
        </div>
        <div className="relative overflow-hidden rounded-xl border-2 border-primary/25 bg-background min-h-[300px] lg:min-h-[380px] ring-1 ring-primary/10">
          <iframe
            key={frameKey}
            title="Booking page preview"
            src={path}
            className={cn("h-full min-h-[280px] lg:min-h-[360px] w-full border-0", MOTION.enterPanel)}
          />
        </div>
      </div>
    </div>
  );
}
