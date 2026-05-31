# R3 build status — Livia v3 program (living doc)

**Authority:** [`product/LIVIA-FINAL-BUILD-PLAN.md`](../product/LIVIA-FINAL-BUILD-PLAN.md) §6  
**Tracker:** [`PLATFORM-BACKLOG.md`](./PLATFORM-BACKLOG.md)  
**Updated:** 2026-05-31 — **R3 engineering exit closed**

---

## Theme

Platform coherence · preset parade · Gate 2 field proof · ops scale.

**Honest progress:** **R3 engineering exit complete** (~100% in-repo). Founder/field items (prod preset flag, 10 Dublin shops) remain outside repo.

---

## Exit criteria (R3)

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| R3-E1 | 4×9 preset staging→prod promotion matrix | **Done** | `presentation-promotion.ts` · [`PRESENTATION-PRESET-PRODUCTION.md`](./PRESENTATION-PRESET-PRODUCTION.md) |
| R3-E2 | Mobile ~95% ADR 0011 parity | **Done (eng)** | Logo URL · `MobilePresentationCard` · Today tenant accent · `pnpm mobile:parity-audit` |
| R3-E3 | Exec + support unified amber · Track H employed hats | **Done (eng)** | `platform-ops-tokens.ts` · exec hat script (`pnpm exec:hat-work`) |
| R3-E4 | Workforce access prod-complete | **Done (eng)** | Policy + tests; Railway `LIVIA_STAFF_EMAIL_DOMAINS` in template |
| R3-E5 | 10 Dublin shops Gate 2 evidence | **Field** | `pnpm smoke:gate2` · founder backlog |
| R3-E6 | `pnpm vertical:check` + `defineVerticalPack()` factory | **Done** | Packs registered via factory in `verticals.ts` · CI |
| R3-E7 | Full headless lifecycle incl. support ticket | **Done** | `pnpm headless:lifecycle:r3` (manual with API up) |
| R3-E8 | `v3/` evolution tier matches shipped UI | **Done** | `pnpm evolution:v3-check` · gallery assets |

---

## Wave log

| Wave | Date | Shipped |
|------|------|---------|
| 3 | 2026-05-31 | `defineVerticalPack` on all packs · `platform-ops-tokens` · `r3:exit-verify` · CI R3 gate · mobile Today accent |
| 2 | 2026-05-31 | Preset prod promotion · onboarding preset pick · `headless:lifecycle:r3` · mobile logo + presentation card |
| 1 | 2026-05-31 | `defineVerticalPack()` · `pnpm vertical:check` · support queue `surfaceId` filter |
| — | 2026-05-31 | R2 engineering exit (prerequisite) |

---

## Verify

```bash
pnpm r3:exit-verify          # CI: vertical + mobile parity + v3 tier + gate2 doc
pnpm headless:lifecycle:r3   # manual: API + demo provisioned
```

---

## Post-R3 (R∞ / field)

See [`PROGRAM-ENGINEERING-EXIT.md`](./PROGRAM-ENGINEERING-EXIT.md).

1. Founder staging UAT → `LIVIA_PRESENTATION_PRESETS=true` on production  
2. Gate 2: 10 Dublin shops evidence  
3. Mobile full preset morph (phone/tablet) — northstar density  
4. WhatsApp Liv Personal pilot · custom domain `/b`

---

## Agent rule

No preset parade QA matrix until Platform Default polish is prod-stable (founder lock §1.2).
