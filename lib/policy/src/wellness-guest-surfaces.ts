/** Operator shortcuts to guest-facing surfaces (W5 / W6) — preview what end clients see. */

export type WellnessGuestSurfaceLink = {
  id: string;
  label: string;
  /** Path template — `{slug}` replaced with business slug */
  hrefTemplate: string;
  description: string;
  external?: boolean;
};

export const WELLNESS_GUEST_SURFACE_LINKS: readonly WellnessGuestSurfaceLink[] = [
  {
    id: "public-book",
    label: "Public book",
    hrefTemplate: "/b/{slug}",
    description: "Guest booking + gift purchase",
    external: true,
  },
  {
    id: "my-livia",
    label: "My Livia",
    hrefTemplate: "/my",
    description: "Guest wallet + package credits",
    external: true,
  },
  {
    id: "corporate",
    label: "Corporate",
    hrefTemplate: "/corporate-wellness",
    description: "Employer benefit portal preview",
  },
  {
    id: "premises",
    label: "Premises",
    hrefTemplate: "/p/{slug}",
    description: "Multi-site picker when enabled",
    external: true,
  },
] as const;

export function resolveWellnessGuestSurfaceHref(
  template: string,
  slug: string,
): string {
  return template.replace("{slug}", slug);
}
