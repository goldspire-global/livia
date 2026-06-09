import { Link } from "wouter";
import { useGetLivSetupGuidedFlow } from "@workspace/api-client-react";
import { useBusiness } from "@/lib/business-context";
import { isDemoTenantSlug } from "@/lib/demo-tenant";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import {
  buildSetupGuidedFlow,
  nextRecommendedActWithReadiness,
  ONBOARDING_ACT_HREF,
  type OnboardingActId,
  type OnboardingState,
} from "@workspace/policy";
import { ONBOARDING_ACT_LABELS } from "@/lib/onboarding-acts";

export function OnboardingProgressBanner() {
  const { business } = useBusiness();
  const raw = (business as { onboardingState?: OnboardingState } | null)?.onboardingState;
  const pct = raw?.percentComplete ?? 100;
  const bid = business?.id ?? "";

  const { data: guidedFlow } = useGetLivSetupGuidedFlow(bid, {
    query: { enabled: !!bid && pct < 100 } as never,
  });

  if (!business || isDemoTenantSlug(business.slug) || pct >= 100) return null;

  const readinessHints = (guidedFlow?.readinessActHints ?? []) as OnboardingActId[];
  const recommendedAct = nextRecommendedActWithReadiness(raw, readinessHints);
  const recommendedHref = ONBOARDING_ACT_HREF[recommendedAct] ?? "/onboarding";

  const flow =
    guidedFlow ??
    buildSetupGuidedFlow({
      onboardingState: raw,
      vertical: (business as { vertical?: string }).vertical,
      slug: business.slug,
      sacredMetricMet: raw?.checklist?.testBooking === true,
    });
  const current = flow.phases.find((p) => p.current);
  const readinessLabel = ONBOARDING_ACT_LABELS[recommendedAct];

  return (
    <div
      className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-aurora-cyan/30 bg-aurora-cyan/5 px-4 py-3"
      data-testid="onboarding-progress-banner"
    >
      <div className="flex items-center gap-2 text-sm min-w-0">
        <Sparkles className="h-4 w-4 text-aurora-cyan shrink-0" />
        <span className="truncate">
          Setup <strong>{pct}%</strong>
          {current ? (
            <>
              {" "}
              — <strong>{current.label}</strong>: {current.headline}
            </>
          ) : (
            " — finish onboarding so Liv can go live."
          )}
          {readinessHints.length > 0 ? (
            <>
              {" "}
              · readiness: <strong>{readinessLabel}</strong>
            </>
          ) : null}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 shrink-0">
        <Button size="sm" variant="outline" asChild>
          <Link href="/settings?tab=liv">Ask Liv</Link>
        </Button>
        <Button size="sm" variant="secondary" asChild>
          <Link href={readinessHints.length > 0 ? recommendedHref : flow.nextHref}>Continue</Link>
        </Button>
      </div>
    </div>
  );
}
