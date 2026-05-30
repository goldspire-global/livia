# R1 build status — where we are (living doc)

**Authority:** [`product/LIVIA-FINAL-BUILD-PLAN.md`](../product/LIVIA-FINAL-BUILD-PLAN.md) (master scope)  
**Tracker:** [`PLATFORM-BACKLOG.md`](./PLATFORM-BACKLOG.md) (checkboxes — sync from here)  
**Updated:** 2026-05-30

---

## How we work (founder + agent)

1. **One release program:** R1 → R2 → R3 (months). We are **inside R1**, not done.
2. **One staging stack for your E2E:** You test **once** when R1 exit criteria (§4.1 below) are green on staging — not after every partial merge.
3. **Each agent wave** updates the **Wave log** at the bottom (what shipped, which URLs).
4. **Surfaces are separate deploys** — merging `main` updates all connected hosts, but **each URL is a different “world”** (see map below).

---

## Hierarchy (nested plan)

```text
LIVIA FINAL BUILD PLAN (master)
├── R1 — NOW (~8–12 wks)  ← WE ARE HERE (~55% code, ~35% exit criteria)
│   ├── Track F — Marketing + gateway + internal chrome (W1, W2, W3a/b)
│   ├── Track G — Guest /b surfaces (W5) + hub shell (W6 partial → R2)
│   ├── Track D — Tenant presets (minimal R1)
│   ├── Track B — Support surfaceId (R1 shell)
│   └── Solidify 0–6 — kernel, mobile, ops (parallel)
├── R2 — post-R1 (~6 mo)
│   └── W6 guest hub complete · support depth · mobile parity push
└── R3 — v3 (~12–18 mo)
    └── Preset parade · Gate 2 field proof · headless lifecycle full
```

---

## Surface map — which URL is which world

| World | Staging URL | What it is | R1 test when |
|-------|-------------|------------|--------------|
| **W1 Marketing** | [staging.livia-hq.com](https://staging.livia-hq.com/) | Prospects, waitlist, pricing story | E2 (M1+M2) done |
| **W2 Gateway** | [app.staging…/sign-in](https://app.staging.livia-hq.com/sign-in) | Owner sign-in (email/password) | Anytime |
| **W2 Demo** | [app.staging…/demo](https://app.staging.livia-hq.com/demo) | Vertical launcher + wedge | E1 done |
| **W2 Wedge** | `/demo/wedge/:vertical` | G1-A interstitial per vertical | E1 done |
| **W4 Tenant** | `/dashboard`, `/inbox`, `/bookings`, … | Owner/staff app (after sign-in) | E4 + UAT |
| **W5 Guest book** | `/b/{slug}` | Public booking (no login) | E4 |
| **W5 Guest visit** | `/b/{slug}/visit/{token}` | Day-of token page | E6 |
| **W5 Guest proof** | `/b/{slug}/proof/{token}` | Body-art proof (reference) | E5 |
| **W6 Guest hub** | [app.staging…/my](https://app.staging.livia-hq.com/my) | Customer vault (R2 — **shell only**) | R2 |
| **W3a Exec** | ops portal (exec email handoff) | Founder cockpit | E9 |
| **W3b Support** | internal `/support/*` | Thread / board / radar | E8 |
| **Mobile** | TestFlight / EAS staging profile | Owner shop-floor | Solidify T3 |

**Why `/my` looks like “the product”:** It’s the **end-customer** screen (W6). The **owner** product is **`/sign-in` → `/dashboard`**. Marketing is a **third** site entirely.

---

## R1 exit criteria (§4.1) — honest status

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| E1 | G1-A wedge all verticals | **Done** | `/demo/wedge/:vertical` + policy |
| E2 | M1-R2 + M2-A marketing on staging | **In progress** | M1-R2 story home wired wave 7 |
| E3 | `wedge-demo-stories.ts` + `guest-surfaces.ts` | **Done** | policy |
| E4 | All 9 `/b/{demoSlug}` E2E | **Not verified** | need `pnpm test:e2e:verticals` green |
| E5 | Body-art proof guest page | **Done** | `/b/.../proof/:token` |
| E6 | Visit token pages | **Partial** | route exists; 9-vertical smoke TBD |
| E7 | Platform Default polish + preset picker | **Partial** | D2 + picker staging; UAT open |
| E8 | I4 Thread 3-column shell | **Partial** | queue + nav stubs |
| E9 | I2 Ship Lane + Hats | **Partial** | Ship Lane yes; Hats metrics thin |
| E10 | Phone E.164 normalize | **Done** | customers + guest hub |
| E11 | Signup → seed → `/b` headless | **Partial** | script exists; full path TBD |
| E12 | `presentation_preset_id` D2 | **Done** | migration 028 + API |
| E13 | Continuity templates all verticals | **Done** | policy test |
| E14 | typecheck clean | **Done** | CI |

**R1 exit:** **~6/14 done · ~5/14 partial · ~3/14 open** → **not ready for full founder E2E yet**.

---

## Track progress (R1 only)

### Track F — Surfaces

| ID | Item | Status |
|----|------|--------|
| F0 | PNG catalog + dev galleries | Done |
| F1 | M0 aurora shell + EUR copy | Partial |
| F2 | **M1 home + M2 pricing** | **In progress** | M1-R2 live wave 7 |
| F3 | G1-A wedge + launcher | Done |
| F4 | M3 how-it-works + M5 vertical links | Partial |
| F5 | Ship Lane + sign-in gateway | Done |
| F6 | I4 support thread + board/radar stubs | Partial |
| F7 | M6–M12 utility pages | Open |
| F8 | E2E marketing→demo→tenant | Open |

### Track G — Guest

| ID | Item | Status |
|----|------|--------|
| G0 | guest-surfaces policy | Done |
| G1 | proof page + API | Done |
| G2 | medspa/waitlist/pet polish | Open |
| G3 | continuity + E2E | Partial |
| G4 | phone normalize | Done |
| G5 | public book mobile pass | Open |
| G6 | guest hub `/my` | **Shell (R2)** |

### Track D — Presets (R1 minimal)

| Item | Status |
|------|--------|
| D2 migration + API | Done |
| D5 public `/b` skin | Partial |
| D-R1 platform default polish | Open |

---

## Wave log (what each merge shipped)

| Wave | Date | Focus | Staging URLs affected |
|------|------|-------|---------------------|
| 7 | 2026-05-30 | M1-R2 story home wired + BUILD-PLAN-WIRE doc | [staging.livia-hq.com](https://staging.livia-hq.com/) |
| 2 | 2026-05-30 | Guest proof `/b/.../proof/:token` | public `/b/*` |
| 3 | 2026-05-30 | D2 presets, Ship Lane, M3 how-it-works, headless script | app settings, internal ops, marketing `/how-it-works` |
| 4 | 2026-05-30 | Guest hub DB + `/my` shell, book opt-in | app `/my`, `/b/*` checkbox |
| 5 | 2026-05-30 | `/my` redirect fix, gateway sign-in (no Google) | app `/my`, `/sign-in` |
| 6 | 2026-05-30 | Staging relaxations (OTP bypass), prod API fix | app `/my`, api surface-config |

**Next waves (agent queue — R1 closeout):**

1. **F2** — M1 story-scroll home + M2 pricing on [staging.livia-hq.com](https://staging.livia-hq.com/)
2. **E4** — run + fix `pnpm test:e2e:verticals` on staging
3. **G5** — public book mobile visual pass
4. **F8** — headless marketing→demo→tenant script
5. **E7/E8/E9** — UAT polish (tenant default, support thread, hats)
6. **Backlog sync** — mark done items in PLATFORM-BACKLOG.md
7. **Founder E2E** — you test full matrix once row “R1 exit” hits 14/14

---

## Your single E2E checklist (when R1 exit = ready)

Use staging only:

1. [staging.livia-hq.com](https://staging.livia-hq.com/) — home, pricing, waitlist, how-it-works  
2. [app.staging…/demo](https://app.staging.livia-hq.com/demo) — wedge each vertical  
3. [app.staging…/sign-in](https://app.staging.livia-hq.com/sign-in) — owner login → dashboard  
4. `/b/{slug}` — book + visit token + proof (body-art)  
5. [app.staging…/my](https://app.staging.livia-hq.com/my) — guest hub (phone `12345`, OTP `000000`)  
6. Mobile staging build — Today, inbox, book  
7. Ops — exec cockpit Ship Lane (internal)

---

## Agent rule

**Do not ask founder to spot-check partial surfaces.** Finish R1 exit table → update this doc → then ping for one E2E pass.
