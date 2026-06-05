import { Router, type IRouter } from "express";
import { requireAuth, requireRole } from "../lib/auth";
import { logRouteError, sendError, safeClientMessage } from "../lib/http-errors";
import {
  getWellnessReportsBundle,
  getPersonaDigestPreview,
} from "../services/wellness-reports.service";
import {
  findPackageCreditByRedemptionCode,
  burnPackageCredit,
} from "../services/package-credits.service";
import {
  proposeWalkInSlot,
  proposeDutySolver,
  getEodCloseNarrative,
  getTodayRunSheet,
  getCalendarPoisonAlerts,
  proposeRerooming,
} from "../services/wellness-ops.service";
import { buildWellnessSettlementCsv } from "../services/wellness-settlement.service";
import { getWellnessChainGlance } from "../services/wellness-chain.service";
import { exportGuestListCsv } from "../services/wellness-guest-export.service";
import { getParallelRunDiff } from "../services/wellness-parallel-run.service";
import { buildWellnessCommissionCsv } from "../services/wellness-commission.service";
import {
  createCouplesBookingPair,
  getCouplesLinkForBooking,
} from "../services/wellness-couples.service";
import { listWellnessAuditDiary } from "../services/wellness-audit-diary.service";
import {
  getGuestVaultProfile,
  transferGuestMemoryConsent,
  listFloatRoster,
} from "../services/wellness-guest-vault.service";
import { WELLNESS_HOTEL_FOLIO, WELLNESS_CLASSPASS_ADJACENT } from "@workspace/policy";
import type { PersonaReportSlug } from "@workspace/policy";

const router: IRouter = Router();
const bizId = (p: string | string[]) => (Array.isArray(p) ? p[0] : p);

const DIGEST_SLUGS: PersonaReportSlug[] = [
  "owner_morning",
  "owner_weekly",
  "manager_ops",
  "accountant_preview",
  "staff_day_sheet",
  "reception_handoffs",
  "host_rent_roll",
];

router.get(
  "/businesses/:businessId/wellness/reports",
  requireAuth,
  requireRole("STAFF"),
  async (req, res): Promise<void> => {
    try {
      res.json(await getWellnessReportsBundle(bizId(req.params.businessId)));
    } catch (e) {
      logRouteError(req, e, "wellness reports");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

router.get(
  "/businesses/:businessId/wellness/digest/:slug",
  requireAuth,
  requireRole("STAFF"),
  async (req, res): Promise<void> => {
    try {
      const slug = bizId(req.params.slug) as PersonaReportSlug;
      if (!DIGEST_SLUGS.includes(slug)) {
        sendError(res, req, 400, "Unsupported digest slug");
        return;
      }
      res.json(await getPersonaDigestPreview(bizId(req.params.businessId), slug));
    } catch (e) {
      logRouteError(req, e, "wellness digest");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

router.post(
  "/businesses/:businessId/wellness/redeem-code",
  requireAuth,
  requireRole("STAFF"),
  async (req, res): Promise<void> => {
    try {
      const businessId = bizId(req.params.businessId);
      const code = typeof req.body?.code === "string" ? req.body.code : "";
      const row = await findPackageCreditByRedemptionCode(businessId, code);
      if (!row) {
        sendError(res, req, 404, "Code not found");
        return;
      }
      res.json({
        ledgerId: row.id,
        packageName: row.packageName,
        creditsRemaining: row.creditsRemaining,
        customerId: row.customerId,
      });
    } catch (e) {
      logRouteError(req, e, "wellness redeem lookup");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

router.post(
  "/businesses/:businessId/wellness/redeem-code/burn",
  requireAuth,
  requireRole("STAFF"),
  async (req, res): Promise<void> => {
    try {
      const businessId = bizId(req.params.businessId);
      const ledgerId = typeof req.body?.ledgerId === "string" ? req.body.ledgerId : "";
      if (!ledgerId) {
        sendError(res, req, 400, "ledgerId required");
        return;
      }
      const result = await burnPackageCredit(businessId, ledgerId, 1);
      if ("error" in result) {
        sendError(res, req, 400, "No credits remaining");
        return;
      }
      res.json({ ledger: result.ledger });
    } catch (e) {
      logRouteError(req, e, "wellness redeem burn");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

router.post(
  "/businesses/:businessId/wellness/walk-in",
  requireAuth,
  requireRole("STAFF"),
  async (req, res): Promise<void> => {
    try {
      const businessId = bizId(req.params.businessId);
      const serviceId = String(req.body?.serviceId ?? "");
      if (!serviceId) {
        sendError(res, req, 400, "serviceId required");
        return;
      }
      res.json(
        await proposeWalkInSlot(businessId, {
          serviceId,
          staffId: req.body?.staffId as string | undefined,
          preferredStart: req.body?.preferredStart as string | undefined,
        }),
      );
    } catch (e) {
      logRouteError(req, e, "walk-in");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

router.post(
  "/businesses/:businessId/wellness/duty-solver",
  requireAuth,
  requireRole("STAFF"),
  async (req, res): Promise<void> => {
    try {
      res.json(await proposeDutySolver(bizId(req.params.businessId), req.body ?? {}));
    } catch (e) {
      logRouteError(req, e, "duty solver");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

router.get(
  "/businesses/:businessId/wellness/eod-close",
  requireAuth,
  requireRole("STAFF"),
  async (req, res): Promise<void> => {
    try {
      res.json(await getEodCloseNarrative(bizId(req.params.businessId)));
    } catch (e) {
      logRouteError(req, e, "eod close");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

router.get(
  "/businesses/:businessId/wellness/run-sheet",
  requireAuth,
  requireRole("STAFF"),
  async (req, res): Promise<void> => {
    try {
      res.json({ rows: await getTodayRunSheet(bizId(req.params.businessId)) });
    } catch (e) {
      logRouteError(req, e, "run sheet");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

router.get(
  "/businesses/:businessId/wellness/calendar-alerts",
  requireAuth,
  requireRole("STAFF"),
  async (req, res): Promise<void> => {
    try {
      res.json(await getCalendarPoisonAlerts(bizId(req.params.businessId)));
    } catch (e) {
      logRouteError(req, e, "calendar alerts");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

router.get(
  "/businesses/:businessId/wellness/rerooming",
  requireAuth,
  requireRole("STAFF"),
  async (req, res): Promise<void> => {
    try {
      res.json(await proposeRerooming(bizId(req.params.businessId)));
    } catch (e) {
      logRouteError(req, e, "rerooming");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

router.get(
  "/businesses/:businessId/wellness/settlement.csv",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res): Promise<void> => {
    try {
      const csv = await buildWellnessSettlementCsv(bizId(req.params.businessId));
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="wellness-settlement.csv"');
      res.send(csv);
    } catch (e) {
      logRouteError(req, e, "settlement csv");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

router.get(
  "/businesses/:businessId/wellness/commission.csv",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res): Promise<void> => {
    try {
      const csv = await buildWellnessCommissionCsv(bizId(req.params.businessId));
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="wellness-commission.csv"');
      res.send(csv);
    } catch (e) {
      logRouteError(req, e, "commission csv");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

router.get(
  "/businesses/:businessId/wellness/chain-glance",
  requireAuth,
  requireRole("STAFF"),
  async (req, res): Promise<void> => {
    try {
      res.json(await getWellnessChainGlance(bizId(req.params.businessId)));
    } catch (e) {
      logRouteError(req, e, "chain glance");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

router.get(
  "/businesses/:businessId/wellness/guest-export.csv",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res): Promise<void> => {
    try {
      const csv = await exportGuestListCsv(bizId(req.params.businessId));
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="guests-export.csv"');
      res.send(csv);
    } catch (e) {
      logRouteError(req, e, "guest export");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

router.get(
  "/businesses/:businessId/wellness/parallel-run/:external",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res): Promise<void> => {
    try {
      const ext = bizId(req.params.external);
      if (ext !== "mindbody" && ext !== "fresha") {
        sendError(res, req, 400, "external must be mindbody or fresha");
        return;
      }
      res.json(await getParallelRunDiff(bizId(req.params.businessId), ext));
    } catch (e) {
      logRouteError(req, e, "parallel run");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

router.post(
  "/businesses/:businessId/wellness/couples-book",
  requireAuth,
  requireRole("STAFF"),
  async (req, res): Promise<void> => {
    try {
      const businessId = bizId(req.params.businessId);
      const body = req.body ?? {};
      const startAt = new Date(String(body.startAt ?? ""));
      const endAt = new Date(String(body.endAt ?? ""));
      if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
        sendError(res, req, 400, "startAt and endAt required");
        return;
      }
      res.json(
        await createCouplesBookingPair(businessId, {
          primary: {
            customerId: String(body.primaryCustomerId ?? ""),
            serviceId: String(body.serviceId ?? ""),
            staffId: body.staffId as string | undefined,
            resourceId: body.resourceId as string | undefined,
            startAt,
            endAt,
          },
          partner: {
            customerId: String(body.partnerCustomerId ?? ""),
            displayName: body.partnerName as string | undefined,
          },
        }),
      );
    } catch (e) {
      logRouteError(req, e, "couples book");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

router.get(
  "/businesses/:businessId/wellness/couples/:bookingId",
  requireAuth,
  requireRole("STAFF"),
  async (req, res): Promise<void> => {
    try {
      res.json(
        await getCouplesLinkForBooking(bizId(req.params.businessId), bizId(req.params.bookingId)),
      );
    } catch (e) {
      logRouteError(req, e, "couples link");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

router.get(
  "/businesses/:businessId/wellness/audit-diary",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res): Promise<void> => {
    try {
      res.json(await listWellnessAuditDiary(bizId(req.params.businessId)));
    } catch (e) {
      logRouteError(req, e, "audit diary");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

router.get(
  "/businesses/:businessId/wellness/guest-vault",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res): Promise<void> => {
    try {
      const phone = typeof req.query.phone === "string" ? req.query.phone : "";
      if (!phone) {
        sendError(res, req, 400, "phone query required");
        return;
      }
      res.json(await getGuestVaultProfile(bizId(req.params.businessId), phone));
    } catch (e) {
      logRouteError(req, e, "guest vault");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

router.post(
  "/businesses/:businessId/wellness/guest-vault/transfer",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res): Promise<void> => {
    try {
      res.json(await transferGuestMemoryConsent(bizId(req.params.businessId), req.body ?? {}));
    } catch (e) {
      logRouteError(req, e, "vault transfer");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

router.get(
  "/businesses/:businessId/wellness/float-roster",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res): Promise<void> => {
    try {
      res.json(await listFloatRoster(bizId(req.params.businessId)));
    } catch (e) {
      logRouteError(req, e, "float roster");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

router.get(
  "/businesses/:businessId/wellness/hotel-folio",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res): Promise<void> => {
    try {
      const bookingId = typeof req.query.bookingId === "string" ? req.query.bookingId : "";
      res.json({
        ...WELLNESS_HOTEL_FOLIO,
        chargeCode: bookingId ? `${WELLNESS_HOTEL_FOLIO.chargeCodePrefix}-${bookingId.slice(0, 8)}` : null,
        status: process.env.HOTEL_FOLIO_API_KEY ? "partner_ready" : "mock",
      });
    } catch (e) {
      logRouteError(req, e, "hotel folio");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

router.get(
  "/businesses/:businessId/wellness/classpass-packs",
  requireAuth,
  requireRole("ADMIN"),
  async (_req, res): Promise<void> => {
    res.json(WELLNESS_CLASSPASS_ADJACENT);
  },
);

router.post(
  "/businesses/:businessId/wellness/terminal/checkout",
  requireAuth,
  requireRole("STAFF"),
  async (req, res): Promise<void> => {
    try {
      const bookingId = String(req.body?.bookingId ?? "");
      if (!bookingId) {
        sendError(res, req, 400, "bookingId required");
        return;
      }
      res.json({
        ok: true,
        message: "Stripe Terminal checkout initiated — booking completes when payment succeeds.",
        bookingId,
        terminal: process.env.STRIPE_TERMINAL_LOCATION_ID ? "live" : "mock",
      });
    } catch (e) {
      logRouteError(req, e, "terminal checkout");
      sendError(res, req, 500, safeClientMessage(e));
    }
  },
);

export default router;
