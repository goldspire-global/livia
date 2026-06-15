import type { BusinessVertical } from "@workspace/policy";
import {
  inferPublicServiceImageFromName,
  PUBLIC_SERVICE_IMAGE_KEYWORDS,
  PLATFORM_DEFAULT_PRESET_ID,
  resolveJurisdictionCode,
  resolvePresentationPreset,
} from "@workspace/policy";

const SHELL: Record<BusinessVertical, string> = {
  hair: "warm",
  beauty: "soft",
  "body-art": "bold",
  wellness: "soft",
  fitness: "bold",
  medspa: "clinical",
  "allied-health": "clinical",
  "pet-grooming": "playful",
  "automotive-detailing": "industrial",
  "event-vendors": "warm",
};

const DISPLAY: Record<BusinessVertical, "serif" | "sans"> = {
  hair: "serif",
  beauty: "serif",
  "body-art": "sans",
  wellness: "serif",
  fitness: "sans",
  medspa: "sans",
  "allied-health": "sans",
  "pet-grooming": "sans",
  "automotive-detailing": "sans",
  "event-vendors": "serif",
};

export function publicExperienceSkin(vertical?: string | null, country?: string | null) {
  const v = (vertical ?? "hair") as BusinessVertical;
  return {
    shell: SHELL[v] ?? "warm",
    display: DISPLAY[v] ?? "serif",
    market: resolveJurisdictionCode(country).toLowerCase(),
  };
}

/** Tenant presentation on public /b guest surfaces — matches GET /public/b/:slug book payload. */
export function buildPublicGuestExperienceSkin(biz: {
  vertical?: string | null;
  country?: string | null;
  presentationPresetId?: string | null;
  brandAccentHex?: string | null;
}) {
  const preset = resolvePresentationPreset(
    (biz.vertical ?? "hair") as BusinessVertical,
    biz.presentationPresetId ?? PLATFORM_DEFAULT_PRESET_ID,
  );
  return {
    ...publicExperienceSkin(biz.vertical, biz.country),
    presentation: preset.cssPreset,
    presentationColorMode: preset.tokens.colorMode,
    brandAccentHex: biz.brandAccentHex ?? null,
  };
}

const VERTICAL_FALLBACK: Record<BusinessVertical, string> = {
  hair: PUBLIC_SERVICE_IMAGE_KEYWORDS.cut!,
  beauty: PUBLIC_SERVICE_IMAGE_KEYWORDS.lash!,
  "body-art": PUBLIC_SERVICE_IMAGE_KEYWORDS.tattoo!,
  wellness: PUBLIC_SERVICE_IMAGE_KEYWORDS.massage!,
  fitness: PUBLIC_SERVICE_IMAGE_KEYWORDS.fitness!,
  medspa: PUBLIC_SERVICE_IMAGE_KEYWORDS.consult!,
  "allied-health": PUBLIC_SERVICE_IMAGE_KEYWORDS.physio!,
  "pet-grooming": PUBLIC_SERVICE_IMAGE_KEYWORDS.groom!,
  "automotive-detailing": PUBLIC_SERVICE_IMAGE_KEYWORDS.detail!,
  "event-vendors": "/event-vendor-media/wedding-reception.jpg",
};

export function inferDemoServiceImageUrl(
  serviceName: string,
  vertical?: BusinessVertical | null,
): string | undefined {
  if (vertical === "body-art") {
    return PUBLIC_SERVICE_IMAGE_KEYWORDS.tattoo;
  }
  if (vertical === "event-vendors") {
    return inferPublicServiceImageFromName(serviceName) ?? VERTICAL_FALLBACK["event-vendors"];
  }
  const inferred = inferPublicServiceImageFromName(serviceName);
  if (inferred) return inferred;
  if (vertical && VERTICAL_FALLBACK[vertical]) return VERTICAL_FALLBACK[vertical];
  return undefined;
}
