import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import type { PublicServiceRow } from "@/lib/public-booking-helpers";
import {
  PublicBookBeautyDualCta,
  PublicBookBeautyTrustFooter,
} from "@/components/public-booking/public-book-beauty-chrome";
import { PublicCareNotes } from "@/components/public-booking/public-care-notes";

export function PublicBookBookingRail({
  beautyBook,
  beautyPublic,
  wellnessPublic,
  selectedService,
  aiOn,
  onBook,
  onChat,
  bookDisabled,
  pickServiceHint,
  cancelWindowHours,
  vertical,
  category,
  giftComingSoonNote,
  className,
}: {
  beautyBook: boolean;
  beautyPublic: boolean;
  wellnessPublic: boolean;
  selectedService: PublicServiceRow | null;
  aiOn: boolean;
  onBook: () => void;
  onChat?: () => void;
  bookDisabled: boolean;
  pickServiceHint: boolean;
  cancelWindowHours?: number | null;
  vertical?: string | null;
  category?: string | null;
  giftComingSoonNote?: string | null;
  className?: string;
}) {
  if (!beautyBook && !wellnessPublic) return null;

  return (
    <div
      className={cn("space-y-4", className)}
      data-testid="public-book-booking-rail"
    >
      {selectedService ? (
        <div
          className={cn(
            "rounded-xl border border-border/80 bg-card/80 p-3.5",
            pickServiceHint && "ring-2 ring-primary/40",
          )}
          data-testid="public-book-selected-service"
        >
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Selected
          </p>
          <p
            className="text-base font-medium leading-snug"
            style={{ fontFamily: "var(--app-font-serif)" }}
          >
            {selectedService.name}
          </p>
          <p className="text-sm text-primary mt-1 tabular-nums">
            {selectedService.priceMinor === 0
              ? "Free"
              : formatCurrency(selectedService.priceMinor, selectedService.currency)}
            <span className="text-muted-foreground font-normal">
              {" "}
              · {selectedService.durationMinutes} min
            </span>
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground rounded-lg border border-dashed border-border/80 px-3 py-2.5">
          {beautyPublic
            ? "Choose a treatment from the menu to continue."
            : "Tap a treatment to pick a time — or chat with Liv if you are unsure."}
        </p>
      )}

      {beautyPublic ? (
        <>
          <PublicBookBeautyDualCta
            bookLabel="Book now"
            showChat={aiOn}
            onChat={onChat}
            bookDisabled={bookDisabled}
            onBook={onBook}
          />
          <PublicBookBeautyTrustFooter cancelWindowHours={cancelWindowHours} />
        </>
      ) : (
        <>
          {giftComingSoonNote ? (
            <p
              className="text-xs text-muted-foreground rounded-lg border border-dashed px-3 py-2"
              data-testid="public-wellness-gift-soon"
            >
              {giftComingSoonNote}
            </p>
          ) : null}
          <PublicCareNotes vertical={vertical} category={category} />
        </>
      )}
    </div>
  );
}
