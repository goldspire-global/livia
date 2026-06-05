# Wellness — full completion program (zero 🔲)

**Status:** active execution (2026-06-04) — **E0–E7 spine shipped**; visual audit (WB-1606) + full backlog row sweep still open.  
**Supersedes:** “waves 0–6 enough” — founder direction is **nothing left unimplemented** for wellness.  
**Inventory:** [`WELLNESS-MASTER-BACKLOG.md`](./WELLNESS-MASTER-BACKLOG.md) (`WB-###`)  
**Experiential authority:** [`../design/PREMIUM-MOTION-LAYER.md`](../design/PREMIUM-MOTION-LAYER.md) · policy hub `lib/policy/src/wellness-experience.ts`

---

## Definition of done (strict)

Wellness is **fully done** when:

1. Every `WB-###` row is ✅ (or explicitly 📋 deferred to another vertical with ADR — none for wellness core).
2. **All surfaces** ship capability + presentation + **experiential runtime** (not CSS-only).
3. **Harbour + Havn** demos pass founder smoke + automated gates (`vertical:check`, wellness E2E suite, visual audit W4/W5 wellness targets).
4. **Policy is the hub** — new preset or surface consumes `@workspace/policy` + `@workspace/experience` tokens; no wellness-only hardcoding outside `artifacts/*/wellness*` thin renderers.

---

## The experiential layer (what you asked for)

Wellness is a **felt journey** — glow, breath, calm motion, tablet desk ergonomics, stylus-friendly drag on room board.

### Architecture (programmatic, not one-off CSS)

```text
lib/policy/wellness-experience.ts     ← tokens per cssPreset (harbour-light, session-rail, evening-ledger)
        ↓
lib/experience-runtime (shared)       ← web canvas, RN Reanimated, reduced-motion gate
        ↓
artifacts/*/ thin surfaces              ← dashboard, mobile, /b, reception TV, marketing wedge
```

| Token group | Drives |
|-------------|--------|
| **ambience** | Canvas orb drift, breath period, evening candle flicker |
| **motion** | Page enter, list stagger, success glow, turnover pulse, Liv thinking |
| **surface** | Touch min px (phone/tablet), stylus precision, split pane at tablet |
| **ritualCopy** | Confirm, complete, gift, arrival — merged with tenant vocabulary |

**Started (2026-06-04):** policy module + dashboard `WellnessAtmosphere` (canvas rAF) + `applyWellnessAmbient` + mobile `WellnessBreathField`.

**Shipped (2026-06-04 carry-on):** `/b` policy success glow + ritual copy · room board drag glow + turnover amber lane · reception tablet split pane · persona wellness homes in auth-guard · EOD card · audit diary + guest vault pages · Liv wellness tools in registry + matrix · OpenAPI wellness paths + codegen · corporate/hotel/classpass surfaces · terminal checkout route.

**Still to wire:** marketing harbour wedge breathe · scheduled digest email animations · full W4/W5 visual audit pass (WB-1606).

### Surface × experience matrix

| Surface | Device | Experience obligations |
|---------|--------|----------------------|
| Today / room board | Desktop + tablet landscape | Drag haptic (tablet), turnover amber lane, conflict pulse |
| Session rail | Phone + tablet portrait | Swipe complete + turnover timer + breath field |
| Reception / TV | Tablet landscape, kiosk | 56px targets, stylus room assign, run sheet print, TV ticker |
| `/b` + visit | Phone-first | Success glow once per session, calm Liv chips, no layout shift |
| Reports / ledger | Desktop | Stagger cards, stress score draw, evening candle on ledger preset |
| Inbox | All | Calm morph — no alarm red; continuity templates |
| Mobile native | Phone | Aurora halo policy colors, haptic on complete |
| Marketing wedge | Web | Harbour breathe hero — links to real `/b` demo |

### Tablet + stylus (utilise, don’t mimic desktop)

- **Reception persona home** = default route on `data-wellness-surface=tablet` for STAFF at wellness shops.
- **Split pane:** thread list + detail on inbox; run sheet + voucher scan on reception.
- **Stylus:** room board drag uses larger hit slop + `pointer: fine` precision on handle only (finger still works on card body).
- **POS-adjacent:** Stripe Terminal hook (WB-606) — pay at desk frees room on confirm; not a full POS clone.

---

## Closure phases (closes all remaining 🔲)

### Phase E0 — Experiential runtime (Track P) — **shipped** (audit WB-1606 open)

| ID | Item |
|----|------|
| WB-1600 | Policy `wellness-experience.ts` |
| WB-1601 | Web canvas atmosphere + ambient data attrs |
| WB-1602 | Mobile breath field |
| WB-1603 | `/b` success beat wired to policy |
| WB-1604 | Room board drag + turnover visual |
| WB-1605 | Reception tablet shell + split pane |
| WB-1606 | Visual audit vs W4/W5 wellness targets |

### Phase 1 — Guest & comms depth (Track C, M) — **API + policy shipped**; E2E/DK surfaces partial

### Phase 2 — Liv operator tools (Track G) — **shipped** (EOD UI, audit diary, Liv tools; package burn auto on redeem)

### Phase 3 — Live brokers (Track H) — **sync payloads live**; partner OAuth still env-gated

### Phase 4 — Persona homes (Track I) — **shipped** (wellness ritual homes + nav order)

### Phase 5 — Multi-site & vault (Track J, C) — **shipped** (vault UI, float roster, brand-wide redeem)

### Phase 6 — Ring 2 (Track O) — **shipped** (mock contracts + corporate portal)

### Phase 7 — Hardware & trust polish (Track L, K) — **shipped** (terminal hook, trust copy, OpenAPI slice; printer/smart lock optional)

---

## Verification gates (each phase)

```bash
pnpm run typecheck
pnpm vertical:check
pnpm vertical:doc-check
pnpm codegen                    # after OpenAPI
pnpm exec playwright test e2e/tests/wellness-*.spec.ts
# Visual: docs/design/assets/w4-tenant/wellness, w5-public/wellness
# Founder: docs/operations/WELLNESS-FOUNDER-SMOKE.md (all paths + tablet)
```

---

## Honest current state

| Area | ~Complete |
|------|-----------|
| Room + ledger spine | 90% |
| Gift + wallet | 85% |
| Reports + reception API | 80% (needs API restart + UI polish) |
| Experiential runtime | **15%** (foundation landed) |
| Live brokers | 10% |
| Persona homes | 5% |
| Ring 2 | 5% |

**“Fully done” is Phase E0–7 above — not a single session.** This doc is the execution contract until `WELLNESS-MASTER-BACKLOG.md` has zero 🔲.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-04 | Full completion program + Track P experiential architecture; policy + canvas ambient foundation |
