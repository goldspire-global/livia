import {
  isMarketingDemoWedgeUnlocked,
  type BusinessVertical,
} from "@workspace/policy";

/** Curated G1 worlds — parity with dashboard `lib/g1-wedge-worlds.ts`. */
export type G1WedgeWorld = {
  key: string;
  vertical: BusinessVertical;
  demoSlug: string;
  businessLabel: string;
  title: string;
  tagline: string;
  imagePath: string;
  photoPosition?: string;
};

export const G1_WEDGE_WORLDS: G1WedgeWorld[] = [
  {
    key: "tattoo",
    vertical: "body-art",
    demoSlug: "ink-anchor-galway",
    businessLabel: "Ink Anchor · Galway",
    title: "Tattoo studio",
    tagline: "Ink stories. Build legacies.",
    imagePath: "/w2-gateway/cards/tattoo.jpg",
    photoPosition: "center 22%",
  },
  {
    key: "barber",
    vertical: "hair",
    demoSlug: "dublin-barber-collective",
    businessLabel: "Dublin Barber Collective",
    title: "Barber shop",
    tagline: "Craft fades. Build culture.",
    imagePath: "/w2-gateway/cards/barber.jpg",
    photoPosition: "62% center",
  },
  {
    key: "medspa",
    vertical: "medspa",
    demoSlug: "clarity-medspa-dublin",
    businessLabel: "Clarity Medspa · Dublin",
    title: "Medspa",
    tagline: "Elevate care. Empower transformation.",
    imagePath: "/w2-gateway/cards/medspa.jpg",
    photoPosition: "center 35%",
  },
  {
    key: "hair",
    vertical: "hair",
    demoSlug: "luxe-salon-spa",
    businessLabel: "Luxe Salon & Spa",
    title: "Hair salon",
    tagline: "Style lives. Shape confidence.",
    imagePath: "/w2-gateway/cards/hair.jpg",
    photoPosition: "center 28%",
  },
  {
    key: "beauty",
    vertical: "beauty",
    demoSlug: "bloom-beauty-dublin",
    businessLabel: "Bloom Beauty · Dublin",
    title: "Beauty studio",
    tagline: "Bloom Beauty · lash, brow & nails",
    imagePath: "/w2-gateway/cards/beauty.jpg",
    photoPosition: "center 40%",
  },
  {
    key: "wellness",
    vertical: "wellness",
    demoSlug: "harbour-wellness-cork",
    businessLabel: "Harbour Wellness · Cork",
    title: "Wellness studio",
    tagline: "Balance body. Align energy. Live well.",
    imagePath: "/w2-gateway/cards/wellness.jpg",
    photoPosition: "center 30%",
  },
];

export function listG1WedgeWorldsForDisplay(): G1WedgeWorld[] {
  return G1_WEDGE_WORLDS.map((world, index) => ({ world, index }))
    .sort((a, b) => {
      const tier = (v: BusinessVertical) => (isMarketingDemoWedgeUnlocked(v) ? 0 : 1);
      return tier(a.world.vertical) - tier(b.world.vertical) || a.index - b.index;
    })
    .map(({ world }) => world);
}

export function isG1WedgeWorldUnlocked(vertical: BusinessVertical): boolean {
  return isMarketingDemoWedgeUnlocked(vertical);
}

export function resolveG1WedgeWorld(
  vertical: BusinessVertical,
  worldKey?: string | null,
): G1WedgeWorld | null {
  if (worldKey) {
    const byKey = G1_WEDGE_WORLDS.find((w) => w.key === worldKey);
    if (byKey) return byKey;
  }
  return G1_WEDGE_WORLDS.find((w) => w.vertical === vertical) ?? null;
}

export function g1TaglineForWorld(world: G1WedgeWorld | null): string | null {
  return world?.tagline ?? null;
}

export function g1TitleForWorld(world: G1WedgeWorld | null): string | null {
  return world?.title ?? null;
}
