# Vertical Registry Master

**Status:** canonical Volume G (2026-06-05)  
**Audience:** founder, product, engineering, Cursor, experience team  
**Repo hub:** `lib/policy/src/verticals.ts`, `vertical-coverage.ts`, `VERTICAL_COVERAGE_REGISTRY`  
**Rule:** 80 verticals = 80 configurations = **1 platform**

---

## Executive finding

The biggest strategic mistake: believing **80 verticals = 80 products**.

Correct model:

```text
80 verticals = 80 configurations on 1 platform
```

Verticals define business archetypes — capability requirements, trust requirements, experience priorities, Liv emphasis.

---

## Five dimensions of every business

```text
Business Type → Capabilities → Trust Requirements → Experience Priorities → Growth Patterns
```

---

## Registry entry structure

Every vertical (and subvertical) must define:

| Field | Purpose |
|-------|---------|
| `vertical` | Stable id |
| `description` | What businesses in this archetype do |
| `subverticals` | Specializations inheriting parent |
| `required_capabilities` | Must have to operate |
| `optional_capabilities` | Upsell / maturity |
| `trust_requirements` | Verification, licenses, consent |
| `experience_pack` | Default presentation preset |
| `liv_focus` | What Liv emphasizes (not different Liv) |
| `primary_metric` | Success measure for this archetype |

---

## Code verticals today (9 packs)

Registered in `businessVerticalSchema` / `VERTICAL_PACKS`:

| Vertical | Label | Default experience pack | Liv focus (target) |
|----------|-------|-------------------------|-------------------|
| `hair` | Hair & barbering | Studio Pulse family | Retention, rebook |
| `beauty` | Beauty & nails | Studio Pulse | Reviews, repeat visits |
| `wellness` | Wellness & therapy | Harbour Light | Memberships, consistency |
| `body-art` | Tattoo & piercing | Ink Flow | Consultations, deposits |
| `fitness` | Fitness & training | Fit Momentum | Attendance, retention |
| `medspa` | Medspa & aesthetics | Clinical polish presets | Compliance, packages |
| `allied-health` | Allied health | Session Rail | Session consistency |
| `pet-grooming` | Pet grooming | (pack TBD) | Repeat visits |
| `automotive-detailing` | Auto detailing | (pack TBD) | Job completion |

**CI:** `pnpm vertical:check` — registry, presets, doc propagation, announcement handshake.

---

## Master vertical catalog (20 groups — blueprint)

Expansion framework beyond code verticals. Subverticals inherit parent unless overridden.

### 01 — Beauty
Subverticals: hair stylist, barber, nail, lash, brow, makeup, skincare, aesthetician, mobile beauty.  
Required: Bookings, Availability, Reviews, Messaging, Portfolio. Optional: Deposits, Memberships, Packages.  
Pack: Studio Pulse. Metric: **Repeat visits**.

### 02 — Wellness
Subverticals: massage, recovery, holistic, reiki, float, meditation.  
Required: Bookings, Messaging, Intake, Memberships. Pack: Harbour Light. Metric: **Client consistency**.

### 03 — Tattoo / Body-art
Subverticals: tattoo artist, studio, cosmetic tattoo, piercing.  
Required: Bookings, Deposits, Portfolio, Messaging. Trust: verification, consent. Pack: Ink Flow. Metric: **Consultation conversion**.

### 04 — Fitness
Subverticals: PT, coach, small gym, yoga, pilates, bootcamp.  
Required: Scheduling, Memberships, Programs. Pack: Fit Momentum. Metric: **Member retention**.

### 05 — Coaching
Subverticals: life, business, career, executive, relationship.  
Required: Bookings, Programs, Messaging. Pack: Coach Path. Metric: **Program completion**.

### 06 — Education
Subverticals: tutor, language, music, exam prep.  
Required: Scheduling, Programs. Metric: **Student progress**.

### 07 — Healthcare light
Subverticals: physio, chiro, OT, speech. Not hospitals.  
Required: Scheduling, Intake, Records. Trust: license verification. Metric: **Patient outcomes**.

### 08 — Mental health
Subverticals: counselor, therapist, psychologist.  
Required: Scheduling, Notes, Intake. Pack: Session Rail. Metric: **Session consistency**.

### 09 — Home services
Subverticals: cleaning, plumbing, electrical, gardening.  
Required: Jobs, Scheduling, Estimates. Metric: **Jobs completed**.

### 10 — Creative services
Subverticals: photographer, videographer, designer.  
Required: Portfolio, Projects. Metric: **Lead conversion**.

### 11 — Pet services  
### 12 — Events  
### 13 — Automotive services  
### 14 — Consulting  
### 15 — Professional services (accountant, legal) — high trust  
### 16 — Real estate services  
### 17 — Recruitment  
### 18 — Religious & community  
### 19 — Non-profits  
### 20 — **Custom** — Liv assists capability mapping when no fit

---

## Nine core vertical groups (audit consolidation)

For platform planning, organize around **9 foundational groups** (not 80):

1. Beauty  
2. Wellness  
3. Fitness  
4. Creative services  
5. Coaching & education  
6. Healthcare & professional care  
7. Home & field services  
8. Pet services  
9. Events & hospitality  

Each group contains many subverticals as **configuration profiles**, not code forks.

---

## Inheritance rules

```text
Subvertical inherits from parent:
  - capabilities (unless override)
  - trust requirements
  - experience defaults
  - Liv behaviour emphasis
```

Example under Beauty:

| Subvertical | Adds |
|-------------|------|
| Hair stylist | Consultation emphasis, portfolio |
| Lash artist | Patch testing capability, before/after |

Capability model stays composable.

---

## Vertical resolution engine (target)

```text
Business → Vertical → Subvertical (categoryAlias) → Capabilities → Trust → Experience → Liv Context
```

**Repo today:** Business → vertical enum → pack → `resolveTenantExperience()`. Subvertical = `categoryAliases` string matching, not enum.

**Gap:** No `subverticalProfileId` on business yet — **GTM Wave 1 D0** adds profile at create per [`GTM-VERTICAL-DEPTH-PROGRAM.md`](./GTM-VERTICAL-DEPTH-PROGRAM.md) §5.

**Onboarding flow (target):** Vertical pick → sub-segment profile (lash studio, nail salon, …) → org shape (solo / staff / chair-rental / multi-site) → optional starter pack → subdomain publish.

---

## Liv adaptation rules

**One Liv.** Emphasis changes by context:

| Vertical context | Liv emphasizes |
|------------------|----------------|
| Beauty | Retention, reviews, repeat bookings |
| Wellness | Memberships, utilization, consistency |
| Tattoo | Consultations, deposits, portfolio |
| Fitness | Attendance, memberships |

Same intelligence. Different priorities surfaced.

---

## Expansion framework (no engineering rewrite)

1. Identify business type  
2. Map required capabilities  
3. Map trust requirements  
4. Map experience requirements  
5. Map Liv focus  
6. Register in Vertical Registry  
7. Run `pnpm vertical:check`  

New vertical = new **configuration row**, not new product.

---

## Strategic benchmark

A new business category appears. Founder adds registry entry. Capabilities, experience, trust, onboarding, and Liv resolve. Business launches **without engineering creating a new product**.

---

## Final rule

When a new vertical is proposed, ask: **What capabilities does it require?** — not what screens it needs.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-05 | Volume G canonical — 9 code verticals + 20-group catalog |
