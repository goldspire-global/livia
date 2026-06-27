import { Link } from "wouter";

import { MarketingLayout } from "@/components/marketing-layout";
import { ConstellationPageHeader } from "@/components/constellation/constellation-page-header";
import { ConstellationInnerPage, ConstellationPainList } from "@/components/constellation/constellation-inner-page";
import { MarketingGetStartedCta } from "@/components/marketing-get-started-cta";
import { planMarketingCard } from "@/lib/pricing-catalog";

const hostCard = planMarketingCard("chair-host");

const HOST_POINTS = [
  "Start on Studio — run your floor and bookings like any shop",
  "Advertise a spare chair on your public book page (Settings)",
  "Upgrade to the Host plan when you link independent renters",
  `${hostCard.priceLabel.replace("/mo", "")}/mo base + per-renter — landlord dashboard without renter guest lists`,
  "Each renter runs Solo/Studio with their own Liv inbox and booking page",
];

export default function ForChairRentalPage() {
  return (
    <MarketingLayout active="For hosts">
      <ConstellationInnerPage narrow>
        <ConstellationPageHeader
          eyebrow="Chair rental"
          title={
            <>
              For <em>hosts</em>
            </>
          }
          subtitle="Most hosts run a studio first. Advertise chairs, then upgrade to the Host plan when renters are linked — their guests stay theirs."
        />

        <section className="mt-10">
          <p className="cst-section-label">How it works</p>
          <h2 className="text-lg font-medium mb-4">Studio first, Host when you link renters</h2>
          <ConstellationPainList items={HOST_POINTS} />
        </section>

        <p className="text-sm text-muted-foreground/80 mb-12 max-w-prose">
          See also{" "}
          <Link href="/pricing" className="cst-page-link">
            pricing
          </Link>{" "}
          and the{" "}
          <Link href="/verticals/hair" className="cst-page-link">
            hair & barbering
          </Link>{" "}
          vertical.
        </p>

        <MarketingGetStartedCta title="Start on Studio" />
      </ConstellationInnerPage>
    </MarketingLayout>
  );
}
