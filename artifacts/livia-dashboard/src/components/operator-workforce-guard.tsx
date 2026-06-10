import { useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useBusiness } from "@/lib/business-context";
import { useTenantExperience } from "@/lib/tenant-experience-api";
import { useGetTenantCapabilities } from "@workspace/api-client-react";
import { operatorNeedsWorkforceNav } from "@workspace/policy";
import { PublicSurfaceLoading } from "@/components/public/public-surface-chrome";

/** Redirect solo operators away from Team / Rota until they add a second practitioner. */
export function OperatorWorkforceGuard({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const { business } = useBusiness();
  const bid = business?.id ?? "";
  const { data: tenantExperience } = useTenantExperience(bid || undefined);
  const { data: caps, isLoading } = useGetTenantCapabilities(bid, {
    query: { enabled: !!bid } as never,
  });

  const te = tenantExperience as { operator?: { tier?: string; activeStaffCount?: number } } | undefined;
  const staffCount = caps?.readinessFacts?.staffCount ?? te?.operator?.activeStaffCount ?? 1;
  const allowed = operatorNeedsWorkforceNav({
    tier: (business as { tier?: string } | null)?.tier ?? te?.operator?.tier ?? "solo",
    activeStaffCount: typeof staffCount === "number" ? staffCount : 1,
  });

  useEffect(() => {
    if (!bid || isLoading) return;
    if (!allowed) setLocation("/dashboard");
  }, [allowed, bid, isLoading, setLocation]);

  if (!bid || isLoading) return <PublicSurfaceLoading />;
  if (!allowed) return <PublicSurfaceLoading />;
  return <>{children}</>;
}
