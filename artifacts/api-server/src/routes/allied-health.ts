import { Router, type IRouter } from "express";
import { requireAuth, requireRole, getUserId } from "../lib/auth";
import {
  createAlliedClinicalNote,
  listAlliedClinicalNotes,
} from "../services/allied-health-notes.service";
import { getBodyArtPipeline } from "../services/body-art-pipeline.service";
import { logRouteError, sendError, safeClientMessage } from "../lib/http-errors";

const router: IRouter = Router();
const bizId = (p: string | string[]) => (Array.isArray(p) ? p[0] : p);

router.get(
  "/businesses/:businessId/allied-health/notes/:customerId",
  requireAuth,
  requireRole("STAFF"),
  async (req, res): Promise<void> => {
    try {
      const notes = await listAlliedClinicalNotes(
        bizId(req.params.businessId),
        bizId(req.params.customerId),
      );
      res.json({ data: notes });
    } catch (e) {
      logRouteError(req, e, "allied notes list");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

router.post(
  "/businesses/:businessId/allied-health/notes",
  requireAuth,
  requireRole("STAFF"),
  async (req, res): Promise<void> => {
    try {
      const businessId = bizId(req.params.businessId);
      const body = req.body ?? {};
      const customerId = String(body.customerId ?? "");
      if (!customerId) {
        sendError(res, req, 400, "customerId required");
        return;
      }
      const note = await createAlliedClinicalNote(businessId, {
        customerId,
        bookingId: body.bookingId ? String(body.bookingId) : undefined,
        authorUserId: getUserId(req),
        subjective: body.subjective ? String(body.subjective) : undefined,
        objective: body.objective ? String(body.objective) : undefined,
        assessment: body.assessment ? String(body.assessment) : undefined,
        plan: body.plan ? String(body.plan) : undefined,
      });
      res.status(201).json(note);
    } catch (e) {
      logRouteError(req, e, "allied note create");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

router.get(
  "/businesses/:businessId/body-art/pipeline",
  requireAuth,
  requireRole("STAFF"),
  async (req, res): Promise<void> => {
    try {
      res.json(await getBodyArtPipeline(bizId(req.params.businessId)));
    } catch (e) {
      logRouteError(req, e, "body-art pipeline");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

export default router;
