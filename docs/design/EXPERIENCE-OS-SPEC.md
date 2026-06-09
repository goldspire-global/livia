# Experience OS Specification

**Status:** canonical Volume F (2026-06-05)  
**Audience:** product, design, engineering, Cursor  
**Companion:** [`EXPERIENCE-ARCHITECTURE.md`](./EXPERIENCE-ARCHITECTURE.md) (five-layer preset model + rollout)  
**Repo hub:** `tenant-experience.ts`, `presentation-presets.ts`, `tenant-experience.service.ts`

---

## Executive finding

Most software presents **one interface for everyone**.

Livia presents the **right experience for the right person at the right time on the right device**.

Experience is not theme, color, or dark mode. Experience controls: **what appears, when, why, how it behaves**.

---

## Definition

The Experience OS is a runtime system that resolves the most appropriate experience for a specific user based on context.

```text
Business + Role + Device + Capabilities + Presentation Pack + Context + Twin Insights
  =
Resolved Experience
```

---

## Six resolution layers

| Layer | Determinant | Examples |
|-------|-------------|----------|
| **1. Role** | Strongest determinant | Founder, manager, receptionist, staff, customer |
| **2. Device** | Intention of use | Mobile (action), tablet (ops), desktop (management) |
| **3. Capability** | What can appear | Deposits off → deposit UI gone |
| **4. Presentation** | Expression (not function) | Harbour Light, Studio Pulse, Ink Flow |
| **5. Context** | Relevance now | Current booking, customer arrived, risk flagged |
| **6. Liv** | What matters | Liv identifies priority; Experience decides presentation |

**Separation:** Liv decides *what matters*. Experience OS decides *how it appears*.

---

## Role experiences

| Role | Primary question | Surface emphasis |
|------|------------------|------------------|
| **Founder** | How is my business doing? | Revenue, bookings, opportunities, risks, Liv briefing |
| **Manager** | How is the team performing? | Schedule, staff, coverage, issues |
| **Receptionist** | Who needs attention now? | Check-ins, today's bookings, arrivals, messages — tablet-first, high speed |
| **Staff** | What do I do today? | Appointments, customers, tasks, notes |
| **Customer** | How do I book? | Fast, trustworthy, beautiful — very low density |

---

## Device resolution

Same capability, different presentation:

| Capability | Mobile | Tablet | Desktop |
|------------|--------|--------|---------|
| Bookings | Card stream | Timeline | Calendar + insights |

---

## Presentation packs

Packs change **expression**, not functionality.

| Pack | Vertical feel | Character |
|------|---------------|-----------|
| **Harbour Light** | Wellness | Calm, bright, reassuring |
| **Session Rail** | Therapists | Operational, minimal, schedule-first |
| **Studio Pulse** | Beauty | Energetic, portfolio-first |
| **Ink Flow** | Tattoo | Creative, portfolio-heavy, trust-centric |
| **Coach Path** | Coaching | Progress, milestones |
| **Fit Momentum** | Fitness | Performance, achievement |

**Repo:** `lib/policy/src/presentation-presets.ts` — four presets per vertical; `presentation-surface.ts` maps layout morphs.

---

## Context layer

Context influences **what appears first**:

- Customer arrives → receptionist sees check-in actions, not reports  
- Retention risk flagged → founder sees briefing card/banner  
- Onboarding incomplete → setup assistant surfaces first  

---

## Experience resolution engine (target)

```text
Role → Device → Capabilities → Presentation Pack → Context → Liv → Resolved Experience
```

Central engine becomes first-class — today distributed across policy resolve + dashboard hooks.

---

## Dynamic navigation

Navigation resolves from capabilities + role + context — **not hardcoded** for all users.

| Bad | Good |
|-----|------|
| Bookings, Messages, Reviews, Settings for everyone | Navigation generated from resolved capability set |

---

## Experience density

| Role | Density | Goal |
|------|---------|------|
| Founder | Low density, high insight | Decisions |
| Receptionist | High density, high speed | Throughput |
| Customer | Very low density | Clarity |

---

## Vertical adaptation (priorities, not forks)

| Vertical | Prioritizes |
|----------|-------------|
| Beauty | Portfolio, reviews, bookings |
| Wellness | Relationships, memberships, consistency |
| Tattoo | Portfolio, consultation, trust |
| Coaching | Progress, programs, milestones |

Same platform. Different **priority ordering** in home modules and public `/b`.

---

## Public Experience OS

The booking page resolves per vertical:

| Vertical | Public emphasis |
|----------|-----------------|
| Tattoo | Trust + portfolio |
| Beauty | Reviews + visuals |
| Wellness | Calm + expertise |
| Coaching | Transformation + outcomes |

**Repo:** `public-booking.tsx`, guest surfaces in policy, presentation on `/b`.

---

## Accessibility & performance (mandatory)

- Keyboard navigation, screen readers, reduced motion, high contrast, responsive layouts  
- Interaction feedback target: **<100ms**  
- Motion is functional (state, progress, hierarchy) — never decorative delay  

---

## Repo status (2026-06-05)

| Area | Status |
|------|--------|
| `resolveTenantExperience()` | ✅ Strong |
| Presentation presets + morphs | ✅ Strong |
| Role-based routes (owner/staff) | ✅ Adequate |
| Device morph (`use-surface-class`) | ⚠️ Wellness-biased; not full P×V×surface matrix |
| Dynamic navigation from capabilities | ⚠️ Partial — some hardcoded nav |
| Context-aware surfacing | ⚠️ Partial — Liv moments exist, not unified |
| Preset visual rollout (36 presets) | ⚠️ Doc/PNG gaps per audit |

**Assessment:** EXISTS_STRONG architecture; implementation uneven on device/persona/context.

---

## Relationship to EXPERIENCE-ARCHITECTURE.md

| Doc | Authority |
|-----|-----------|
| **This spec (Volume F)** | Role, device, capability, context, Liv participation model |
| **EXPERIENCE-ARCHITECTURE.md** | Five-layer stack (capability → preset → brand → persona → surface), rollout phases |

Both must agree: **capabilities never depend on presentation**.

---

## Anti-patterns (forbidden)

- Hardcoded dashboards per vertical code branch  
- Vertical-specific UI forks (duplicate pages)  
- Static navigation for all roles  
- Role-ignorant interfaces  
- Capability-ignorant interfaces (dead UI when feature off)  

---

## UI decision gate

Every UI decision must answer:

1. Who is this for?  
2. What are they trying to achieve?  
3. Why are we showing this now?  

If unanswered, the experience is not ready.

---

## Long-term benchmark

Two businesses on the same platform both feel *Livia was built for me* — shared architecture, capabilities, intelligence, infrastructure.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-05 | Volume F canonical — linked to EXPERIENCE-ARCHITECTURE |
