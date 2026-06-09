import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetBusinessQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetLivSetupGuidedFlowQueryKey,
} from "@workspace/api-client-react";
import { ONBOARDING_ACT_LABELS, type OnboardingActId } from "@workspace/policy";
import { useToast } from "@/hooks/use-toast";

/** Refresh onboarding + dashboard when capability readiness auto-completes acts. */
export function useOnboardingCapabilitySync(
  businessId: string,
  autoAdvanced: string[] | undefined,
) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const syncedKeyRef = useRef("");

  useEffect(() => {
    if (!businessId || !autoAdvanced?.length) return;
    const key = autoAdvanced.slice().sort().join(",");
    if (syncedKeyRef.current === key) return;
    syncedKeyRef.current = key;

    const labels = autoAdvanced.map(
      (act) => ONBOARDING_ACT_LABELS[act as OnboardingActId] ?? act,
    );
    toast({
      title: "Setup step completed",
      description: `Readiness cleared: ${labels.join(", ")}`,
    });

    void qc.invalidateQueries({ queryKey: getGetBusinessQueryKey(businessId) });
    void qc.invalidateQueries({ queryKey: getGetLivSetupGuidedFlowQueryKey(businessId) });
    void qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey(businessId) });
  }, [businessId, autoAdvanced, qc, toast]);
}
