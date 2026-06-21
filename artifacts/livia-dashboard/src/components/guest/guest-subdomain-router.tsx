import { useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import PublicBookingPage from "@/pages/public-booking";
import PublicVisitPage from "@/pages/public-visit";
import PublicProofPage from "@/pages/public-proof";
import PublicIntakePage from "@/pages/public-intake";
import PublicWaitlistPage from "@/pages/public-waitlist";
import PublicPayPage from "@/pages/public-pay";
import PublicBalancePage from "@/pages/public-balance";
import PublicShopPage from "@/pages/public-shop";
import PublicEventVendorSitePage from "@/pages/public-event-vendor-site";
import PublicEventVendorGalleryPage from "@/pages/public-event-vendor-gallery";
import PublicEventVendorServicesPage from "@/pages/public-event-vendor-services";
import PublicEventVendorAboutPage from "@/pages/public-event-vendor-about";
import PublicEventVendorEnquirePage from "@/pages/public-event-vendor-enquire";
import PublicEventVendorQuotePage from "@/pages/public-event-vendor-quote";
import PublicEventVendorMoodPage from "@/pages/public-event-vendor-mood";
import PublicEventVendorPlannerPage from "@/pages/public-event-vendor-planner";
import { PublicSurfaceLoading } from "@/components/public/public-surface-chrome";
import { resolveGuestBookSlugFromWindow } from "@/lib/guest-host-routing";

function GuestSubdomainHome({ slug }: { slug: string }) {
  const [mode, setMode] = useState<"loading" | "event" | "book">("loading");

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/public/${encodeURIComponent(slug)}/event-site`)
      .then((res) => {
        if (!cancelled) setMode(res.ok ? "event" : "book");
      })
      .catch(() => {
        if (!cancelled) setMode("book");
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (mode === "loading") return <PublicSurfaceLoading />;
  if (mode === "event") return <PublicEventVendorSitePage />;
  return <PublicBookingPage />;
}

type GuestSubdomainRouterProps = {
  slug?: string;
};

/** When hostname is `{slug}.livia-hq.com` or a verified custom domain, render guest surfaces. */
export function GuestSubdomainRouter({ slug: slugProp }: GuestSubdomainRouterProps) {
  const [slug, setSlug] = useState<string | null | undefined>(slugProp ?? undefined);

  useEffect(() => {
    if (slugProp) {
      setSlug(slugProp);
      return;
    }
    void resolveGuestBookSlugFromWindow().then(setSlug);
  }, [slugProp]);

  if (slug === undefined) return <PublicSurfaceLoading />;
  if (!slug) return null;

  return (
    <Switch>
      <Route path="/proof/:token" component={PublicProofPage} />
      <Route path="/intake/:token" component={PublicIntakePage} />
      <Route path="/waitlist/:token" component={PublicWaitlistPage} />
      <Route path="/pay/:token" component={PublicPayPage} />
      <Route path="/balance/:token" component={PublicBalancePage} />
      <Route path="/q/:token" component={PublicEventVendorQuotePage} />
      <Route path="/mood/:token" component={PublicEventVendorMoodPage} />
      <Route path="/planner/:token" component={PublicEventVendorPlannerPage} />
      <Route path="/enquire" component={PublicEventVendorEnquirePage} />
      <Route path="/gallery" component={PublicEventVendorGalleryPage} />
      <Route path="/services" component={PublicEventVendorServicesPage} />
      <Route path="/about" component={PublicEventVendorAboutPage} />
      <Route path="/shop/:token" component={PublicShopPage} />
      <Route path="/visit/:token" component={PublicVisitPage} />
      <Route>{() => <GuestSubdomainHome slug={slug} />}</Route>
    </Switch>
  );
}

import { mightBeGuestBookHost } from "@/lib/guest-host-routing";

export function isGuestSubdomainHost(): boolean {
  return mightBeGuestBookHost();
}
