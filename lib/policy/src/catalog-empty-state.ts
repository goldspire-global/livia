/**
 * Catalog / services page empty state — vertical vocabulary, not salon-default icons.
 */
import { businessVocabulary, resolveVerticalKey } from "./vocabulary";

export type CatalogEmptyIcon = "calendar" | "scissors" | "sparkles" | "heart" | "layers";

export function catalogEmptyIcon(vertical?: string | null): CatalogEmptyIcon {
  const key = resolveVerticalKey(vertical);
  if (key === "hair") return "scissors";
  if (key === "beauty") return "sparkles";
  if (key === "wellness" || key === "allied-health" || key === "medspa") return "heart";
  if (key === "fitness" || key === "pet-grooming") return "calendar";
  return "layers";
}

export function catalogEmptyState(vertical?: string | null) {
  const v = businessVocabulary(vertical);
  const noun = v.serviceNoun.toLowerCase();
  const plural = noun.endsWith("s") ? noun : `${noun}s`;
  return {
    title: `No ${plural} yet`,
    body: `Create your first ${noun} to start taking bookings`,
    icon: catalogEmptyIcon(vertical),
  };
}
