import { OwnerIntelligenceStack } from "@/components/dashboard/owner-intelligence-stack";

/** @deprecated Use OwnerIntelligenceStack variant="twin-only" */
export function TwinInsightsCard({ className }: { className?: string }) {
  return <OwnerIntelligenceStack variant="twin-only" className={className} />;
}
