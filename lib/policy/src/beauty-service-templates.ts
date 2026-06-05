/**
 * Quick-add treatment templates for beauty onboarding and /services.
 */
export type BeautyServiceTemplate = {
  name: string;
  category: string;
  durationMinutes: number;
  priceMinor: number;
  description?: string;
};

export const BEAUTY_SERVICE_CATEGORIES = [
  "Lashes",
  "Nails",
  "Brows",
  "Wax",
  "Facial",
  "Other",
] as const;

export const BEAUTY_SERVICE_TEMPLATES: BeautyServiceTemplate[] = [
  {
    name: "Lash fill",
    category: "Lashes",
    durationMinutes: 60,
    priceMinor: 5500,
    description: "Maintenance fill — 2–3 week cycle.",
  },
  {
    name: "Classic lash full set",
    category: "Lashes",
    durationMinutes: 120,
    priceMinor: 8500,
    description: "New set — allow time for consultation.",
  },
  {
    name: "Gel manicure",
    category: "Nails",
    durationMinutes: 45,
    priceMinor: 3500,
  },
  {
    name: "Classic manicure",
    category: "Nails",
    durationMinutes: 45,
    priceMinor: 3000,
  },
  {
    name: "Brow shape & tint",
    category: "Brows",
    durationMinutes: 30,
    priceMinor: 2500,
  },
  {
    name: "Brow lamination",
    category: "Brows",
    durationMinutes: 60,
    priceMinor: 4500,
  },
  {
    name: "Patch test",
    category: "Lashes",
    durationMinutes: 15,
    priceMinor: 0,
    description: "Required 24–48h before first lash or tint service.",
  },
];
