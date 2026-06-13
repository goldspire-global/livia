# Demo experience program — design partners

**Status:** living (2026-06-10)  
**Authority:** [`demo-gateway.md`](../demo-gateway.md) · [`demo-script.md`](../demo-script.md) · policy hub `lib/policy/src/demo-experience-program.ts`  
**Audience:** Design partners and potential business owners — not investor portfolio tours or full vertical QA.

---

## Principle

> **Showcase = one story per session. Lab = everything else.**

A design partner should land in **their Tuesday morning**: one owner, one business, Liv briefing, one alert, one sacred metric — not a 22-tenant switcher.

| Layer | What | Where |
|-------|------|--------|
| **Showcase** | 4 partner tracks | `/demo` → “Pick your Tuesday morning” |
| **Industry** | Wedge G2 beats | `/demo/wedge/{vertical}` |
| **Lab** | All tenants + roles | `/demo` → Advanced |

---

## Four partner tracks (G1 primary)

Defined in policy (`DEMO_PARTNER_TRACKS`) and rendered on `/demo` after demo world is provisioned.

| Track | Org shape | Tenant | Login | Guest path |
|-------|-----------|--------|-------|------------|
| **Run my shop** | Solo | `stoneybatter-cuts` | `solo@demo.livia-hq.com` | `/b/stoneybatter-cuts` |
| **Run my studio** | Studio | `dublin-barber-collective` | `studio-barber@demo.livia-hq.com` | `/b/dublin-barber-collective` |
| **Run my chain** | Chain (3 sites) | `aurora-studio` (+ mews, galway) | `chain@demo.livia-hq.com` | `/b/aurora-studio` |
| **Quote-first business** | Consult-first solo | `atelier-decor-dublin` | `owner-atelier@demo.livia-hq.com` | `/e/atelier-decor-dublin/enquire` |

Password: `LIVIA_DEMO_PASSWORD` (default `LiviaDemo2026!`).

---

## 10-minute walkthrough (any track)

1. **Minute 0–2** — Today + Liv briefing (“this is your morning”).
2. **Minute 2–5** — Inbox: one thread, Liv draft, human takeover optional.
3. **Minute 5–8** — Sacred metric:
   - Appointment tracks → confirm booking or send reminder.
   - Quote-first → generate quote from enquiry, send link.
4. **Minute 8–10** — Guest on phone (`/b/...` or `/e/.../enquire`) — no sign-in.

Expand **10-min walkthrough** on each `/demo` card for track-specific bullets.

---

## When to use what

| They say… | Open |
|-----------|------|
| “I’m on my own” | Run my shop |
| “I have a team” | Run my studio → optional manager@ |
| “We have a few locations” | Run my chain — **not** org-admin portfolio |
| “I quote jobs / weddings / events” | Quote-first business |
| “What about medspa / tattoo?” | Wedge grid → industry story |
| “I need to test everything” | Advanced → all tenants (internal QA) |

**Hide by default:** `org-admin@` multi-vertical portfolio, 22-row tenant grid, staff persona grid — unless they ask.

---

## Five-frame ritual (every track)

Within 30 seconds of “Enter as owner”:

1. **Welcome line** — persona + business name on Today.
2. **Ritual surface** — Today (owner), `/chain` (chain), consult-first KPIs (Atelier).
3. **One incoming alert** — inbox thread, pending booking, or new enquiry (seeded).
4. **One wow moment** — track `wowMoment` in policy.
5. **Escape hatch** — guest link on same card; wedge story for industry depth.

---

## Setup (founder / you)

```bash
pnpm dev:api
pnpm dev:dashboard
pnpm demo:provision   # or pnpm demo:repair
```

Open **http://localhost:5173/demo** → **Set up demo world** → pick a track → **Enter as owner**.

(Production `app.* /demo` redirects to marketing; local dev stays on :5173.)

---

## Cascade checklist

- [x] Policy — `demo-experience-program.ts`
- [x] API — `getDemoCatalog().partnerTracks`
- [x] Dashboard — `DemoPartnerTracks` on `/demo`
- [ ] Mobile — link to web `/demo` (existing pattern)
- [x] Docs — this file + `DEMO-LOGINS.md` scenario table

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-10 | Initial program — 4 design-partner tracks, showcase vs lab split, `/demo` UI |
