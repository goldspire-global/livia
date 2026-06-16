/**
 * Session pack catalog — buy on /b, credits on ledger, burn at book.
 * Child of commitment-gate → commitment-package-credit → commitment-pack-purchase.
 */
import { verticalSupportsPackageCreditCommitment } from "./booking-commitment-program";
import type { BusinessVertical } from "./types";

export type PackageCatalogServiceMeta = {
  name?: string | null;
  category?: string | null;
  serviceKind?: string | null;
  description?: string | null;
  priceMinor?: number;
  durationMinutes?: number;
};

/** Catalog row that sells credits — not a bookable appointment slot. */
export function isPackageCatalogService(meta: PackageCatalogServiceMeta): boolean {
  const cat = (meta.category ?? "").toLowerCase();
  const kind = (meta.serviceKind ?? "").toLowerCase();
  if (cat === "package" || kind === "package" || kind === "class_pack") return true;
  const name = (meta.name ?? "").toLowerCase();
  return /\bpack\b/.test(name) || /\d+\s*session/.test(name);
}

/** Infer session count from service name/description. */
export function inferPackageSessionCredits(meta: PackageCatalogServiceMeta): number {
  const text = `${meta.name ?? ""} ${meta.description ?? ""}`;
  const m = text.match(/(\d+)\s*[- ]?session/i);
  if (m?.[1]) {
    const n = parseInt(m[1], 10);
    if (Number.isFinite(n) && n > 0 && n <= 500) return n;
  }
  return 10;
}

export function packageCatalogPublicLabel(meta: PackageCatalogServiceMeta): string {
  const credits = inferPackageSessionCredits(meta);
  return `${credits} sessions · pay once, book anytime`;
}

export function verticalAllowsPackageCatalog(
  vertical: BusinessVertical | string | null | undefined,
): boolean {
  return verticalSupportsPackageCreditCommitment(vertical);
}
