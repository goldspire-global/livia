# GTM vertical depth program

**Status:** canonical — founder lock (2026-06-05)  
**Supersedes:** ad-hoc “heartland vs beta-full” tier split for GTM honesty  
**Authority chain:** [`LIVIA-CONSTITUTION.md`](./LIVIA-CONSTITUTION.md) → this doc → [`VERTICAL-INNOVATION-PROGRAM.md`](./VERTICAL-INNOVATION-PROGRAM.md) → per-vertical program docs  
**Execution:** [`LIVIA-MASTER-EXECUTION-PLAN-V3.md`](./LIVIA-MASTER-EXECUTION-PLAN-V3.md) Era 1 (revised)  
**Innovation detail:** [`VERTICAL-INNOVATION-PROGRAM.md`](./VERTICAL-INNOVATION-PROGRAM.md)

---

## Founder decision (locked)

Livia GTM is **not** “lash studio software” or “three wedges at different maturity.” It is:

> **Nine vertical packs at one creative parity bar** — every sub-segment in each vertical can onboard with the right org shape, menu physics, guest relationship, and demo depth so **both the business and the end client** measurably benefit.

If a feature does not help the operator **or** the guest (ideally both), it does not ship.

---

## Naming system (stop confusing release numbers with Liv autonomy)

| Layer | What it means | Doc |
|-------|----------------|-----|
| **Era** (0→4) | Company phase — activation → understanding → growth → ecosystem | `LIVIA-MASTER-EXECUTION-PLAN-V3.md` |
| **GTM Wave** | What we sell publicly — same exit checklist per vertical | **this doc** |
| **Depth wave** (D0–D4) | Engineering sequencing inside Era 1 | §6 below |
| **Liv rung** (R0–R4) | How autonomous Liv is — policy only | `lib/policy/src/liv-mandate.ts` |

**Do not use R1–R3 in GTM conversations.** Those are historical engineering release locks (closed in repo).

---

## GTM Wave 1 — all nine code verticals

Every row ships with the **same GTM package** (§4). No vertical markets at “v3 depth” while another is “v1 basics.”

| Code vertical | GTM label | Demo slug | Sub-segments (onboard profiles) |
|---------------|-----------|-----------|--------------------------------|
| `hair` | Hair & barbering | `luxe-salon-spa` | salon, barber, colour studio, chair-rental host, mobile stylist |
| `beauty` | Beauty & aesthetics (retail aisle) | `bloom-beauty-dublin` | lash, nail, brow, wax, facial, spray tan, PMU-light, mobile beauty, multi-service studio |
| `wellness` | Wellness & spa | `harbour-wellness-cork` | massage, recovery, float, holistic, reiki, couples, day spa, hotel spa |
| `body-art` | Tattoo & piercing | `ink-anchor-galway` | custom tattoo, walk-in flash, piercing, cosmetic tattoo, guest spot artist |
| `medspa` | Medspa & aesthetics clinic | `clarity-medspa-dublin` | injectables, laser, skin clinic, body contouring, membership clinic |
| `allied-health` | Allied health | `motion-physio-cork` | physio, chiro, OT, speech, sports rehab, pelvic health |
| `fitness` | Fitness & training | `peak-fitness-dublin` | boutique class, PT studio, hybrid gym, yoga/pilates, bootcamp |
| `pet-grooming` | Pet grooming | `paws-parlour-dublin` | salon grooming, mobile groomer, multi-pet household, temperament-sensitive |
| `automotive-detailing` | Auto detailing | `shine-studio-belfast` | detail bay, ceramic coating, fleet, pickup/drop-off mobile |

**Partner-only (not Wave 1 GTM):** dental, mental health, hospital-scale care — see [`PARTNER-AND-ADJACENT-VERTICALS.md`](./PARTNER-AND-ADJACENT-VERTICALS.md).

---

## GTM package — same bar for every vertical

A vertical is **GTM-ready** when all rows pass:

| # | Criterion | Business benefit | Guest benefit |
|---|-----------|------------------|---------------|
| 1 | **Sub-segment onboarding** | Pick org shape + category at create; starter pack matches sub-segment | N/A |
| 2 | **Guest book surface** | Branded `{slug}.livia-hq.com` (not `/b`) — publish in <2 min | Book without account; feels like the studio |
| 3 | **Guest vault `/my`** | Fewer “where’s my appointment?” calls | Manage visit, message, rebook per shop — vertical morph |
| 4 | **Relationship depth** | Customer profile shows vertical-native memory (not generic notes) | Guest sees purposeful history (fills, proof, packs, pets, vehicles) |
| 5 | **Inbox + Liv** | DM/SMS → thread → action with vertical vocabulary | Replies on their channel; no dead ends |
| 6 | **Demo world** | Founder demo tells sub-segment story in 5 min | Guest hub seed shows real cross-shop relationship |
| 7 | **Innovation P0** | Operator “damn” moment from innovation program | Guest “this gets my world” moment |
| 8 | **Founder smoke** | Program doc smoke path green | E2E slug + guest hub path |
| 9 | **Doc propagation** | `pnpm vertical:doc-check` | — |

---

## Guest surface architecture (retire `/b` as a concept)

**User-facing:** no `/b/{slug}` paths in marketing, SMS, email, or hub links.

| Surface | URL pattern | Role |
|---------|-------------|------|
| **Book** | `https://{slug}.livia-hq.com` (wildcard subdomain) | Acquisition + new booking — business brand |
| **Relationship** | `https://app.livia-hq.com/my` and `/my/{slug}/…` | Returning guest vault — vertical-tailored manage visit |
| **Token actions** | `{slug}.livia-hq.com/v/{token}` (internal route family; not “public b”) | SMS deep links: running late, proof, consent, pay |
| **Custom domain** | `book.{their-domain}.ie` | Wave 1b upgrade — same engine |

**Migration:** 301 `/b/{slug}` → subdomain; hub `visitUrl` → `/my/{slug}/visit/{id}` when relationship shell ships (D1).

Policy hub: update `guest-surfaces.ts` route patterns to **hostname + path family**, not `/b` prefix.

---

## Sub-segment onboarding (org structure)

**Today:** `vertical` enum + optional `category` string.  
**Target (D0):** `subverticalProfileId` at business create — maps to:

```text
vertical enum
  → subvertical profile (lash studio | nail salon | …)
    → default capabilities enabled
    → starter pack menu + copy
    → org shape template (solo | owner+staff | chair rental | multi-site)
    → guest relationship modules for /my
    → Liv mandate emphasis (not different Liv)
```

**Rule:** Sub-segments are **configuration**, not code forks. New lash studio ≠ new repo vertical.

Implementation path: extend `vertical-starter-packs.ts` with per-subvertical profiles; onboarding wizard step “What kind of studio?” after vertical pick.

---

## Relationship contract — both sides must win

Every vertical ships a **bilateral value matrix** in the innovation program. Minimum platform primitives:

| Primitive | Business gets | Guest gets |
|-----------|---------------|------------|
| **Vertical memory** | Preferences at chair (lash map, pet temperament, vehicle plate) | “They remember me” on `/my` |
| **Thread continuity** | One inbox per guest across channels | Replies where they already message |
| **Visit shell** | Running late, cancel policy, upsell window | Manage without calling front desk |
| **Rebook rhythm** | Fill cycle / plan cadence / pack burn surfaced on Today | One-tap rebook from `/my` |
| **Trust artifacts** | Patch test, consent, proof, PARQ on file | Confidence the studio is professional |

**Anti-pattern:** Redirect authenticated `/my` guest to anonymous book page for “manage visit.”

---

## Demo seed depth (Wave 1 minimum)

Extends [`PER-VERTICAL-DEMO-SEED.md`](./PER-VERTICAL-DEMO-SEED.md).

| Vertical | Hero artifact | Guest hub (`/my`) | Relationship threads |
|----------|---------------|-------------------|----------------------|
| hair | Colour-day + stylist preference | Mary @ Luxe upcoming colour | Reschedule SMS thread |
| beauty | Lash fill cycle + patch test | Mary @ Bloom brow + lash | Fill-due + DM book |
| wellness | Room board + package credit | Mary package 3/10 left | Couples prep + gift credit |
| body-art | Proof pending approve | Proof status in `/my` | Consult → deposit thread |
| medspa | Consent queue clear | Intake complete badge | Procedure prep SMS |
| allied-health | Plan rebook cadence | Exercise plan link | Assessment → follow-up |
| fitness | Class waitlist promote | Pack 7/10 sessions | Waitlist → spot opened |
| pet-grooming | Biscuit + Max profiles | Two pets, two next visits | Temperament note visible |
| automotive | Bay day + ceramic package | Vehicle continuity card | Drop-off instructions |

**Guest phone (demo):** `+353871000001` — [`demo-guest-hub.seed.ts`](../../artifacts/api-server/src/services/demo-guest-hub.seed.ts) must link ≥3 shops with heterogeneous vertical artifacts.

---

## Depth waves (Era 1 engineering)

Run **in parallel** after doc lock; vertical tracks do not block each other on policy/API patterns.

| Wave | Platform spine | Vertical work |
|------|----------------|---------------|
| **D0** (weeks 1–4) | Wildcard subdomain routing; subvertical profile schema; `/my` visit shell v1 | Beauty + hair sub-segment packs |
| **D1** (weeks 5–10) | `/my/{slug}` vertical morph; guest thread API; retire `/b` redirects | Wellness + body-art relationship depth |
| **D2** (weeks 11–16) | Relationship entity + vertical memory fields | Medspa + allied health consent/intake |
| **D3** (weeks 17–22) | Pack/credit guest surfaces on `/my` | Fitness + pet + automotive |
| **D4** (weeks 23–28) | Innovation P1 cross-surface (wallet pass, compass, pipeline kanban) | All nine — founder smoke sign-off |

**Era 1 Q1 success metric unchanged:** 10 activated businesses — but activation includes **guest relationship** proof, not book-only.

---

## What “full beauty aisle” means

Beauty GTM covers **every sub-segment in §2 beauty row**, not only lash/nail/brow:

- **Included in beauty pack:** wax, facial (non-clinical), spray tan, PMU-light (with beauty consent depth), mobile operator, multi-station studio.
- **Hair colour / barber:** `hair` vertical — sold as sibling pack; shared guest vault.
- **Clinical procedures (injectables, laser):** `medspa` — higher trust; not watered into beauty.

Honest boundary: beauty does not diagnose; medspa owns clinical consent stack.

---

## Exit criteria — GTM Wave 1 complete

Founder signs when:

1. All nine demo slugs pass [`DEMO-FULL-SHOWCASE.md`](../testing/DEMO-FULL-SHOWCASE.md) + guest hub script.
2. All nine innovation **P0** rows in [`VERTICAL-INNOVATION-PROGRAM.md`](./VERTICAL-INNOVATION-PROGRAM.md) marked ✅ or 🔲 with dated owner exception.
3. Subdomain book live on staging for every showcase slug.
4. `/my` visit management live for beauty, wellness, body-art (minimum); others on token surface until D2.
5. No marketing copy references `/b`.
6. `pnpm vertical:doc-check` green.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-05 | Founder lock — nine verticals, one GTM bar; subdomain + `/my`; sub-segment onboarding; relationship contract |
