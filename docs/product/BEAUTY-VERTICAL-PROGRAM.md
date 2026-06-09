# Beauty vertical — platform program (V2)

**Status:** active completion track (2026-06-01)  
**Registry:** `VERTICAL_COVERAGE_REGISTRY` V2 · **heartland** tier  
**Canonical demo:** `bloom-beauty-dublin` · owner `owner-bloom@demo.livia-hq.com` (legacy `owner-bloom@livia.io`) · default preset **`beauty-noir-dusk`** (P0 dark mock — not flat black; atmospheric charcoal per target)  
**Reads with:** [`vertical-playbooks/beauty.md`](./vertical-playbooks/beauty.md) · [`EXPERIENCE-ARCHITECTURE.md`](../design/EXPERIENCE-ARCHITECTURE.md) · [`assets/w4-tenant/beauty/README.md`](../design/assets/w4-tenant/beauty/README.md)  
**Excellence spec (L9–L15, research + P0–P3 roadmap):** [`vertical-excellence/beauty.md`](./vertical-excellence/beauty.md)  
**Inspiration:** [`BEAUTY-VERTICAL-INSPIRATION.md`](./BEAUTY-VERTICAL-INSPIRATION.md) · **Innovation program:** [`BEAUTY-INNOVATION-PROGRAM.md`](./BEAUTY-INNOVATION-PROGRAM.md) · **Smoke:** [`BEAUTY-FOUNDER-SMOKE.md`](../operations/BEAUTY-FOUNDER-SMOKE.md)  
**Doc propagation:** [`DOC-PROPAGATION-CASCADE.md`](../engineering/DOC-PROPAGATION-CASCADE.md) — `pnpm vertical:doc-check` must pass when this file or beauty spokes change.

---

## P0 — menu / treatments discoverability (2026-06-03)

**Shipped (wellness-parity pass):** Treatments in sidebar nav · empty studio on create (menu act stays open) · quick-add templates on `/services` · `beauty-inbox-nav` announcement · beauty booking/pending copy · [`BEAUTY-VERTICAL-INSPIRATION.md`](./BEAUTY-VERTICAL-INSPIRATION.md) · [`BEAUTY-FOUNDER-SMOKE.md`](../operations/BEAUTY-FOUNDER-SMOKE.md).

**Shipped (wow / layout morph — 2026-06-03):** Four native presets map to distinct owner **Today** shells (`split-inbox` · `atrium` · `menu-card` · `cockpit`) via `BeautyMorphTodayHome` — switch preset in Settings → Guest look and reload `/dashboard` to see layout change, not palette only. Policy: `BEAUTY_MORPH_BY_CSS` in `presentation-surface.ts`.

**Shipped (P1 — 2026-06-07):** per-service `requiresPatchTest` on services + API gate · fill-cycle radar + owner SMS nudge + cron sweep · client beauty profile tab · `/studio-setup` hub · `/b` guest-context (phone → patch test + fill hints) · beauty aftercare SMS workflow · **platform-wide opt-in starter pack** on create (`starterPack` — beauty: 7 treatments + mini store; same pattern for all 9 verticals — [`VERTICAL-STARTER-PACK.md`](../engineering/VERTICAL-STARTER-PACK.md)).

**Still open (P2):** manager Bloom UAT sign-off · screen-card PNG capture queue · northstar pixel tighten post Bucket C.

---

## L0 — What Livia means for beauty (category)

Beauty on Livia is a **people-business OS for the full retail aisle**, not a lash-only wedge or medspa EHR.

| Principle | Beauty expression |
|-----------|-------------------|
| **Category** | All beauty sub-segments: lash, nail, brow, wax, facial, spray tan, PMU-light, mobile, multi-service — see [`GTM-VERTICAL-DEPTH-PROGRAM.md`](./GTM-VERTICAL-DEPTH-PROGRAM.md) |
| **Liv's job** | Triage DMs, confirm bookings, reminders, rebook windows — **no** diagnosis or treatment advice |
| **Brand forward** | Client sees **Bloom**, not Livia, on `{slug}.livia-hq.com` and SMS |
| **Relationship** | Returning clients manage visits on **`/my`** — not the public book surface |
| **Not** | Clinical injectables/laser (medspa); colour-salon formulas as first-class (hair vertical) |

**One sentence:** *Livia is the calm back office + branded book link for every beauty sub-segment — inbox-first when clients message, subdomain book when they're new, `/my` when they're yours.*

**Innovation:** [`BEAUTY-INNOVATION-PROGRAM.md`](./BEAUTY-INNOVATION-PROGRAM.md) · [`VERTICAL-INNOVATION-PROGRAM.md`](./VERTICAL-INNOVATION-PROGRAM.md) § Beauty

### Wow — operator

| Moment | Why it lands |
|--------|----------------|
| **Inbox-first home** | DM → thread → book without losing lash context |
| **Four studio skins** | Noir / soft / editorial / premium — real preset morph on web |
| **Patch-test discipline** | Guard on `/b` — policy without paper clipboard |
| **Settings → live `/b` iframe** | What you pick is what guests see |

### Wow — guest (P7)

| Moment | Why it lands |
|--------|----------------|
| **Link-in-bio quality** | Matches 2026 beauty app expectations: fast book, secure pay, reminders |
| **Patch-test question** | Serious studio signal — trust |
| **Visit token** | Tomorrow’s appointment — branded, calm |
| **No account wall** | Book as guest — continuity via SMS |

*Research note:* 2026 beauty clients expect mobile self-serve, deposits, personalized reminders, and real-time availability — Livia delivers via `/b` + continuity, not a bolt-on widget.

**Index:** [`VERTICAL-PROGRAMS-INDEX.md`](./VERTICAL-PROGRAMS-INDEX.md)

---

## L1 — Platform capability (vertical pack)

Policy hub: `lib/policy` · API: `tenant-experience`, guards, vocabulary · Surfaces: thin renderers.

| Layer | Artifact | Beauty status |
|-------|----------|-----------------|
| Enum + defaults | `verticals.ts`, `vertical-onboarding.ts` | ✅ |
| Vocabulary | `vocabulary.ts` — client, therapist, station, studio | ✅ |
| Booking guards | `booking-guards.ts` — `patch_test` select on `/b` + internal book | ✅ |
| Guest surfaces | `guest-surfaces.ts` — storefront + visit | ✅ |
| Continuity SMS | `continuity-templates.ts` (inherits hair-shaped confirm/remind) | ✅ |
| Liv mandate | `liv-mandate.ts` R2 / trust 45 | ✅ |
| Wedge story | `wedge-demo-stories.ts` — inbox → book → SMS → today | ✅ |
| Wedge gate | `wedge-gate.ts` — beauty in G1 set with hair | ✅ |
| Coverage registry | `vertical-coverage.ts` V2 heartland | ✅ |
| Playbook L2+L3 | [`vertical-playbooks/beauty.md`](./vertical-playbooks/beauty.md) | ✅ |
| Public flow doc | [`public-flows/beauty-booking-flow.md`](./public-flows/beauty-booking-flow.md) | ✅ |

**Gaps (L1):**

- [x] Service-level `requiresPatchTest` + category default (Lashes/Brows/Colour)
- [x] Fill-cycle rebook SMS (`beauty-fill-cycle-rebook`) + beauty continuity copy

---

## L2 — Presentation + brand (Track D)

Four native presets + Platform Default (signup lock). Policy: `presentation-presets.ts`.

| Preset id | `cssPreset` | Default? | W4 targets | W5 `/b` target |
|-----------|-------------|----------|------------|----------------|
| `beauty-noir-dusk` | `noir-dusk` | ✅ | owner solo, settings | `book-mobile.target.png` |
| `beauty-soft-studio` | `soft-studio` | | owner + manager, settings | ✅ |
| `beauty-editorial` | `editorial` | | owner (menu-card home), manager, inbox, settings | ✅ |
| `beauty-premium-dark` | `premium-dark` | | owner (glow-card home), manager cockpit, inbox, settings | ✅ |

| Item | Status |
|------|--------|
| `data-presentation` CSS (web) | ✅ `index.css` + `styles/beauty-presentation.css` (noir-dusk atmospheric shell) |
| Single shop skin (W4 + `/b`, no split) | ✅ [`SKIN-BRAND-INHERITANCE-SPEC.md`](../design/SKIN-BRAND-INHERITANCE-SPEC.md) §4.4 |
| Settings picker + live `/b` iframe preview | ✅ `public-appearance-panel.tsx` |
| `/b` reads `experienceSkin.presentation` | ✅ `public.ts` + `public-booking.tsx` |
| Dashboard applies `tenant-experience.presentation` | ✅ `app-layout.tsx` |
| Demo backfill preset on branding | ✅ `demo-public-assets.ts` |
| Adaptive sign-in preview | ✅ `sign-in-appearance-hint` API + panel |
| Mobile preset morph (full) | 🟡 W4m targets locked; v1 Expo tint + layout (Today/Inbox/Bookings) for noir/editorial/premium-dark |
| Production preset flag | ⏳ founder Bucket C + `LIVIA_PRESENTATION_PRESETS` |

**Gaps (L2):**

- [ ] Tighten P0 pixel ratios after founder sign-off (`northstar-p0-registry.ts`)
- [ ] `noir-dusk` manager dashboard target (optional; owner solo is P0)
- [ ] Platform Default beauty demo card (D7.2) — only if founder wants Aurora on Bloom

---

## L3 — Persona rituals (owner / manager / staff / reception)

| Persona | Beauty “home” | Status |
|---------|---------------|--------|
| **Owner** | Ritual dashboard — briefing, contextual KPIs, inbox OR pending focus | ✅ `owner-home-ritual.tsx` + `tenant-surface-density.ts` |
| **Manager** | Approvals + floor; preset targets exist | 🟡 UAT uses Luxe (hair); use Bloom for beauty manager pass |
| **Staff** | My day / chair | ✅ shared pack; P0 mobile baseline uses Luxe slug |
| **Receptionist** | Bookings + inbox | ✅ shared |

**Gaps (L3):**

- [ ] Dedicated founder UAT row for **Bloom owner** (was missing; added in `FOUNDER-UAT-CHECKLIST.md`)
- [ ] Manager home density sign-off on `bloom-beauty-dublin` with `beauty-soft-studio` or `editorial`

---

## L4 — Surfaces (W2 → W5)

### W2 Gateway

**Flow (locked mocks):** [`DEMO-FLOW.md`](../design/assets/w2-gateway/demo/DEMO-FLOW.md) — G1 grid → G2 card-stage story → G3 role tap → W4 Bloom.

| Surface | Target (single copy) | Implementation | Stg ticket |
|---------|----------------------|----------------|------------|
| G1 `/demo` | `g1-wedge-web.target.png` | ✅ `GatewayDemoLauncherShell` — aurora, left rail, six portrait cards, Enter world | **G-DEMO-1** |
| G2 `/demo/wedge/beauty` | `g2-wedge-story.target.png` | ✅ `GatewayDemoCardStage` fused card + beats | **G-DEMO-2** |
| G3 enter (beat 4) | `g3-demo-enter.target.png` | ✅ Role grid in card; tap → Clerk (no Enter btn) | **G-DEMO-3** |
| Sign-in web | `gateway-default.target.png` | ✅ `GatewaySignInStory` + Clerk (`?beta=1` on stg) | **G-SIGN-1** |
| Sign-in mobile | `gateway-default-mobile.target.png` | ✅ `GatewaySignInStory` + Clerk Expo | **G-SIGN-2** |
| Sign-in adaptive hint | deferred | ✅ API exists | — |
| Marketing → demo | CTA `/demo/wedge/beauty` | ✅ `dashboardWedgeUrl` + `/verticals/beauty` copy | **MKT-1** |
| Mobile demo gateway | separate app route | 🟡 persona carousel, not G1/G2/G3 | **G-DEMO-M** (R1.1 optional) |

### W4 Tenant (web)

| Route / screen | Bloom in P0/P1 | Status |
|----------------|----------------|--------|
| `/dashboard` | P0 northstar | ✅ |
| `/inbox` | P0 | ✅ |
| `/settings` (appearance) | P0 | ✅ |
| `/bookings`, `/bookings/new` | P0 | ✅ |
| `/customers`, `/services`, `/staff` | Capture queue | 🟡 density done; PNG queue |
| `/toolkit` | Shared | ✅ |
| `/franchise` | Queue slug Bloom | ⚠️ only if franchise capability on — verify gate |
| `/medspa`, `/design-proofs` | N/A (wrong vertical) | — |

### W4 Mobile (operator)

| Item | Status |
|------|--------|
| Vertical shortcuts (inbox + Liv) | ✅ `VerticalHomeShortcuts.tsx` |
| Tenant vocabulary via API | ✅ |
| Presentation card + “edit on web” | ✅ |
| Preset color tint from `cssPreset` | ✅ (2026-06-01) |
| Full preset parity with web | ✅ R1 (2026-06-01 build); pixel gates post UAT |

### W5 Public `/b`

| Step | Status |
|------|--------|
| Storefront + service catalog | ✅ |
| Patch-test guard block | ✅ (vertical-level) |
| Visit token | ✅ route; capture queue uses other slugs — add Bloom visit demo |
| Pay / intake | N/A for beauty |

**Gaps (L4):**

- [ ] Screen-card PNGs: customers, services, staff on Bloom
- [ ] `w5.public.visit.mobile` baseline with `bloom-beauty-dublin` token
- [x] Marketing `/verticals/beauty` copy audit (no hair-only patch-test bleed)

---

## L5 — Demo world + founder test

| Item | Status |
|------|--------|
| Seed shop Bloom | ✅ `demo-vertical-shops.seed.ts` — 5 services, 3 staff |
| Live day + inbox depth | ✅ showcase depth helpers |
| Demo login `owner-bloom@livia.io` | ✅ |
| `DEMO-LOGINS.md` | ✅ (luxe corrected to **hair**) |
| Founder UAT **Bloom beauty** section | ✅ checklist |
| E2E `founder-uat-p0` | ✅ medspa + luxe + **Bloom** section |
| E2E `gateway-beauty-wedge` | ✅ G1 → G2/G3 smoke (no auth) |

**Test path (founder):**

1. Demo launcher → Bloom owner **or** `owner-bloom@livia.io`
2. Confirm default skin **Noir Dusk** (or pick each preset in Settings → Appearance)
3. `/b/bloom-beauty-dublin` on phone — book lash fill, complete patch-test guard
4. Mobile app same tenant — Today + Inbox + accent matches preset

---

## L6 — CI / quality gates

| Gate | Beauty anchor | Status |
|------|---------------|--------|
| `pnpm northstar:check` | Bloom dashboard, inbox, `/b` | ✅ |
| `screen-card-p0-pixel` | Bloom routes | ✅ |
| `all-verticals-smoke` | bloom slug | ✅ |
| Policy tests | presentation + registry | ✅ |
| Axe on P0 | founder-uat | ✅ |

---

## Completion definition (“beauty done” for R1 demo)

Founder can answer **yes** to all:

1. **Meaning:** Playbook + wedge story match how a real lash/nail studio runs.
2. **Look:** Four presets visibly different on **dashboard + `/b`**; Settings preview matches live `/b`.
3. **Operate:** Owner home feels calm (no CRUD wall); inbox + pending modules appear only with signal.
4. **Book:** Guest completes `/b` flow ≤90s with patch-test gate visible.
5. **Mobile:** Operator app shows correct vocabulary, accent, and preset label; web is source of truth for full morph.
6. **Sign-off:** Bloom row in [`FOUNDER-UAT-CHECKLIST.md`](../operations/FOUNDER-UAT-CHECKLIST.md) checked.

---

## Engineering queue — beauty staging sign-off (2026-06-02)

**Goal:** Ticket off **Bucket C** on `livia-stg` for beauty wedge: marketing → demo → sign-in → Bloom W4/W5 (web + mobile operator).

### A — Repo hygiene (do first)

| ID | Task | Owner |
|----|------|-------|
| **A1** | Commit uncommitted gateway targets + `northstarRealPath` + sign-in/demo doc cards (large local diff on `main`) | Eng |
| **A2** | Remove duplicate `assets/screen-cards/w2.gateway.demo.launcher.web.png` once G1 uses `w2-gateway/demo/g1-wedge-web.target.png` only | Eng |
| **A3** | `pnpm northstar:check` + `pnpm screen-cards:status` green for gateway YAMLs | CI |

### B — Implement locked W2 mocks (web dashboard)

| ID | Task | Acceptance |
|----|------|------------|
| **G-DEMO-1** | `/demo` prospect path: G1 “Pick your world” grid (beauty unlocked; others Coming soon) OR wire `DemoWedgeGrid` as primary | Matches `g1-wedge-web.target.png` |
| **G-DEMO-2** | `/demo/wedge/:vertical`: fused **card-stage** carousel (beats 1–4) | Matches `g2-wedge-story.target.png` |
| **G-DEMO-3** | Beat 4: role grid **inside** gold card; tap role → Clerk ticket (no Enter button) | Matches `g3-demo-enter.target.png` |
| **G-SIGN-1** | `/sign-in` production: Liv colleague split + mobile stack | Matches `gateway-default*.target.png` |
| **G-SIGN-2** | `artifacts/livia-mobile` sign-in: stacked story + Clerk (parity with web mock) | `gateway-default-mobile.target.png` |

### C — Beauty tenant (already strong — verify on stg)

| ID | Task | Acceptance |
|----|------|------------|
| **B-W4** | Bloom owner UAT paths 1–8 in [`FOUNDER-UAT-CHECKLIST.md`](../operations/FOUNDER-UAT-CHECKLIST.md) | Dashboard, inbox, services, customers, bookings, settings presets, `/b`, mobile tabs |
| **B-PRESET** | All four presets: dashboard + `/b` + mobile tint | Targets under `w4-tenant/beauty/presets/*/mobile/` |
| **B-CAP** | Optional PNG capture queue: customers, services, visit on Bloom | Not blocking stg if density OK |

### D — Marketing + stg gates

| ID | Task | Acceptance |
|----|------|------------|
| **MKT-1** | `/verticals/beauty` + home CTAs → `/demo` or `/demo/wedge/beauty` | No hair-only bleed; beauty-first copy |
| **STG-1** | `node scripts/staging-readiness.mjs --strict` on deploy | Green |
| **STG-2** | `pnpm founder:uat-preflight` + manual Bloom row + gateway row | Founder signs Bucket C |

### E — Defer (not blocking beauty stg)

| Item | Notes |
|------|--------|
| G1 mobile full-bleed | `g1-wedge-mobile.target.png` locked; implement R1.1 |
| Mobile `/demo` G2/G3 parity | Operator app uses sign-in + tabs; demo gateway is showcase only |
| Adaptive sign-in crossfade | `preview-beauty-soft-studio.target.png` deferred |
| Service-level patch-test flag | L1 optional |
| E2E pixel diff for G2/G3 | Add after UI lands |

### F — Founder UAT path (single script)

1. Marketing home → **Beauty** → demo  
2. **G1** pick Lash & Brow / beauty → **G2** four beats → **G3** tap Owner  
3. Bloom dashboard (Noir Dusk) → settings presets → `/b` book with patch-test  
4. Mobile Bloom: Today / Inbox / accent  
5. `/sign-in?beta=1` (staging real Clerk) — Liv story + auth  
6. Sign **Bucket C** when 1–5 feel finished  

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-01 | Initial hierarchical program; Bloom UAT path; gap queue |
| 2026-06-01 | Full beauty build: 4 presets W4/W5, settings swatches, mobile owner + `/b` |
| 2026-06-02 | W2 gateway targets locked (G1–G3 + sign-in); staging sign-off queue § Engineering |
| 2026-06-02 | G1–G3 + sign-in shipped; Bloom founder UAT E2E; customers ambient panel; MKT wedge deep-link |
| 2026-06-03 | P0 menu/nav + onboarding + announcement (wellness-parity pass) |
| 2026-06-03 | R3 Today layout morphs (four beauty presets — wellness wow parity) |
| 2026-06-03 | Excellence spec + gap audit documented |
