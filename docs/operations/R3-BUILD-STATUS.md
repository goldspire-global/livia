# R3 build status — Livia v3 program (living doc)

**Authority:** [`product/LIVIA-FINAL-BUILD-PLAN.md`](../product/LIVIA-FINAL-BUILD-PLAN.md) §6  
**Tracker:** [`PLATFORM-BACKLOG.md`](./PLATFORM-BACKLOG.md)  
**Updated:** 2026-05-31 — **R3 Wave 1 active** (post-R2 exit)

---

## Theme

Platform coherence · preset parade · Gate 2 field proof · ops scale.

**Honest progress:** ~15% (Wave 1 — registry gates + support surface filter). Preset prod promotion and mobile parity are next waves.

---

## Exit criteria (R3)

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| R3-E1 | 4×9 preset staging→prod promotion matrix | **Partial** | Catalog + settings UI + audit; prod flag still staging-only |
| R3-E2 | Mobile ~95% ADR 0011 parity | Not started | |
| R3-E3 | Exec + support unified amber · Track H employed hats | Partial | Support context pane shipped R2 |
| R3-E4 | Workforce access prod-complete | Partial (R1 code) | |
| R3-E5 | 10 Dublin shops Gate 2 evidence | Business / field | |
| R3-E6 | `pnpm vertical:check` + `defineVerticalPack()` factory | **Partial → Wave 1** | Factory + CI script; not in GitHub CI yet |
| R3-E7 | Full headless lifecycle incl. support ticket | Partial | `headless:lifecycle:r1`; extend for support |
| R3-E8 | `v3/` evolution tier matches shipped UI | Not started | |

---

## Wave log

| Wave | Date | Shipped |
|------|------|---------|
| 1 | 2026-05-31 | `defineVerticalPack()` · `pnpm vertical:check` · support queue `surfaceId` filter (B3) |
| — | 2026-05-31 | R2 engineering exit (prerequisite) |

---

## Next agent queue

1. Wire `pnpm vertical:check` into `.github/workflows/ci.yml`
2. Preset prod promotion matrix + `LIVIA_PRESENTATION_PRESETS` prod allowlist doc
3. Onboarding optional preset picker step (Track D3.7)
4. Headless lifecycle: support ticket creation step (R3-E7)
5. Mobile parity audit vs [`WEB-MOBILE-PARITY.md`](../product/WEB-MOBILE-PARITY.md)

---

## Dependencies

- **R2 complete** ✅
- **R1 prod sign-off** — founder visual UAT on staging → prod promote

---

## Agent rule

No preset parade QA matrix until Platform Default polish is prod-stable (founder lock §1.2).
