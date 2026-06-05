import { Router, type IRouter } from "express";
import { requireAuth, requireRole } from "../lib/auth";
import {
  listIntegrationBrokers,
  triggerBrokerSyncJob,
  type BrokerId,
} from "../services/integration-brokers.service";

const router: IRouter = Router();
const bizId = (p: string | string[]) => (Array.isArray(p) ? p[0] : p);

router.get(
  "/businesses/:businessId/integration-brokers",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res) => {
    res.json(await listIntegrationBrokers(bizId(req.params.businessId)));
  },
);

router.post(
  "/businesses/:businessId/integration-brokers/:brokerId/sync",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res) => {
    const brokerId = bizId(req.params.brokerId) as BrokerId;
    const result = await triggerBrokerSyncJob(bizId(req.params.businessId), brokerId);
    res.json(result);
  },
);

export default router;
