import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useBusiness } from "@/lib/business-context";
import { apiFetch } from "@/lib/api-fetch";
import { OperationalPageShell } from "@/components/layout/operational-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WELLNESS_CHAIN_COPY } from "@workspace/policy";
import { ArrowRight, MapPin } from "lucide-react";

type ChainGlance = {
  sites: Array<{
    businessId: string;
    name: string;
    slug: string;
    packagesRemaining: number;
    tomorrowStress: number;
  }>;
  guestVaultNote: string;
  brandGiftEnabled: boolean;
};

export default function WellnessChainPage() {
  const { business } = useBusiness();
  const bid = business?.id ?? "";
  const [data, setData] = useState<ChainGlance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bid) return;
    setLoading(true);
    void apiFetch<ChainGlance>(`/api/businesses/${bid}/wellness/chain-glance`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [bid]);

  const isCurrentSite = (siteId: string) => siteId === bid;

  return (
    <OperationalPageShell
      title={WELLNESS_CHAIN_COPY.pageTitle}
      subtitle={WELLNESS_CHAIN_COPY.pageSubtitle}
      width="full"
      data-testid="wellness-chain-page"
      actions={
        <Button asChild size="sm" variant="outline" className="h-8 text-xs">
          <Link href="/wellness-reports">Group reports</Link>
        </Button>
      }
    >
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" aria-hidden />
            {WELLNESS_CHAIN_COPY.glanceTitle}
          </CardTitle>
          <CardDescription>{WELLNESS_CHAIN_COPY.transferMemoryBody}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="px-4 pb-4 text-sm text-muted-foreground">Loading locations…</p>
          ) : !data?.sites.length ? (
            <p className="px-4 pb-4 text-sm text-muted-foreground">{WELLNESS_CHAIN_COPY.emptySites}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-t border-b bg-muted/40 text-left text-xs text-muted-foreground">
                    <th className="px-4 py-2 font-medium">Location</th>
                    <th className="px-4 py-2 font-medium" title={WELLNESS_CHAIN_COPY.packsHint}>
                      Pack credits
                    </th>
                    <th className="px-4 py-2 font-medium" title={WELLNESS_CHAIN_COPY.stressHint}>
                      Tomorrow stress
                    </th>
                    <th className="px-4 py-2 font-medium sr-only">Open</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sites.map((site) => (
                    <tr key={site.businessId} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">
                        {site.name}
                        {isCurrentSite(site.businessId) ? (
                          <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                            you are here
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">
                        {site.packagesRemaining}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        <span
                          className={
                            site.tomorrowStress >= 70
                              ? "text-amber-700 dark:text-amber-400 font-medium"
                              : "text-muted-foreground"
                          }
                        >
                          {site.tomorrowStress}/100
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isCurrentSite(site.businessId) ? (
                          <Link href="/dashboard" className="text-primary inline-flex items-center gap-1 text-xs">
                            {WELLNESS_CHAIN_COPY.openSiteLabel}
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">Switch in header</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {data?.brandGiftEnabled ? (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{WELLNESS_CHAIN_COPY.brandGiftTitle}.</span>{" "}
          {WELLNESS_CHAIN_COPY.brandGiftBody}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link href="/wellness-guest-vault" className="text-primary">
          Guest vault →
        </Link>
        <Link href="/wellness-reports" className="text-primary">
          Reports →
        </Link>
        <Link href="/corporate-wellness" className="text-primary">
          Corporate portal →
        </Link>
      </div>

      {data?.guestVaultNote ? (
        <p className="text-xs text-muted-foreground">{data.guestVaultNote}</p>
      ) : null}
    </OperationalPageShell>
  );
}
