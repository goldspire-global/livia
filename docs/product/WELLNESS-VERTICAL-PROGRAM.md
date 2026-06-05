# Wellness vertical — platform program (V3)

**Status:** program complete · **execution:** Phase V4 (north star)  
**North star:** [`WELLNESS-NORTHSTAR-PROGRAM.md`](./WELLNESS-NORTHSTAR-PROGRAM.md)  
**Master backlog (all items):** [`WELLNESS-MASTER-BACKLOG.md`](./WELLNESS-MASTER-BACKLOG.md)  
**Registry:** V3 · **beta-full** · demo `harbour-wellness-cork` · market `copenhagen-havn-wellness`  
**Reads with:** [`vertical-playbooks/wellness.md`](./vertical-playbooks/wellness.md)

---

## L0 — What Livia means for wellness

Wellness & spa trades **speed** for **calm** — rooms, therapists, packages, gift economics.

**One sentence:** *Livia is the quiet scheduler for massage and holistic studios — rooms, vouchers, and gentle SMS, never clinical medspa fear.*

### Wow — operator

| Moment | Why |
|--------|-----|
| **Room utilisation** | See which rooms free vs double-book risk |
| **Voucher liability** | Packages sold vs redeemed (R2 depth) |
| **Multi-location glance** | Harbour + Havn pattern for DK flagship |
| **Calm inbox** | DM requests without alarm-red UI |

### Wow — guest

| Moment | Why |
|--------|-----|
| **Pick session length** | 60 vs 90 vs couples — clear grid |
| **Gift-ready confirm** | Copy suitable for “buy for someone” |
| **Visit prep** | Hydration, arrival, parking — on visit token |
| **Premises picker** | `/p/{slug}` when multi-site |

---

## L1 — Capability

| Layer | Status |
|-------|--------|
| Vocabulary guest/therapist/room | ✅ |
| Day packages route | ✅ owner |
| Guest surfaces storefront + visit | ✅ |
| premises public | ✅ when enabled |

**Gaps:** voucher ledger UI; quiet-hours locale (DK) copy pack.

---

## L2 — Presentation

Default: **`wellness-harbour-light`** (`harbour-light`). Alt: session-rail, evening-ledger. Sign-up: shared **`platform-default`** (Constellation).

| Item | Status |
|------|--------|
| Web CSS presets | ✅ `wellness-presentation.css` (harbour-light, session-rail, evening-ledger) |
| Target mocks | ✅ locked — 4 presets × core surfaces + `visit-mobile` (harbour-light) · [`VERTICAL-TARGET-MOCK-PROGRAM.md`](../design/VERTICAL-TARGET-MOCK-PROGRAM.md) |
| G2 wedge thread | ✅ `harbour-light` beats · unlocked in `MARKETING_DEMO_WEDGE_UNLOCK_ORDER` |

---

## L3 — Personas

Owner calm briefing; therapist my-day; reception books rooms not chairs.

---

## L4 — Surfaces

| Route | Notes |
|-------|-------|
| `/b/harbour-wellness-cork` | Book flow |
| `/b/.../visit/:token` | Day-of |
| `/p/...` | Multi-premises optional |
| W4 day-packages | Owner |

### W4 shell IA (harbour-light / atrium)

Policy hub: `lib/policy/src/wellness-operator-shell.ts` → `WellnessShellNav` (dashboard).

| Zone | Items | Rationale |
|------|--------|-----------|
| **Top row** | Studio name + tagline · help · notifications · account | Brand only — no route tabs here |
| **Nav strip** (below) | Today · Inbox · Rooms · Guests · Packages · Sessions · Practitioners · Rota · **Settings** | Full operator menu in one horizontal strip (rooms-first order) |
| **Inside Settings** | Studio (rooms/resources), Liv, Guest look, Channels, billing, legal, … | Deep config via `/settings` tabs — `WELLNESS_SETTINGS_STRIP_LINKS` for shortcuts optional in-page |

**Fine details:** never use medspa consent UI; couples room = service variant; cancellation window in policy footer on `/b`.

**Vocabulary (policy):** `businessVocabulary` + `verticalOperationalCopy` — Guests, Practitioners, Therapist, Rooms page title; role labels Practitioner / Studio lead (not generic “staff” in UI).

**Booking / session copy (policy):** `booking-experience-copy.ts` — pending reasons (no salon “photos” language), session detail page, guest continuity hold lines, public `/b` confirm; `booking-guards.ts` wellness intake (health notes, therapist preference, couples/gift).

**Vertical announcement (policy):** `vertical-announcement.ts` — platform default attributes + wellness extensions; exposed on `GET /me/tenant-experience` as `announcement` (capabilities R1 / R1.1 / R2). See [`VERTICAL-ANNOUNCEMENT.md`](../engineering/VERTICAL-ANNOUNCEMENT.md).

**Inspiration (research):** [`WELLNESS-VERTICAL-INSPIRATION.md`](./WELLNESS-VERTICAL-INSPIRATION.md) — competitor patterns, wow backlog mapped to capabilities.

**Founder smoke:** [`WELLNESS-FOUNDER-SMOKE.md`](../operations/WELLNESS-FOUNDER-SMOKE.md) — 5-path L8 sign-off.

**UI gaps (tracked):** gift purchase on `/b` (R2); DK quiet-hours copy pack (R2); mobile session-rail morph (R∞).

**Shipped V4 (2026-06-03):** live room board from `booking_resources`, drag assign + turnover buffer, package credit ledger on evening Today, `/day-packages` credits panel — see north star doc.

---

## L5 — Demo

| Slug | Role |
|------|------|
| `harbour-wellness-cork` | IE showcase |
| `copenhagen-havn-wellness` | DK locale, DKK, market seed |

---

## L6 — CI

`public-booking-quality` · `all-verticals-smoke`

---

## L7 — Dedicated wellness (scope)

| Bet | Scope |
|-----|--------|
| Gift voucher purchase on `/b` | R2 |
| Membership minutes bank | R2 |
| Therapist preference + gender request | R1.1 guard fields |
| Sound-bath / event series | Classes pattern borrow |

---

## L8 — Completion

5-path founder smoke: [`WELLNESS-FOUNDER-SMOKE.md`](../operations/WELLNESS-FOUNDER-SMOKE.md)  
Reusable platform process: [`VERTICAL-COMES-TOGETHER.md`](../engineering/VERTICAL-COMES-TOGETHER.md) (wellness = reference vertical)

Sign-off: harbour-light on web + mobile tab vocabulary + `/b` session grid + visit prep + announcement on tenant-experience.

---

## Market — Denmark (V-DK)

`copenhagen-havn-wellness`: locale `da-DK`, currency display, EU SMS disclosure — same pack, different market ribbon.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-03 | V4 Track A+B — live room board, package ledger, north star program |
| 2026-06-03 | W5 `guest-public-experience` · session grid `/b` · visit prep · VERTICAL-COMES-TOGETHER reference |
| 2026-06-03 | W4 shell IA in policy (`wellness-operator-shell`); Settings on utility strip; foreground nav aligned to rooms-first |
| 2026-06-03 | Locked 4 presentation presets + targets; G2 thread; CSS; marketing unlock |
| 2026-06-01 | Initial program |
