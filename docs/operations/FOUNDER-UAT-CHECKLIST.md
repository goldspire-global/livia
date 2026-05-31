# Founder UAT checklist (Bucket C)

**Updated:** 2026-05-31  
**Use after** Bucket B deploy on staging (`app.staging.livia-hq.com` or local).

**Not production:** Vercel project `livia-stg` may email “Production Deployment” — that is Vercel’s label for `main` on the **staging** project, not `app.livia-hq.com`. See [`VERCEL-DEPLOY-ENVIRONMENTS.md`](./VERCEL-DEPLOY-ENVIRONMENTS.md).

Automated prelude:

```bash
pnpm northstar:check
pnpm founder:uat-preflight
pnpm --filter @workspace/e2e run test:p0-visual
pnpm --filter @workspace/e2e run test:founder-uat    # needs Clerk + API + dashboard
```

---

## Medspa owner — Clarity Medspa (`clarity-medspa-dublin`)

| # | Path | Pass? | Notes |
|---|------|-------|-------|
| 1 | `/dashboard` | | Ritual home only — **no** “public link” mega-card; briefing + pending/inbox modules contextual |
| 2 | `/medspa` | | Consents/intakes/waitlist — busiest tab opens first |
| 3 | `/inbox` | | Three-pane; context rail **only** when a thread is selected |
| 4 | `/bookings` | | Compact list; open one row → detail merged client/service card |
| 5 | `/settings?tab=shop` | | Booking link strip at top; contact fields collapsed |
| 6 | `/settings?tab=appearance` | | Preset + `/b` preview updates when accent changes |
| 7 | `/b/clarity-medspa-dublin` | | Mobile 390px — medspa skin, consent step if applicable |

---

## Salon owner — Luxe (`luxe-salon-spa`)

| # | Path | Pass? | Notes |
|---|------|-------|-------|
| 1 | `/dashboard` | | Same density rules as medspa |
| 2 | `/inbox` | | |
| 3 | `/toolkit` | | Focused Liv hub — no stuck/drift/moments strips |
| 4 | `/bookings` | | |
| 5 | `/settings?tab=appearance` | | Live preview iframe |
| 6 | `/b/luxe-salon-spa` | | Public book flow ≤90s on phone |

---

## Sign-off

| Item | Founder | Date |
|------|---------|------|
| Medspa paths 1–7 feel “finished” for R1 demo | | |
| Salon paths 1–6 feel “finished” for R1 demo | | |
| Bucket C → production preset flag OK | | |

When both vertical rows are checked, reply **“Bucket C UAT passed”** (with exceptions listed).
