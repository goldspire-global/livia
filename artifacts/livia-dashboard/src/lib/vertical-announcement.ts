import type { WelcomedVerticalAnnouncement } from "@workspace/policy";
import { useTenantExperience } from "@/lib/tenant-experience-api";

/** Read welcomed vertical announcement from tenant-experience (flows down from policy hub). */
export function useWelcomedVerticalAnnouncement(businessId: string | undefined) {
  const { data } = useTenantExperience(businessId);
  return (data as { announcement?: WelcomedVerticalAnnouncement } | undefined)?.announcement;
}
