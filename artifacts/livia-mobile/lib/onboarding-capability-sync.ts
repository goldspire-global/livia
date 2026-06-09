import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetBusinessQueryKey,
  getGetLivSetupGuidedFlowQueryKey,
} from "@workspace/api-client-react";

/** Refresh onboarding when capability readiness auto-completes acts. */
export function useOnboardingCapabilitySync(
  businessId: string,
  autoAdvanced: string[] | undefined,
) {
  const qc = useQueryClient();
  const syncedKeyRef = useRef("");

  useEffect(() => {
    if (!businessId || !autoAdvanced?.length) return;
    const key = autoAdvanced.slice().sort().join(",");
    if (syncedKeyRef.current === key) return;
    syncedKeyRef.current = key;

    void qc.invalidateQueries({ queryKey: getGetBusinessQueryKey(businessId) });
    void qc.invalidateQueries({ queryKey: getGetLivSetupGuidedFlowQueryKey(businessId) });
  }, [businessId, autoAdvanced, qc]);
}
