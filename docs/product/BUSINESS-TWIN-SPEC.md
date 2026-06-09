# Business Twin Specification

**Status:** canonical Volume D (2026-06-05)  
**Audience:** founder, product, engineering, Cursor, Liv team  
**Priority:** Critical — largest long-term moat; V2+ as user-facing product, V1 as seed infrastructure  
**Repo (distributed):** `liv-presence.service.ts`, `liv-signals.service.ts`, `liv-memory.service.ts`, `morning-briefing.service.ts`, `org-shape.ts`

---

## Executive finding

Most software **stores** information. Very little software **understands** what information means.

| Without Twin | With Twin |
|--------------|-----------|
| Booking platform | People Business Operating System |

The Business Twin transforms **data → understanding**.

---

## What the Twin is not

- Analytics dashboards  
- Reporting charts  
- AI chat responses  
- Duplicate database tables  

The Twin is **Livia's understanding of a business**.

---

## Definition

A continuously evolving digital representation of a business, constructed from facts, events, relationships, capabilities, commerce, trust signals, and observed behaviour.

The Twin answers:

1. What is happening?  
2. Why is it happening?  
3. What is likely to happen?  
4. What should happen next?  

---

## Core rule

**The Twin never owns data.**

| Bad | Good |
|-----|------|
| `business_twin` table duplicating bookings | Twin **references** bookings, customers, events and produces understanding |

---

## Five-layer pipeline (canonical)

```text
Events
  ↓
Facts        (verified truths — no interpretation)
  ↓
Signals      (patterns — movement)
  ↓
Observations (meaningful interpretations)
  ↓
Insights     (business-relevant understanding)
  ↓
Recommendations (suggested actions)
```

### Layer examples

| Layer | Example |
|-------|---------|
| **Fact** | 5 staff; 212 customers; 14 bookings today; €1,250 revenue this week |
| **Signal** | Bookings increasing; review rate improving; revenue volatile |
| **Observation** | Peak hours shifting later; weekend demand increasing |
| **Insight** | Business underutilized on Tuesdays; most revenue from three services |
| **Recommendation** | Promote Tuesday bookings; request reviews after completion |

Every observation and recommendation must include: evidence, confidence, timestamp, domain.

---

## Six understanding domains

| Domain | Questions | Outputs |
|--------|-----------|---------|
| **Operational health** | Bookings healthy? Staff utilization? Scheduling? | Operational signals |
| **Revenue health** | Growing? Stable? Which services drive value? | Revenue signals |
| **Relationship health** | Customers returning? Disappearing? Strengthening? | Relationship signals |
| **Trust health** | Reviews increasing? Reputation improving? | Trust signals |
| **Growth health** | Demand increasing? Acquisition improving? | Growth signals |
| **Capability health** | Which capabilities used/ignored/create value? | Capability signals |

**Business health score:** six domain scores — never one meaningless vanity number.

---

## Twin inputs (primary = events)

Bookings, customers, reviews, messages, payments, capabilities, availability, staff, events, trust, policies.

Everything should eventually become **event-driven**.

---

## Twin memory

The Twin must understand **past, present, trajectory** — not merely current state.

| Bad | Good |
|-----|------|
| Revenue = €1000 | Revenue increasing 12% for six consecutive weeks |

---

## Twin API surface (target)

| Output | Purpose |
|--------|---------|
| `BusinessSummary` | At-a-glance understanding |
| `HealthSnapshot` | Six-domain scores |
| `Recommendations` | Actionable next steps |
| `Risks` | Detected threats |
| `Opportunities` | Detected upside |

**Founder dashboard eventually becomes Business Twin Dashboard** — understanding, not reports.

---

## Integration contracts

### Liv

```text
Liv → consumes Twin outputs
Twin → owns understanding
```

**Forbidden:** Liv performs business reasoning directly (e.g. "analyze revenue" in prompt).

### Capability Graph

- Graph: *What can the business do?*  
- Twin: *How is the business doing?*  

### Experience OS

- Twin: *What information matters?*  
- Experience: *How information is shown?*  

### Trust

Trust signals feed relationship, growth, and revenue health domains.

---

## Repo status (2026-06-05)

No `business-twin` package or service. Understanding is **distributed**:

| Module | Twin layer today |
|--------|------------------|
| `liv-presence.service.ts` | Context assembly — briefing, stats, chain rollup, Liv moments |
| `liv-signals.service.ts` | Signal storage (`liv_signals` table) |
| `liv-memory.service.ts` | Entity episodic memory for prompts |
| `morning-briefing.service.ts` | Owner briefing generation |
| `org-shape.ts` | Live signals → configuration codes C1–C13 |
| `chain-rollup.service.ts` | Multi-location aggregates |

**Assessment:** EXISTS_PARTIAL — right instincts, wrong boundaries.

---

## Build phases

### Phase 0 — V1 seed (now)

- [ ] Document which existing services map to which Twin layer (this spec)  
- [ ] Ensure booking/commerce/review events feed `liv_signals` via `liv-reactions.service.ts`  
- [ ] Morning briefing uses only structured signals — no raw SQL in prompts  

### Phase 1 — Twin service (Era 2 Q1)

- [ ] `artifacts/api-server/src/services/business-twin.service.ts`  
- [ ] `GET /me/twin/summary`, `/health`, `/recommendations`  
- [ ] Facts computed from events + DB references (read-only)  
- [ ] Signal engine: scheduled + event-triggered recomputation  

### Phase 2 — Full pipeline (Era 2 Q2–Q3)

- [ ] Observations + insights with evidence objects  
- [ ] Twin events (`InsightGenerated`, etc.) → Liv reactions  
- [ ] Founder dashboard widgets sourced from Twin API only  

### Phase 3 — Predictive (Era 3)

- [ ] Trajectory models per domain  
- [ ] Risk/opportunity detection  
- [ ] Cross-tenant benchmarks (anonymized) — optional Era 4  

---

## Anti-patterns (forbidden)

- Duplicate data in Twin tables  
- Dashboard logic inside Twin (Twin produces understanding; dashboards render it)  
- Business rules inside Twin (rules live in Policy)  
- Liv reasoning inside Twin  
- Vertical-specific Twin forks (Twin is universal; vertical affects vocabulary only)  

---

## Feature gate

Every future feature must answer: **How does this improve the Business Twin's understanding?**

If it doesn't, question whether it belongs.

---

## Long-term benchmark

A business owner opens Livia. Before asking questions, viewing reports, or opening bookings, the platform already understands what's happening, why it matters today, and what actions should be taken.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-05 | Volume D canonical — distributed repo map + build phases |
