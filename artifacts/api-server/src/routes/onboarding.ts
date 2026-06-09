import { Router, type IRouter } from "express";
import {
  getVerticalStarterPackServicesForProfile,
  getSubverticalProfile,
  listJurisdictionCatalog,
  listVerticalCatalog,
  resolveOnboardingDefaults,
  businessTierSchema,
  businessVerticalSchema,
  jurisdictionCodeSchema,
} from "@workspace/policy";
import { requireAuth } from "../lib/auth";
import { sendError } from "../lib/http-errors";

const router: IRouter = Router();

router.get("/onboarding/catalog", requireAuth, (_req, res) => {
  res.json({
    jurisdictions: listJurisdictionCatalog(),
    verticals: listVerticalCatalog(),
    tiers: businessTierSchema.options,
  });
});

router.post("/onboarding/preview", requireAuth, (req, res) => {
  const { name, country, category, vertical, tier, jurisdiction, subverticalProfileId } =
    req.body ?? {};
  if (!name || typeof name !== "string") {
    sendError(res, req, 400, "name is required");
    return;
  }

  const countryIso =
    jurisdiction && jurisdictionCodeSchema.safeParse(jurisdiction).success
      ? jurisdictionCodeSchema.parse(jurisdiction)
      : country;

  const verticalParsed =
    vertical && businessVerticalSchema.safeParse(vertical).success
      ? businessVerticalSchema.parse(vertical)
      : undefined;

  const defaults = resolveOnboardingDefaults({
    name,
    country: typeof countryIso === "string" && countryIso.length === 2 ? countryIso : country,
    category,
    vertical: verticalParsed,
    tier:
      tier && businessTierSchema.safeParse(tier).success
        ? businessTierSchema.parse(tier)
        : undefined,
  });

  if (verticalParsed) {
    const profileId =
      typeof subverticalProfileId === "string" && subverticalProfileId.trim()
        ? subverticalProfileId.trim()
        : null;
    const templates = getVerticalStarterPackServicesForProfile(verticalParsed, profileId);
    const profile = profileId ? getSubverticalProfile(profileId) : null;
    res.json({
      ...defaults,
      starterPackAvailable: true,
      subverticalProfileId: profile?.id ?? profileId,
      starterPackServices: templates.map((t) => ({
        name: t.name,
        durationMinutes: t.durationMinutes,
        priceMinor: t.priceMinor,
        category: t.category,
      })),
    });
    return;
  }

  res.json(defaults);
});

export default router;
