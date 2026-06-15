# Repo vs Blueprint Gap Matrix

**Status:** canonical (2026-06-15) — **replaces audit PDF Part 20 as live authority**  
**Audience:** founder, engineering, product, Cursor  
**Method:** Deep Audit V1 + repo exploration + blueprint volumes A–H + **`pnpm readiness:score`** rubric  
**Update:** After each era gate or quarterly review

---

## Executive summary

Livia is **significantly more advanced than a typical startup MVP** in architecture, and **significantly less mature than production SaaS** in market proof.

| Dimension | V1 headline | Engineering rubric | Reality |
|-----------|-------------|-------------------|---------|
| Vision | 9.5 / 10 | — | People Business OS direction is clear and documented |
| Architecture | **9 / 10** | — | Policy hub hardened (effective gates, schema split); OpenAPI + Liv runtime |
| Documentation | 9 / 10 | — | Canonical blueprint volumes + rubric scorecard |
| Product completeness | **5 / 10** | 7–9 / 10 | Core loops on staging; mutation paths + field proof open |
| Activation readiness | **4 / 10** | 6–7 / 10 | Demo + UAT E2E + onboarding gates; funnel dashboard + Gate 2 open |
| Commercial readiness | **3.5 / 10** | 3.5–5 / 10 | Stripe deposits on staging; prod subscription + MRR proof open |
| Market readiness | **2 / 10** | 2 / 10 | GTM Wave 1 locked in docs; no Dublin field proof yet |
| Founder acceptance (Bucket C) | **80%** | 80% | Staging gates green; founder walkthrough not signed |

**Score authority:** `lib/policy/src/production-readiness-program.ts` · run `pnpm readiness:score -- --run-gates --live-staging` for live evidence. V1 headline caps engineering-heavy rubric until mutation coverage, funnel dashboard, and prod billing clear.

**Strategic objective:** coherence — not more vision documents.

**GTM Wave 1 (2026-06-05):** Founder lock — all nine code verticals at one creative parity bar; retire user-facing `/b` for subdomain book + `/my` relationship. [`GTM-VERTICAL-DEPTH-PROGRAM.md`](./GTM-VERTICAL-DEPTH-PROGRAM.md).

---

## System-by-system matrix

| # | Blueprint system | Status | Primary repo paths | Gap vs spec |
|---|------------------|--------|-------------------|-------------|
| 1 | **Policy layer** | 🟢 Strong | `lib/policy/*`, `vertical:check` | Scattered notification/wedge policies; no single policy graph diagram |
| 2 | **Vertical registry** | 🟢 Strong | `verticals.ts`, `vertical-coverage.ts` | `subverticalProfileId` at create (D0); 9 code vs 20 master catalog |
| 3 | **Experience OS** | 🟢 Strong | `tenant-experience.ts`, presets, dashboard hooks | Device/persona matrix uneven; dynamic nav partial |
| 4 | **Liv runtime** | 🟢 Strong | `lib/liv-runtime`, setup copilot v1 (`liv-setup/assist`) | Write-path configure tools (Track I-B); Twin consumption in prompts |
| 5 | **V1 activation** | 🟢 Strong | `activation-metrics.ts`, milestone UI web+mobile, ops rollup | Founder activation funnel dashboard (Q4) |
| 6 | **Comms / relationship** | 🟡 Strong core | `conversations.service.ts`, inbox | Relationship entity missing; WA/IG/customer push partial |
| 7 | **Event taxonomy** | 🟡 Partial | `event-catalog.ts`, `analytics-event-bridge.ts` | Dual systems; not all mutation paths publish yet |
| 8 | **Capability graph** | 🟢 Strong (P1) | `capability-registry.ts`, `capability-instances.ts`, `GET /capabilities` | Instance v0 shipped (JSON + reconcile); dynamic nav polish (Q3) |
| 9 | **Business twin** | 🟡 Partial | `business-twin.service.ts`, `GET /twin/*` | Observations/insights pipeline; briefing migration (Era 2) |
| 10 | **Trust layer** | 🟡 Partial | mandate, audit, reviews | No earned-trust engine; no unified Trust Profile |
| 11 | **Commerce intelligence** | 🟡 Partial | Stripe, payments | Transactions yes; revenue/cash-flow intelligence no |
| 12 | **Marketplace** | 🔴 Doc only | — | Era 4 — intentionally deferred |
| 13 | **Internal control plane** | 🟡 Partial | internal portal specs | Exec cockpit partial; verification console thin |

Legend: 🟢 Strong · 🟡 Partial · 🔴 Missing / deferred

---

## What exists (repo inventory)

### Kernel ✅

- Multi-tenant auth (Clerk), business/membership, bookings, customers, services, staff  
- Availability, payments foundation (Stripe), reviews, portfolio basics  
- OpenAPI + codegen, domain events (partial), audit log (hash chain)  
- Demo seeds, 9 vertical packs, public `/b`, mobile app  

### Intelligence ⚠️

- Liv tool registry + execution + mandate gating  
- Liv signals, memory, morning briefing, presence assembly  
- AI disclosure (EU), eval partial  

### Surfaces ⚠️

- Dashboard density program (Bucket B done)  
- Founder UAT pipeline (Bucket C in progress)  
- Gateway/marketing/internal — partial vs northstar PNGs  
- Wellness depth pages (ahead of V1 — gate in execution plan)  

---

## Architectural risks (from audit — still live)

| Risk | Symptom in repo | Mitigation |
|------|-----------------|------------|
| **Parallel systems** | event-bus vs events table; twin vs briefing | Unify per blueprint phases |
| **Vertical explosion** | Wellness ops pages without capability graph | Map features to capabilities; V1 filter |
| **Appointment trap** | Rich booking UI, weak relationship/commerce intelligence | Category manifesto + V1 messaging |
| **Building V2 before V1 proof** | Twin/marketplace in docs; wellness chain/reports shipped | Execution plan Era gates |

---

## Strongest systems (extend, don't replace)

1. Policy layer (`@workspace/policy`)  
2. Tenant experience resolution  
3. Presentation presets  
4. Vertical playbooks / packs  
5. Liv runtime  
6. OpenAPI contract layer  
7. Mobile architecture  
8. Public `/b` surface  

---

## Priority gap closure (ordered)

### P0 — V1 proof (Era 1, immediate)

| Gap | Action | Owner |
|-----|--------|-------|
| Founder staging UAT not signed | Complete Bucket C walkthrough | Founder |
| Activation speed | 60-second enter + Liv-led setup polish | Product + eng |
| Public `/b` under 2 min book+pay | Perf + UX pass on beauty/wellness/body-art demos | Design |
| First-booking analytics | Event + dashboard for time-to-first-booking | Eng |

### P1 — Coherence (Era 1 Q2–Q3)

| Gap | Action |
|-----|--------|
| Event dual system | `EVENT_CATALOG` + bridge logEvent → domain bus |
| Capability registry Phase 1 | `capability-registry.ts` + CI |
| Relationship entity | First-class Relationship aggregate + API |
| Dynamic nav from capabilities | Remove hardcoded nav where capability-gated |

### P2 — Understanding (Era 2)

| Gap | Action |
|-----|--------|
| Business Twin service | `business-twin.service.ts` + `/me/twin/*` |
| Capability instances | Persistence + readiness engine |
| Liv Advisor mode | Twin → Liv recommendation pipeline |

### P3 — Growth & platform (Era 3–4)

| Gap | Action |
|-----|--------|
| Commerce intelligence layers | Revenue/cash-flow beyond transactions |
| Trust engine | Trust Profile + verification workflows |
| Marketplace capability packs | Outcome-based install UX |

---

## Vertical depth vs V1 scope

| Work | V1 aligned? | Note |
|------|-------------|------|
| Core booking + `/b` + onboarding gate | ✅ | Sacred path |
| Beauty/wellness presentation presets | ✅ | Supports trust + activation |
| Wellness chain, reports, TV, guest vault pages | ⚠️ | Valuable demo depth — **do not block V1 launch**; gate new depth behind Era 1 Q2 |
| Marketplace, twin dashboard, advanced Liv | ❌ V1 | Scheduled Era 2+ |

---

## Maturity vs blueprint volumes

| Volume | Repo alignment |
|--------|----------------|
| A — V1 Definition | Activation gate ✅; scope creep risk from wellness ⚠️ |
| B — Data Model | Core entities ✅; Relationship, Capability Instance ❌ |
| C — Capability Graph | Declarative phase 1 ⚠️ |
| D — Business Twin | Distributed partial ⚠️ |
| E — Liv Runtime | V1 assistant ✅ |
| F — Experience OS | Resolution ✅; full role/device ⚠️ |
| G — Vertical Registry | 9 packs ✅; 20-group catalog doc only |
| H — Event Taxonomy | Partial ⚠️ |

---

## Next review triggers

Update this matrix when:

- Bucket C UAT signed  
- 10 activated businesses (Era 1 Q1 metric)  
- Event catalog CI lands  
- Twin service Phase 1 ships  
- V1 exit criteria met (100 businesses, 70% retention, €10k MRR)  

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-15 | Production readiness rubric (`production-readiness-program.ts`, `pnpm readiness:score`); V1 headline scores tightened (5/4/3.5/2/80%) |
| 2026-06-05 | Initial live matrix — audit Part 20 + repo exploration |
