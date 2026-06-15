import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PublicSurfaceLoading } from "@/components/public/public-surface-chrome";
import { GuestHubShell } from "@/components/guest/guest-hub-chrome";
import { GuestHubAccountSettings } from "@/components/guest/guest-hub-account-settings";
import { GUEST_HUB_COPY, type GuestPreferredModality } from "@workspace/policy";
import { ArrowLeft } from "lucide-react";

const HUB_TOKEN_KEY = "livia_guest_hub_token";

type HubShop = {
  businessId: string;
  businessName: string;
  slug: string;
  logoUrl: string | null;
  imageUrl?: string | null;
  isFavorite: boolean;
  manageVisitUrl: string | null;
};

type HubView = {
  phoneE164: string;
  preferredModality?: GuestPreferredModality;
  packageCredits?: Array<{
    ledgerId: string;
    businessName: string;
    slug: string;
    packageName: string;
    creditsRemaining: number;
    creditsTotal: number;
    expiresAt: string | null;
    redemptionCode: string | null;
  }>;
  shops: HubShop[];
};

export default function MyLiviaAccountPage() {
  const [hubToken] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem(HUB_TOKEN_KEY) : null,
  );
  const [view, setView] = useState<HubView | null>(null);
  const [loading, setLoading] = useState(Boolean(hubToken));

  const loadView = useCallback(async (token: string) => {
    const r = await fetch("/api/public/guest-hub/me", {
      headers: { "X-Guest-Hub-Token": token },
    });
    if (!r.ok) throw new Error("session");
    return r.json() as Promise<HubView>;
  }, []);

  useEffect(() => {
    if (!hubToken) return;
    setLoading(true);
    loadView(hubToken)
      .then(setView)
      .catch(() => setView(null))
      .finally(() => setLoading(false));
  }, [hubToken, loadView]);

  if (!hubToken) {
    return (
      <GuestHubShell centered>
        <p className="text-sm text-center text-muted-foreground">{GUEST_HUB_COPY.signInRequired}</p>
        <Button asChild className="w-full">
          <Link href="/my">Sign in</Link>
        </Button>
      </GuestHubShell>
    );
  }

  if (loading) return <PublicSurfaceLoading />;

  if (!view) {
    return (
      <GuestHubShell centered>
        <p className="text-sm text-center text-muted-foreground">Session expired.</p>
        <Button asChild className="w-full">
          <Link href="/my">Back to My Livia</Link>
        </Button>
      </GuestHubShell>
    );
  }

  return (
    <GuestHubShell
      testId="guest-hub-account"
      phoneE164={view.phoneE164}
      hubToken={hubToken}
      sidebarShops={view.shops}
    >
      <Link
        href="/my"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {GUEST_HUB_COPY.backToVault}
      </Link>

      <GuestHubAccountSettings
        hubToken={hubToken}
        phoneE164={view.phoneE164}
        preferredModality={view.preferredModality ?? "ANY"}
        packageCredits={view.packageCredits ?? []}
        onPreferredUpdated={(next) => setView((v) => (v ? { ...v, preferredModality: next } : v))}
      />
    </GuestHubShell>
  );
}
