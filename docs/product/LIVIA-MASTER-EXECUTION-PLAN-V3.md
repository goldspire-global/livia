# Livia Master Execution Plan V3

**Status:** canonical execution authority (2026-06-05)  
**Supersedes sequencing from:** audit Part 21, `LIVIA-WIDE-BUILD-PLAN.md` (vision), `LIVIA-FINAL-BUILD-PLAN.md` (R1–R3 locks still valid)  
**Audience:** founder, engineering, product, design, GTM  
**Companion:** [`REPO-VS-BLUEPRINT-GAP-MATRIX.md`](./REPO-VS-BLUEPRINT-GAP-MATRIX.md) · [`V1-PRODUCT-DEFINITION.md`](./V1-PRODUCT-DEFINITION.md)

---

## Mission (24 months)

Transform Livia from **ambitious product** into **category-defining company** through disciplined execution.

The greatest risk is not failure. It is **dilution**.

Everything must support proving one thesis:

> **People businesses will trust Livia to run their business.**

---

## Four strategic objectives

| # | Objective | Question |
|---|-----------|----------|
| 1 | **Activation** | Can businesses launch and receive first booking? |
| 2 | **Retention** | Do businesses return weekly? |
| 3 | **Understanding** | Does Livia understand businesses? |
| 4 | **Expansion** | Can the platform grow without fragmentation? |

---

## Four eras (not releases)

| Era | Name | Goal | Exit signal |
|-----|------|------|-------------|
| **1** | Operational Foundation | Become indispensable for daily ops | 50+ weekly active businesses; V1 proofs 1–3 |
| **2** | Business Understanding | Become intelligent | Twin API live; Liv advisor useful |
| **3** | Business Growth | Become transformative | Measurable revenue/retention lift for tenants |
| **4** | Platform Ecosystem | Become foundational | Capability marketplace beta |

**Current position (2026-06-05):** Late Era 0 / early Era 1 — R1–R3 engineering closed in repo; activation and market proof open. **GTM Wave 1** locks all nine code verticals at one creative parity bar — see [`GTM-VERTICAL-DEPTH-PROGRAM.md`](./GTM-VERTICAL-DEPTH-PROGRAM.md).

---

## V1 gate (non-negotiable before Era 2 product launch)

From [`V1-PRODUCT-DEFINITION.md`](./V1-PRODUCT-DEFINITION.md):

| Criterion | Target |
|-----------|--------|
| Activated businesses | 100 |
| Monthly retention | 70%+ |
| MRR | €10,000 |
| Sacred metric | First Successful Booking |

**Five proofs:** onboard → publish `/b` → customer books → weekly return → pay.

Era 2 **user-facing** Twin and Advisor features ship **in infrastructure** during Era 1, but **market** as V2 only after V1 gate.

---

## Era 1 — The Activation Year (Months 1–12)

### Q1 — Launch foundation (Months 1–3)

**Goal:** First real businesses operating on Livia.

| Workstream | Deliverables | Repo touchpoints |
|------------|--------------|------------------|
| **Auth & enter** | Google, Apple, email; <60s to inside app | Clerk, onboarding wizard |
| **Business launch** | Vertical + **sub-segment profile** + org shape; opt-in starter pack | `vertical-starter-packs.ts`, `GTM-VERTICAL-DEPTH-PROGRAM.md` §5 |
| **Guest book (D0)** | Wildcard subdomain `{slug}.livia-hq.com`; retire user-facing `/b` | Edge routing, `public-booking.tsx`, 301 from `/b` |
| **Guest vault (D1)** | `/my` visit shell + vertical morph; no redirect to book for manage | `my-livia.tsx`, `guest-hub.service.ts`, policy guest surfaces |
| **Relationship (D1–D2)** | Vertical memory on profile; guest thread from `/my` | customers API, inbox, `VERTICAL-INNOVATION-PROGRAM.md` |
| **Vertical depth D0–D4** | All nine verticals — innovation P0 per vertical | Per-vertical program + demo seed |
| **Payments** | Stripe connect completion path | `payment.service.ts` |
| **Activation tracking** | `test-booking` gate + guest relationship events | `activation-metrics.ts` |
| **Trust basics** | Reviews, audit for Liv actions | reviews, audit log |
| **Founder UAT** | Nine-slug showcase + guest hub `+353871000001` | `FOUNDER-UAT-CHECKLIST.md` |

**Success metric:** **10 activated businesses** with **first booking + guest relationship artifact** (visit managed or thread reply).

**Stop doing:** Shipping vertical features that fail the bilateral value test (§4 in GTM depth program). Marketing copy that references `/b`.

---

### Q2 — First retention layer (Months 4–6)

**Goal:** Businesses return weekly.

| Workstream | Deliverables |
|------------|--------------|
| **Relationship layer v1** | Customer profile + communication history as primary view |
| **Unified inbox** | Polish cross-channel threads; SMS reliability |
| **Reviews + portfolio** | Post-visit review request; simple portfolio on `/b` |
| **Basic trust signals** | Review display, response flow |
| **Owner today dashboard** | V1 widget set only — today's bookings, revenue, messages, Liv tasks |
| **Mobile parity** | Core ops on mobile match web for owner + staff |

**Success metric:** **50 active businesses** (weekly return).

**Blueprint work (foundation only):** Relationship entity schema; begin `EVENT_CATALOG` unification.

---

### Q3 — Coherence quarter (Months 7–9)

**Goal:** One platform internally — no parallel systems growing.

| Workstream | Deliverables |
|------------|--------------|
| **Capability registry Phase 1** | `capability-registry.ts`; derive announcements from registry |
| **Event catalog CI** | Every business mutation registered; bridge dual event systems |
| **Dynamic navigation** | Capability-resolved nav on dashboard |
| **Experience polish** | Device morph for owner + receptionist on 3 wedge verticals |
| **Liv setup copilot v2** | End-to-end: create → pay → publish → first booking in one guided flow |

**Success metric:** `pnpm capability:check` green; event coverage report >80% on booking/commerce paths.

---

### Q4 — V1 proof push (Months 10–12)

**Goal:** Approach V1 exit criteria.

| Workstream | Deliverables |
|------------|--------------|
| **GTM Wave 1** | IE outreach — **all nine verticals** at parity; subdomain book + `/my` story |
| **Pricing live** | Free / €29 / €79 on prod Stripe |
| **Activation funnel** | Founder dashboard: activation rate, TTFB, payment connect rate |
| **Retention interventions** | Liv nudges for dormant businesses (setup assistant level) |
| **Commercial ops** | Support runbook, billing dunning basics |

**Success metric:** **€1,000 MRR**; retention trend visible; path to 100 businesses documented.

---

## Era 2 — Business Understanding (Months 13–18)

### Q1 — Twin service

| Deliverable | Spec |
|-------------|------|
| `business-twin.service.ts` | [`BUSINESS-TWIN-SPEC.md`](./BUSINESS-TWIN-SPEC.md) |
| `GET /me/twin/summary`, `/health`, `/recommendations` | OpenAPI first |
| Facts + signals from events | Read-only DB references |
| Migrate briefing/presence to consume Twin API | Deprecate scattered logic |

### Q2 — Capability instances

| Deliverable | Spec |
|-------------|------|
| `capability_instances` persistence | [`CAPABILITY-GRAPH-SPEC.md`](../engineering/CAPABILITY-GRAPH-SPEC.md) |
| `GET /me/capabilities` resolved graph | Dashboard + Liv consume |
| Readiness engine | Onboarding driven by capability state |

### Q3 — Liv Advisor mode

| Deliverable | Spec |
|-------------|------|
| Twin → Liv recommendation pipeline | [`LIV-RUNTIME-SPEC.md`](./LIV-RUNTIME-SPEC.md) |
| Recommendations with evidence + confidence | Mandatory structure |
| Founder briefing from Twin only | No raw SQL in prompts |

**Era 2 exit:** V1 gate met (100 businesses, 70% retention, €10k MRR) **OR** explicit founder unlock with documented rationale.

---

## Era 3 — Business Growth (Months 19–24)

| Track | Deliverables |
|-------|--------------|
| **Commerce intelligence** | Revenue by service, cash-flow view, package profitability |
| **Trust engine** | Trust Profile, verification workflows for regulated verticals |
| **Growth automation** | Review campaigns, retention workflows, waitlist conversion |
| **Guest vault (W6)** | Customer-owned continuity — extend D1–D2 work; wallet, chain |
| **Preset rollout** | Phase rollout of 36 presets per `PRESENTATION-PRESETS-AND-ROLLOUT.md` |

**Success metric:** Demonstrable uplift — retention +10% vs Era 1 cohort; NPS from 20 design partners.

---

## Era 4 — Platform Ecosystem (Month 25+)

| Track | Deliverables |
|-------|--------------|
| **Capability marketplace** | Install outcomes, not apps — [`MASTER-BLUEPRINT-INDEX.md`](./MASTER-BLUEPRINT-INDEX.md) Part 15 |
| **Partner integrations** | Event-subscription model, no direct DB access |
| **Internal control plane** | Verification console, Liv governance, marketplace approval |
| **Vertical registry expansion** | Groups 10–20 from [`VERTICAL-REGISTRY-MASTER.md`](./VERTICAL-REGISTRY-MASTER.md) |

**Not before:** V1 gate + Era 2 twin stable.

---

## Alignment with current repo status (2026-06-05)

| LIVIA-STATUS bucket | Plan alignment |
|---------------------|----------------|
| **A — Platform engineering** | Done — maintain; no R4 |
| **B — Screen implementation** | Done — R∞ polish only |
| **C — Founder UAT** | **Era 1 Q1 blocker** — sign Bucket C |
| **D — Launch & field** | Era 1 Q4 + Gate 2 |

| Active work | Plan guidance |
|-------------|---------------|
| GTM Wave 1 (9 verticals) | **Priority** — depth waves D0–D4; innovation P0 per [`VERTICAL-INNOVATION-PROGRAM.md`](./VERTICAL-INNOVATION-PROGRAM.md) |
| Subdomain + `/my` | **D0–D1 blocker** — retire `/b` UX before field GTM |
| Wellness waves 7+ | **Freeze** until Wave 1 exit criteria or explicit unlock |
| Liv setup copilot | **Era 1 Q1–Q3** — accelerates sacred metric |

---

## Engineering tracks mapping (PLATFORM-EVOLUTION A–H)

| Track | Era focus |
|-------|-----------|
| A — Composable policy | Q3 capability registry |
| B — API/contracts | Continuous |
| C — Events/workflows | Q3 event catalog |
| D — Experience/presets | Q2–Q3 wedge polish; Era 3 mass rollout |
| E — Liv runtime | Q1 setup copilot; Era 2 advisor |
| F — Trust/audit | Q1 basics; Era 3 engine |
| G — Guest/public | Era 1 subdomain book + `/my` (D0–D2); Era 3 W6 extensions |
| H — Exec/workforce | Continuous ops |

---

## What we deliberately do not build (until gated)

| Item | Era |
|------|-----|
| Marketplace / workflow packs as products | 4 |
| Multi-location enterprise | 3+ |
| White label / agency mode | 4+ |
| Custom domains on book host | 1b (post-subdomain) |
| International beyond EU core | 3 |
| Full healthcare EHR | Partner / never |
| 80 vertical code forks | Never — registry only |

---

## Weekly operating rhythm

| Cadence | Activity |
|---------|----------|
| **Weekly** | Activation metrics review (TTFB, WA businesses) |
| **Biweekly** | Gap matrix update if ship changed status |
| **Monthly** | Founder era review — are we diluting? |
| **Quarterly** | Era gate decision — proceed, extend, or cut |

---

## Success metrics dashboard (target)

| Metric | Era 1 | Era 2 | Era 3 |
|--------|-------|-------|-------|
| Activated businesses | 10 → 50 → 100 | 100+ | 250+ |
| Weekly active rate | 40%+ | 55%+ | 65%+ |
| Monthly retention | — | 70%+ | 75%+ |
| MRR | €1k → €10k | €10k+ | €50k |
| Time to first booking (median) | <7 days | <3 days | <24 hours |
| `/b` completion rate | 60%+ | 75%+ | 85%+ |

---

## Competitive moat sequence

Build moats in order — each depends on the prior:

```text
1. Activation speed + public `/b` trust
2. Operational return (inbox + mobile)
3. Event + capability coherence
4. Business Twin understanding
5. Liv proactive intelligence
6. Capability marketplace network effects
```

Skipping steps creates demo-ware, not a company.

---

## Founder decisions required

| Decision | By when |
|----------|---------|
| Sign Bucket C UAT | Era 1 Q1 |
| ~~Confirm IE wedge GTM~~ **Locked:** GTM Wave 1 — all nine verticals ([`GTM-VERTICAL-DEPTH-PROGRAM.md`](./GTM-VERTICAL-DEPTH-PROGRAM.md)) | 2026-06-05 ✅ |
| Prod pricing switch | Era 1 Q4 |
| V1 gate declaration (pass / extend) | Era 2 Q1 |
| Guest vault pulled to Era 1 D1 — extensions vs commerce in Era 2 | Era 1 D1 |

---

## Document authority

| Question | Doc |
|----------|-----|
| What to build this quarter? | **This plan** |
| What is V1 scope? | [`V1-PRODUCT-DEFINITION.md`](./V1-PRODUCT-DEFINITION.md) |
| What is architecture? | [`MASTER-BLUEPRINT-INDEX.md`](./MASTER-BLUEPRINT-INDEX.md) |
| What exists vs gaps? | [`REPO-VS-BLUEPRINT-GAP-MATRIX.md`](./REPO-VS-BLUEPRINT-GAP-MATRIX.md) |
| Surface locks (R1–R3) | [`LIVIA-FINAL-BUILD-PLAN.md`](./LIVIA-FINAL-BUILD-PLAN.md) |
| Where are we today? | [`LIVIA-STATUS.md`](../LIVIA-STATUS.md) |
| GTM vertical depth? | [`GTM-VERTICAL-DEPTH-PROGRAM.md`](./GTM-VERTICAL-DEPTH-PROGRAM.md) |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-05 | GTM Wave 1 lock — nine verticals, depth waves D0–D4, subdomain + `/my`, innovation program |
| 2026-06-05 | V3 canonical — audit 24-month plan + repo reality + V1 gate |
