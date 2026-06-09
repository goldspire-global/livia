import { Router, type IRouter } from "express";
import { requireAuth, requireRole } from "../lib/auth";
import { getHairColourDayFlightPlan } from "../services/hair-ops.service";
import { logRouteError, sendError } from "../lib/http-errors";

const router: IRouter = Router();
const bizId = (p: string | string[]) => (Array.isArray(p) ? p[0] : p);

router.get(
  "/businesses/:businessId/hair/colour-day",
  requireAuth,
  requireRole("STAFF"),
  async (req, res): Promise<void> => {
    try {
      const data = await getHairColourDayFlightPlan(bizId(req.params.businessId));
      res.json(data);
    } catch (e) {
      logRouteError(req, e, "hair colour-day");
      sendError(res, req, 500, "Could not load colour-day plan");
    }
  },
);

export default router;
