import type { BusinessVertical, VerticalPack } from "./types";
import { businessVerticalSchema } from "./types";
import { validateVerticalPresentationPack } from "./presentation-surface";

/**
 * Register a vertical capability pack (R3 hub factory).
 * Today: validates shape; future: single registration point for lifecycle consumers.
 */
export function defineVerticalPack(pack: VerticalPack): VerticalPack {
  const vertical = pack.vertical;
  if (!businessVerticalSchema.options.includes(vertical)) {
    throw new Error(`defineVerticalPack: unknown vertical "${vertical}"`);
  }
  if (!pack.label?.trim()) {
    throw new Error(`defineVerticalPack: label required for ${vertical}`);
  }
  if (!pack.defaultServices?.length) {
    throw new Error(`defineVerticalPack: defaultServices required for ${vertical}`);
  }
  const handshake = validateVerticalPresentationPack(vertical);
  if (!handshake.ok) {
    throw new Error(`defineVerticalPack: presentation handshake failed for ${vertical}: ${handshake.errors.join("; ")}`);
  }
  return pack;
}

/** All verticals that must have packs registered in `verticals.ts`. */
export const REQUIRED_BUSINESS_VERTICALS = businessVerticalSchema.options as BusinessVertical[];
