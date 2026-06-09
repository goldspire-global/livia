import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PublicBookLinkCard } from "@/components/settings/public-book-link-card";
import { clientGuestBookHref } from "@/lib/guest-book-url";
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
  const path = clientGuestBookHref(slug);

  const refreshPreview = () => setFrameKey((k) => k + 1);

  return (
    <div className="space-y-4" data-testid="onboarding-public-link-split">
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
