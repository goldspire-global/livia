import React from "react";
import { OwnerIntelligenceHub } from "./OwnerIntelligenceHub";

/** @deprecated Consolidated into OwnerIntelligenceHub. */
export function TwinBriefCard({ businessId }: { businessId: string }) {
  return <OwnerIntelligenceHub businessId={businessId} />;
}
