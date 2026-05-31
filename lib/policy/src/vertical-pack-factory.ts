import type { BusinessVertical, VerticalPack } from "./types";
import { businessVerticalSchema } from "./types";

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
  return pack;
}

/** All verticals that must have packs registered in `verticals.ts`. */
export const REQUIRED_BUSINESS_VERTICALS = businessVerticalSchema.options as BusinessVertical[];
