# Wellness founder smoke — 5-path walkthrough

**Demo:** `harbour-wellness-cork` (IE) · `copenhagen-havn-wellness` (DK)  
**Preset:** `wellness-harbour-light` (harbour-light)  
**Program:** [`WELLNESS-VERTICAL-PROGRAM.md`](../product/WELLNESS-VERTICAL-PROGRAM.md)

Sign-off closes L8 in the wellness program. Run on **local** stack (API `:3000`, dashboard `:5173`) or **staging**.

---

## Preflight

```bash
pnpm demo:provision   # if demo stale
pnpm wellness:depth   # rooms + package credits on Harbour/Havn
# API + dashboard running — **restart API** after pulling wellness routes (stale :3000 returns 404 on /wellness/*)
```

Log in as Harbour Wellness owner. Confirm `presentationPreset` = harbour-light in Settings → Guest look.

---

## Path 1 — Today (owner)

| Step | Expect |
|------|--------|
| Open `/dashboard` | Full **Today** morph (not generic briefing + KPI only) |
| Room board | **Serenity / Stillness / Garden** from Settings resources — today’s sessions in lanes |
| Drag | Move a session to another room — persists; conflict toast if turnover blocks |
| Footnote | Turnover buffer copy from `tenant-experience.announcement.roomBoard` |
| Liv strip | Calm line; link to pending sessions if any |

---

## Path 2 — Inbox → session

| Step | Expect |
|------|--------|
| `/inbox` | Taller thread; wellness chrome; Ask Liv collapsed |
| Open thread | Gift/couples/intake tone — not colour consult |
| Jump to session | From continuity or Rooms row |

---

## Path 3 — Rooms (bookings)

| Step | Expect |
|------|--------|
| Nav **Rooms** | White card list shell (matches Inbox/Guests) |
| Pending row | Wellness pending label (no “photos or confirmation”) |
| Open session | **Session detail** · Guest & session · Guest messages panel |
| Confirm / reschedule | Wellness action labels |

---

## Path 4 — Studio ops

| Step | Expect |
|------|--------|
| `/customers` | Guests list chrome |
| `/staff` | Practitioners · invite roles from policy |
| `/services` | Sessions catalog |
| `/day-packages` | Route allowed for wellness · **grant session credits** panel |
| Settings → Studio | Rooms/resources visible (`bookingResources`) |
| Switch preset → **Evening Ledger** on `/dashboard` | Live package credit counts (sold / redeemed / remaining) |

---

## Path 5 — Guest `/b`

| Step | Expect |
|------|--------|
| `/b/harbour-wellness-cork` | Wellness hero; Sessions grid |
| Book flow | Intake guards (health, preference, couples/gift) |
| Confirm pending | Session hold copy — not salon |
| Visit token | Prep copy on visit page (harbour-light target) |

---

## Path 6 — Gift, wallet, reports

| Step | Expect |
|------|--------|
| `/b/harbour-wellness-cork` → gift panel | Buy package for someone else; redemption code returned |
| Guest `/my` (signed in) | `packageCredits` on guest hub when demo credits exist |
| `/wellness-reports` | Stress score, waterfall, heatmap, retention, guest journey |
| `/wellness-chain` | Harbour vs Havn glance (if org-linked demo) |
| Today stress link | Tomorrow stress score from reports bundle |

---

## Path 7 — Reception desk

| Step | Expect |
|------|--------|
| `/wellness-reception` | Voucher lookup + burn; walk-in slot proposal; run sheet print |
| Duty solver | Room + hour → free therapist names |
| `/wellness-tv` | Next arrivals full-screen |
| Settings → Studio | Wellness integrations panel (brokers + settlement CSV) |
| `/customers` → Export guests | CSV download (wellness only) |

---

## Path 8 — E0–E7 carry-on (2026-06-04)

| Step | URL | Expect |
|------|-----|--------|
| Experiential Today | `/dashboard` | Canvas atmosphere (subtle orbs); room board drag **glow** on handle; **amber turnover** gap between back-to-back sessions |
| Public confirm | `/b/harbour-wellness-cork` → book → confirm | **Success glow** pulse + calm arrival copy from policy preset |
| Reception split | `/wellness-reception` | Wide viewport: **two-column** desk (voucher/walk-in left · run sheet/duty right); tablet touch targets |
| Persona home | Sign in as **receptionist** demo | Lands on `/wellness-reception`, not `/bookings` |
| EOD ritual | `/wellness-reports` | **End-of-day close** card with today stats lines |
| Audit diary | `/wellness-audit-diary` | Merged audit + booking + Liv memory timeline |
| Guest vault | `/wellness-guest-vault` | Phone lookup; chain memory transfer buttons on Harbour/Havn |
| Corporate Ring 2 | `/corporate-wellness` (alias `/wellness-corporate`) | Employer portal + hotel folio status + ClassPass-adjacent pack copy |
| Liv tools | Inbox → Ask Liv (staff) | Wellness pack tools available: EOD close, duty solver, reroom (when prompted) |

**API sanity (auth required):** `GET /api/businesses/{id}/wellness/reports` and `POST .../wellness/duty-solver` must **not** return 404 after API restart.

---

## R2 (explicitly out of smoke — do not fail)

- Membership minutes bank
- Full DK locale pack on Havn
- Live Mindbody/Fresha OAuth sync (parallel-run JSON preview only)
- Hotel folio / HSA / smart lock

These remain Ring 2 or broker stubs — see [`WELLNESS-MASTER-BACKLOG.md`](../product/WELLNESS-MASTER-BACKLOG.md).

---

## Sign-off

Reply **Wellness L8 smoke passed** with preset + environment, or list path + screenshot gap.

Automated guard: `pnpm vertical:check` (announcement handshake).
