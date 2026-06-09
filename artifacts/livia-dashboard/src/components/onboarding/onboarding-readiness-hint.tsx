import { Link } from "wouter";
import { useGetLivSetupGuidedFlow } from "@workspace/api-client-react";
import {
  nextRecommendedActWithReadiness,
  ONBOARDING_ACT_HREF,
  type OnboardingActId,
  type OnboardingState,
} from "@workspace/policy";
import { ONBOARDING_ACT_LABELS } from "@/lib/onboarding-acts";
import type { OnboardingStatePayload } from "./onboarding-wizard";

type Props = {
  businessId: string;
  state: OnboardingStatePayload | null;
};

/** Surfaces capability-readiness act hints during onboarding wizard. */
export function OnboardingReadinessHint({ businessId, state }: Props) {
  const { data: guidedFlow } = useGetLivSetupGuidedFlow(businessId, {
    query: { enabled: !!businessId } as never,
  });

  const hints = (guidedFlow?.readinessActHints ?? []) as OnboardingActId[];
  if (hints.length === 0) return null;

  const act = nextRecommendedActWithReadiness(state as OnboardingState | null, hints);
  const completed = new Set(state?.completedActs ?? []);
  if (completed.has(act)) return null;

  const href = ONBOARDING_ACT_HREF[act] ?? "/onboarding";
  const label = ONBOARDING_ACT_LABELS[act] ?? act;
  const blocker = guidedFlow?.capabilityBlockers[0];

  return (
    <div
      className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm space-y-1"
      data-testid="onboarding-readiness-hint"
    >
      <p className="font-medium text-amber-900 dark:text-amber-100">
        Next up: {label}
      </p>
      {blocker ? (
        <p className="text-muted-foreground text-xs">
          {blocker.blocker}
        </p>
      ) : null}
      <Link href={href} className="text-xs text-primary underline-offset-2 hover:underline">
        Go to {label} →
      </Link>
    </div>
  );
}
