import { OwnerIntelligenceStack } from "./owner-intelligence-stack";

/** @deprecated Use OwnerIntelligenceStack variant="commerce-only" */
export function CommerceSignalsPanel({ className }: { className?: string }) {
  return <OwnerIntelligenceStack variant="commerce-only" className={className} />;
}
