// Owner cockpit dashboard. Revenue + cross-staff aggregates → not for STAFF.
// Access: OWNER+ADMIN.

import { Router, type IRouter } from "express";
import { requireAuth, requireRole } from "../lib/auth";
import { getDashboardSummary, getActivityFeed } from "../services/dashboard.service";
import { getTenantCapabilities } from "../services/capability-resolution.service";
import { setCapabilityInstanceAction } from "../services/capability-instances.service";
import {
  getBusinessTwinSummary,
  getBusinessTwinHealth,
  getBusinessTwinRecommendations,
} from "../services/business-twin.service";
import { getCommerceSnapshotForApi } from "../services/commerce-intelligence.service";
import { getCommerceSignalsBundle } from "../services/commerce-signals.service";
import { getOwnerIntelligenceBundleCached, invalidateOwnerIntelligenceCache } from "../services/owner-intelligence-cache";
import { getPublicIntakeFeed } from "../services/public-intake.service";
import { getTodayVerticalInsights } from "../services/today-vertical-insights.service";
import { sendError } from "../lib/http-errors";

const router: IRouter = Router();
const getBizId = (param: string | string[]) => Array.isArray(param) ? param[0] : param;

router.get(
  "/businesses/:businessId/dashboard",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res): Promise<void> => {
    const businessId = getBizId(req.params.businessId);
    res.json(await getDashboardSummary(businessId));
  },
);

router.get(
  "/businesses/:businessId/activity",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res): Promise<void> => {
    const businessId = getBizId(req.params.businessId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    res.json(await getActivityFeed(businessId, limit));
  },
);

router.get(
  "/businesses/:businessId/today-vertical-insights",
  requireAuth,
  requireRole("STAFF"),
  async (req, res): Promise<void> => {
    const businessId = getBizId(req.params.businessId);
    const payload = await getTodayVerticalInsights(businessId);
    if (!payload) {
      sendError(res, req, 404, "Business not found");
      return;
    }
    res.json(payload);
  },
);

router.get(
  "/businesses/:businessId/capabilities",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res): Promise<void> => {
    const businessId = getBizId(req.params.businessId);
    const payload = await getTenantCapabilities(businessId);
    if (!payload) {
      sendError(res, req, 404, "Business not found");
      return;
    }
    res.json(payload);
  },
);

router.patch(
  "/businesses/:businessId/capabilities/:capabilityId",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res): Promise<void> => {
    const businessId = getBizId(req.params.businessId);
    const capabilityId = getBizId(req.params.capabilityId);
    const action = req.body?.action;
    if (action !== "suspend" && action !== "resume") {
      sendError(res, req, 400, "action must be suspend or resume");
      return;
    }
    const result = await setCapabilityInstanceAction(businessId, capabilityId, action);
    if (!result.ok) {
      sendError(res, req, result.error === "NOT_FOUND" ? 404 : 400, result.error);
      return;
    }
    invalidateOwnerIntelligenceCache(businessId);
    const { syncTwinObservations } = await import("../services/twin-observations.service");
    void syncTwinObservations(businessId).catch(() => undefined);
    const payload = await getTenantCapabilities(businessId);
    if (!payload) {
      sendError(res, req, 404, "Business not found");
      return;
    }
    res.json(payload);
  },
);

router.get(
  "/businesses/:businessId/commerce/snapshot",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res): Promise<void> => {
    const businessId = getBizId(req.params.businessId);
    res.json(await getCommerceSnapshotForApi(businessId));
  },
);

router.get(
  "/businesses/:businessId/commerce/signals",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res): Promise<void> => {
    const businessId = getBizId(req.params.businessId);
    res.json(await getCommerceSignalsBundle(businessId));
  },
);

router.get(
  "/businesses/:businessId/owner-intelligence",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res): Promise<void> => {
    const businessId = getBizId(req.params.businessId);
    const payload = await getOwnerIntelligenceBundleCached(businessId);
    if (!payload) {
      sendError(res, req, 404, "Business not found");
      return;
    }
    res.json(payload);
  },
);

router.get(
  "/businesses/:businessId/twin/summary",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res): Promise<void> => {
    const businessId = getBizId(req.params.businessId);
    const payload = await getBusinessTwinSummary(businessId);
    if (!payload) {
      sendError(res, req, 404, "Business not found");
      return;
    }
    res.json(payload);
  },
);

router.get(
  "/businesses/:businessId/twin/health",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res): Promise<void> => {
    const businessId = getBizId(req.params.businessId);
    const payload = await getBusinessTwinHealth(businessId);
    if (!payload) {
      sendError(res, req, 404, "Business not found");
      return;
    }
    res.json(payload);
  },
);

router.get(
  "/businesses/:businessId/twin/recommendations",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res): Promise<void> => {
    const businessId = getBizId(req.params.businessId);
    const payload = await getBusinessTwinRecommendations(businessId);
    if (!payload) {
      sendError(res, req, 404, "Business not found");
      return;
    }
    res.json(payload);
  },
);

router.get(
  "/businesses/:businessId/twin/observations",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res): Promise<void> => {
    const businessId = getBizId(req.params.businessId);
    const { getTwinObservationsBundle } = await import("../services/twin-observations.service");
    res.json(await getTwinObservationsBundle(businessId));
  },
);

router.post(
  "/businesses/:businessId/twin/sync",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res): Promise<void> => {
    const businessId = getBizId(req.params.businessId);
    const { runTwinIntelligenceDaily } = await import("../services/twin-intelligence-daily.service");
    res.json(await runTwinIntelligenceDaily(businessId));
  },
);

router.get(
  "/businesses/:businessId/public-intake",
  requireAuth,
  requireRole("STAFF"),
  async (req, res): Promise<void> => {
    const businessId = getBizId(req.params.businessId);
    res.json(await getPublicIntakeFeed(businessId));
  },
);

export default router;
