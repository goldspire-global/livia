# Wellness — master backlog (full inventory)

**Status:** canonical inventory (2026-06-03)  
**Purpose:** Every wellness north-star item — shipped, in-flight, brainstormed, and platform-adjacent — in one checklist. No chat-only scope.  
**Execution hub:** [`WELLNESS-NORTHSTAR-PROGRAM.md`](./WELLNESS-NORTHSTAR-PROGRAM.md)  
**Full closure (zero 🔲):** [`WELLNESS-FULL-COMPLETION-PROGRAM.md`](./WELLNESS-FULL-COMPLETION-PROGRAM.md)  
**Experiential policy:** `lib/policy/src/wellness-experience.ts`
**Program L0–L8:** [`WELLNESS-VERTICAL-PROGRAM.md`](./WELLNESS-VERTICAL-PROGRAM.md)  
**Research:** [`WELLNESS-VERTICAL-INSPIRATION.md`](./WELLNESS-VERTICAL-INSPIRATION.md)  
**Integrations engineering:** [`../integrations/v15-brokers.md`](../integrations/v15-brokers.md)  
**Category thesis:** operating reality layer above booking + WhatsApp + accounting — not salon ERP clone.

---

## How to read this doc

| Column | Meaning |
|--------|---------|
| **ID** | Stable backlog id (`WB-###`) for issues and exec hat work |
| **Status** | ✅ shipped · 🟡 partial · 🔲 not started · 📋 spec/catalog only |
| **Track** | A–O — see track legend below |
| **Wave** | Suggested build wave (0 = done, 1 = spine, 7 = blue ocean) |

**Done for the vertical** means Waves 0–6 shipped for Harbour demo (API + dashboard + mobile session complete + founder smoke paths 1–7). Wave 7 (vault, hotel, full broker OAuth) remains category expansion, not launch blockers.

### Track legend

| Track | Name |
|-------|------|
| **A** | Room physics |
| **B** | Gift & package economics |
| **C** | Guest E2E (`/b`, visit, wallet) |
| **D** | Staff & rota (session rail, therapist) |
| **E** | Reception / tablet / host |
| **F** | Admin, reports, charts, locale |
| **G** | Liv floor operator |
| **H** | Integration brokers & common on-site stack |
| **I** | Persona POVs (non-owner homepages) |
| **J** | Multi-site, chain, brand-wide economics |
| **K** | Trust, competitive, audit, export |
| **L** | Physical / hardware / partner |
| **M** | Platform polish (Liv copy, memory, channels) |
| **O** | Corporate / hotel / marketplace (Ring 2) |

---

## Wave 0 — Shipped (2026-06-03 session + prior R3 chunk)

| ID | Item | Status | Track | Notes |
|----|------|--------|-------|-------|
| WB-001 | Demo rooms Serenity / Stillness / Garden on `harbour-wellness-cork` | ✅ | A | Seed |
| WB-002 | Bookings enriched with `resource` on dashboard | ✅ | A | API |
| WB-003 | PATCH booking `resourceId` + capacity + turnover | ✅ | A | `RESOURCE_AT_CAPACITY` |
| WB-004 | Interactive room board on Today (drag between lanes) | ✅ | A | W4 grip-only drag |
| WB-005 | Policy `WELLNESS_ROOM_TURNOVER_MINUTES` | ✅ | A | Hub |
| WB-006 | `getPackageCreditSummary` + live evening ledger metrics | ✅ | B | Not placeholder € |
| WB-007 | Package credits grant + list on `/day-packages` | ✅ | B | “Record sale” copy |
| WB-008 | Demo package credits on Harbour | ✅ | B | Seed |
| WB-009 | `resolvePendingReasonCode` when DB `pendingReason` null | ✅ | A/G | `booking-experience-copy.ts` |
| WB-010 | `PendingWhyLine` on owner Today, room board, bookings, intake | ✅ | G | 🟡 verify every list surface |
| WB-011 | `publicLivChatCopy` — wellness vs hair suggestion chips | ✅ | M | `chat-widget.tsx` |
| WB-012 | Liv runtime wellness pack — no salon/haircut language | ✅ | G | `liv-runtime` loader |
| WB-013 | Anthropic public chat graceful 503 when key missing | ✅ | M | `chat.ts` |
| WB-014 | `/day-packages` prepaid vs itinerary copy (no engineer jargon) | ✅ | B | |
| WB-015 | Public `/b` — removed jurisdiction/market footer ribbons | ✅ | C | Web + mobile |
| WB-016 | Staff detail — searchable/filterable assigned services | ✅ | D | Scalable roster |
| WB-017 | Wellness presentation presets harbour-light, session-rail, evening-ledger | ✅ | — | W4 targets locked |
| WB-018 | `booking-guards` wellness intake on `/b` | ✅ | C | |
| WB-019 | Visit token prep lines from policy | ✅ | C | |
| WB-020 | Booksy CSV import path | ✅ | H | Settings → Integrations |
| WB-021 | Integration broker registry scaffold (Fresha, Square, GCal, Xero, QBO) | 🟡 | H | Stubs — `v15-brokers.md` |
| WB-022 | `persona-reports` catalog in policy | 📋 | F | Implement surfaces — see § Persona reports |

---

## Wave 1 — Spine completion (north star “studio day”)

| ID | Item | Status | Track | Acceptance |
|----|------|--------|-------|------------|
| WB-100 | Gift purchase on `/b` (buy for someone else) | ✅ | B/C | `POST /public/b/:slug/gift-package` + UI panel |
| WB-101 | Public wallet on W6 `/my` (balance, redeem, rebook) | ✅ | C | `packageCredits` on guest-hub `/me` |
| WB-102 | Pending reason on **all** booking lists (API + UI audit) | ✅ | G | `listBookings` + enrich batch |
| WB-103 | E2E `wellness-room-board.spec.ts` | ✅ | A | `e2e/tests/wellness-room-board.spec.ts` |
| WB-104 | Extend founder smoke: room drag + ledger + gift path | ✅ | — | [`WELLNESS-FOUNDER-SMOKE.md`](../operations/WELLNESS-FOUNDER-SMOKE.md) paths 6–7 |
| WB-105 | Root script `pnpm wellness:depth` (demo seed repair) | ✅ | — | `pnpm wellness:depth` |
| WB-106 | Liv memory panel — wellness placeholder examples | ✅ | M | `liv-memory-copy.ts` |
| WB-107 | Liv memory kinds for wellness (pressure, gender preference, allergies light) | ✅ | M | Policy + API validation |
| WB-108 | Mobile session rail **full** (not redirect-only) | 🟡 | D | My Day: complete + turnover timer (wellness) |
| WB-109 | Couples booking — two guests, one room, linked ids | 🔲 | C/E | Reception + `/b` |
| WB-110 | Premises picker `/p/{slug}` when multi-site enabled | 🔲 | C/J | Harbour + Havn |
| WB-111 | DK quiet hours + locale copy pack | 🔲 | F | `copenhagen-havn-wellness` |
| WB-112 | Calm inbox + gift/couples thread templates | 🔲 | M | Continuity wellness templates |
| WB-113 | OpenAPI/codegen if new guest wallet or gift APIs | 🟡 | C | Routes live via `apiFetch`; codegen optional |

---

## Track A — Room physics (remaining)

| ID | Item | Status | Track | Acceptance |
|----|------|--------|-------|------------|
| WB-200 | Room swimlane **week** view (Gantt: idle / turnover / conflict) | 🟡 | A/F | `weekSwimlane` in reports bundle |
| WB-201 | Turnover buffer visible on board (amber lane) | ✅ | A | Footnote + `WELLNESS_ROOM_TURNOVER_MINUTES` |
| WB-202 | Settings CRUD for `booking_resources` (rooms) | 🟡 | A | `BookingResourcesPanel` |
| WB-203 | Walk-in slot proposal respecting turnover | ✅ | A/E | `POST .../wellness/walk-in` + reception |
| WB-204 | Proactive **rerooming** after mass cancel (Liv proposes) | 🟡 | A/G | `POST .../wellness/rerooming` API |
| WB-205 | **Calendar poison alert** — therapist GCal vs room hold | 🟡 | A/H | `GET .../wellness/calendar-alerts` stub |
| WB-206 | Reception **TV mode** — next 3 arrivals full-screen | ✅ | E/L | `/wellness-tv` |

---

## Track B — Gift & package economics (remaining)

| ID | Item | Status | Track | Acceptance |
|----|------|--------|-------|------------|
| WB-300 | **Package waterfall** chart (sold → redeemed → expired → breakage) | ✅ | B/F | Reports page + evening ledger |
| WB-301 | **Liability clock** — € unearned packages trending | 🟡 | B/F | Remaining sessions on reports |
| WB-302 | **Breakage forecast** — expiring vouchers 30d → Liv task | ✅ | B/G | `breakageTasks` on reports |
| WB-303 | Groupon / aggregator redemption → ledger row | 🔲 | B/H | Code in → credit burn |
| WB-304 | Physical gift card **QR scan** at desk | 🔲 | B/E | Voucher scan |
| WB-305 | Brand-wide gift redeem at any site | 🔲 | B/J | Chain policy |
| WB-306 | Deposit **escrow view** (held / captured / refunded) | ✅ | B/F | Reports `depositEscrow` |
| WB-307 | Marketplace margin view (fee net of Treatwell etc.) | 🟡 | B/O | Treatwell-tagged count + note |

---

## Track C — Guest E2E (remaining)

| ID | Item | Status | Track | Acceptance |
|----|------|--------|-------|------------|
| WB-400 | Treatment grid 60 / 90 / couples — W5 mobile target parity | 🟡 | C | `book-mobile.target.png` |
| WB-401 | **Arrival window** SMS/WhatsApp (“Come 10m early, room Serenity”) | 🔲 | C/M | Visit + channels |
| WB-402 | **Post-session ritual** thread (hydration, retail, review) | 🔲 | C | One calm continuity |
| WB-403 | **Preference passport** (opt-in portable prefs) | 🔲 | C/K | Cross-studio consent |
| WB-404 | **Guest vault** — same person Harbour + Havn | 🔲 | C/J/K | Category-defining |
| WB-405 | Google **review nudge** after completed + positive memory | 🔲 | C/H | Not pestering all |
| WB-406 | Book-for-other checkout path end-to-end | 🔲 | C | WB-100 dependency |
| WB-407 | Guest journey **sankey** (book → intake → arrive → complete → rebook) | 🟡 | C/F | `guestJourney` counts on reports |

---

## Track D — Staff & rota (remaining)

| ID | Item | Status | Track | Acceptance |
|----|------|--------|-------|------------|
| WB-500 | Therapist mobile: swipe complete + turnover timer | ✅ | D | My Day wellness quick action |
| WB-501 | Voice note → Liv memory on customer | 🔲 | D/M | Optional v2 |
| WB-502 | **Staff day sheet** report delivered (push 06:00) | 🔲 | D/F | `staff_day_sheet` persona |
| WB-503 | **Commission / payroll** export (hours × rate → BrightPay/Gusto CSV) | ✅ | D/F/H | `wellness/commission.csv` |
| WB-504 | **Therapist preference cloud** (anonymised ops insight from memory) | ✅ | D/F | Reports `preferenceCloud` |
| WB-505 | Gender / therapist hard constraint on auto-assign | 🔲 | D/G | Never violate memory |
| WB-506 | Central **float roster** across locations | 🔲 | D/J | Multi-site |

---

## Track E — Reception / tablet / host

| ID | Item | Status | Track | Acceptance |
|----|------|--------|-------|------------|
| WB-600 | **Host tablet** check-in (landscape W4) | ✅ | E | `/wellness-reception` desk mode |
| WB-601 | **Walk-in auction** — Liv proposes next slot, one-tap | ✅ | E/G | Reception walk-in card |
| WB-602 | **Voucher scan** at desk | ✅ | E | Code lookup + burn API |
| WB-603 | **Printed run sheet** + digital same truth | ✅ | E/L | Run sheet + print |
| WB-604 | **Duty manager solver** UI (“Garden 14:00 female therapist”) | ✅ | E/G | Reception duty solver |
| WB-605 | **Reception handoffs** digest (threads waiting human) | 🔲 | E/F | `reception_handoffs` persona |
| WB-606 | Stripe **Terminal** checkout → booking completed | 🔲 | E/L/H | Pay at exit, room freed |
| WB-607 | Smart **locker / robe** assign to booking id (boutique) | 🔲 | L | Partner — defer v1 |

---

## Track F — Admin, reports, charts, locale

| ID | Item | Status | Track | Acceptance |
|----|------|--------|-------|------------|
| WB-700 | **Room heatmap** utilisation (hour × room) | ✅ | F | `/wellness-reports` API + UI |
| WB-701 | **Sales by service** (duration mix, add-on attach) | ✅ | F | Reports bundle |
| WB-702 | **Retention / rebook** 30/60/90 | ✅ | F | Reports retention card |
| WB-703 | **No-show / late** by therapist, daypart, source | 🟡 | F | `noShowLate` aggregate |
| WB-704 | **Marketing ROI** by source (IG, Treatwell, referral) | ✅ | F | `marketingBySource` |
| WB-705 | **Multi-site chain glance** (Harbour vs Havn) | ✅ | F/J | `/wellness-chain` |
| WB-706 | **Tomorrow stress score** (pending + understaffed + expiring vouchers) | ✅ | F/G | Today link + reports |
| WB-707 | **Liv intervention map** (confirmed / escalated / saved no-shows) | 🟡 | F/G | Week counts; audit depth TBD |
| WB-708 | Implement **owner_morning** digest (in-app + push) | 🟡 | F | Preview API `/wellness/digest/owner_morning` |
| WB-709 | Implement **owner_weekly** digest (email + in-app) | 🟡 | F | Preview slugs |
| WB-710 | Implement **manager_ops** digest | 🟡 | F | Preview slug |
| WB-711 | Implement **accountant_preview** + month pack export | 🟡 | F/H | Preview + copy |
| WB-712 | Reports UI route (not buried in settings) | ✅ | F | `/wellness-reports` + nav |
| WB-713 | DK market shop full locale QA | 🔲 | F | `copenhagen-havn-wellness` |

---

## Track G — Liv floor operator

| ID | Item | Status | Track | Acceptance |
|----|------|--------|-------|------------|
| WB-800 | Liv **room-aware** booking proposals | 🔲 | G | Tools use resource graph |
| WB-801 | Liv **package-aware** book (“2 of 6 left — 90 min deep tissue?”) | 🔲 | G | Reads ledger |
| WB-802 | Liv cites **policy in plain English** on tool failure | 🟡 | G | Extend beyond pending |
| WB-803 | **End-of-day close** narrative (no-shows, open packages, tomorrow gaps) | 🟡 | G | `GET .../wellness/eod-close` API |
| WB-804 | Liv explains **unconnected broker** (“deposits still manual in Square…”) | ✅ | G/H | `wellness-broker-honesty` + Liv pack |
| WB-805 | Package **burn** on confirm when credits apply | 🟡 | G/B | Public book `usePackageCredit` |
| WB-806 | Inbox staff suggestions wellness-vertical | ✅ | M | `liv-inbox-assist` |

---

## Track H — Integration brokers & common stack

**Strategy:** productise 2–3 brokers per tenant; Liv explains gaps. Do not promise 500 natives.

### Tier A — High frequency

| ID | Item | Status | Track | Acceptance |
|----|------|--------|-------|------------|
| WB-900 | **Google Calendar** two-way sync job | 🔲 | H | Conflict vs room truth |
| WB-901 | **Stripe** webhook → confirm booking + receipt | ✅ | H | `confirmBookingAfterStripePayment` |
| WB-902 | **Square** read-only appointments + webhook path | 🔲 | H | Extend stub |
| WB-903 | **Xero** settlement export (session rev vs package liability vs gift breakage) | 🔲 | H | Not live accounting |
| WB-904 | **QuickBooks** settlement CSV until OAuth | 🔲 | H | |
| WB-905 | **WhatsApp** template packs (arrival, intake, voucher balance) | ✅ | H/M | `wellness-whatsapp-templates` policy |
| WB-906 | **Mindbody** read-only import + daily diff | 🔲 | H | Parallel run |
| WB-907 | **Vagaro** import / shadow webhook | 🔲 | H | Switcher wedge |
| WB-908 | **Fresha** OAuth read-only import (implement stub) | 🔲 | H | `FRESHA_*` env |

### Tier B — Medium frequency

| ID | Item | Status | Track | Acceptance |
|----|------|--------|-------|------------|
| WB-910 | **Treatwell** / marketplace bookings as tagged source | 🔲 | H/O | Margin view |
| WB-911 | **Mailchimp / Klaviyo** events (package expiring, 90d no visit) | 🔲 | H | |
| WB-912 | **Zoom** block for remote consult on calendar | 🔲 | H | |
| WB-913 | **Instagram** DM path (channels) | 🟡 | M | Meta BSP per tenant |

### Tier C — Hardware / on-site

| ID | Item | Status | Track | Acceptance |
|----|------|--------|-------|------------|
| WB-920 | **Receipt printer** session summary + next appt QR | 🔲 | L | Partner driver |
| WB-921 | **Smart lock** check-in code (Nuki etc.) | 🔲 | L | Optional boutique |
| WB-922 | Skip spa music/lighting integrations | — | — | Too fragmented |

### Integration product patterns

| ID | Item | Status | Track | Acceptance |
|----|------|--------|-------|------------|
| WB-930 | **Parallel run mode** (Mindbody + Livia daily diff report) | 🟡 | H | `parallel-run/:external` JSON |
| WB-931 | **Import memory** — bulk old CRM notes → Liv memory | 🔲 | H/M | Migration concierge |
| WB-932 | Settings **Integrations** UX: pick brokers, show status | ✅ | H | `WellnessIntegrationsPanel` |
| WB-933 | Liv **audit diary** every automated action → owner-readable | 🔲 | K/G | EU trust |

---

## Track I — Persona POVs (homepages, not settings tabs)

| ID | POV | Item | Status | Track |
|----|-----|------|--------|-------|
| WB-1000 | Receptionist | Tablet host home: scan, walk-in, print | 🔲 | E |
| WB-1001 | Therapist | Session rail as default mobile home | 🔲 | D |
| WB-1002 | Duty manager | Solver + approvals queue | 🔲 | E/G |
| WB-1003 | Accountant | Month pack + `accountant_preview` | 🔲 | F/H |
| WB-1004 | Gift buyer | `/b` purchaser ≠ guest flow | 🔲 | C |
| WB-1005 | Corporate HR | Wellness benefit booking portal | 🔲 | O |
| WB-1006 | Hotel partner | Embedded `/b` + folio charge | 🔲 | O |
| WB-1007 | Contractor therapist | Host rent roll (spa room rent) | 🔲 | I/J | `host_rent_roll` |
| WB-1008 | Regulator / insurer | Light wellness only — no medspa chart | 📋 | Defer unless medspa pack |

---

## Track J — Multi-site & brand

| ID | Item | Status | Track | Acceptance |
|----|------|--------|-------|------------|
| WB-1100 | Harbour vs Havn **dashboard** compare | ✅ | J | Chain glance page |
| WB-1101 | Transfer guest memory cross-site with consent | 🔲 | J/K | |
| WB-1102 | Brand-wide gift + redeem anywhere | 🔲 | J/B | |
| WB-1103 | Central marketing, local WhatsApp number scenario | 🔲 | J/M | V3 scenario doc |

---

## Track K — Trust, competitive, export

| ID | Item | Status | Track | Acceptance |
|----|------|--------|-------|------------|
| WB-1200 | **Export guest list** anytime (contrast marketplace lock-in) | ✅ | K | `guest-export.csv` + Customers button |
| WB-1201 | **Audit diary** for Liv + staff actions | 🔲 | K | |
| WB-1202 | **No marketplace lock-in** positioning in onboarding copy | 🔲 | K | Policy/marketing |
| WB-1203 | Request ID on support tickets + `surfaceId` | 🟡 | K | Platform ops |

---

## Track L — Physical / partner (thin in v1)

| ID | Item | Status | Track | Notes |
|----|------|--------|-------|-------|
| WB-1300 | Stripe Terminal at desk | 🔲 | L/E | See WB-606 |
| WB-1301 | Receipt printer | 🔲 | L | See WB-920 |
| WB-1302 | Smart lock / locker | 🔲 | L | Boutique optional |
| WB-1303 | Reception TV display | ✅ | L | See WB-206 |

---

## Track M — Platform polish (wellness-tagged)

| ID | Item | Status | Track | Acceptance |
|----|------|--------|-------|------------|
| WB-1400 | Liv setup copilot wellness examples | 🔲 | M | Track I platform |
| WB-1401 | Voice UK path when `UK_VOICE_ENABLED` | 📋 | M | Twilio disclosure |
| WB-1402 | Senior-w-admin role scenarios | 🟡 | M | Platform |
| WB-1403 | Inbox morph calm copy audit | 🔲 | M | No alarm-red |
| WB-1404 | `/bookings` board removed — drag only Today | ✅ | A | Confirmed pattern |
| WB-1405 | Morph presets: harbour-light, evening-ledger, session-rail | ✅ | — | W4 |

---

## Track O — Ring 2 (corporate, hotel, marketplace)

| ID | Item | Status | Track | Acceptance |
|----|------|--------|-------|------------|
| WB-1500 | Corporate wellness portal (employer budget) | 🟡 | O | `/corporate-wellness` scaffold + policy copy |
| WB-1501 | Hotel spa folio integration | 🔲 | O | Partner API |
| WB-1502 | ClassPass-adjacent session packs | 🔲 | O/B | Inspiration doc |
| WB-1503 | HSA / insurance — defer unless medspa vertical | 📋 | O | |

---

## Persona reports — implement catalog

Policy: `lib/policy/src/persona-reports.ts`. Each row needs API workflow + UI surface + optional email/push.

| Slug | Title | Status | WB ids |
|------|-------|--------|--------|
| `owner_morning` | Morning briefing | 🟡 | WB-708 |
| `owner_weekly` | Weekly digest | 🟡 | WB-709 |
| `manager_ops` | Manager ops digest | 🟡 | WB-710 |
| `staff_day_sheet` | My day sheet | 🟡 | WB-502 |
| `reception_handoffs` | Reception handoffs | 🟡 | WB-605 |
| `host_rent_roll` | Host rent roll | 🟡 | WB-1007 |
| `accountant_preview` | Accountant preview | 🟡 | WB-711 |

---

## Reference products (patterns — do not clone ERP)

Captured in [`WELLNESS-VERTICAL-INSPIRATION.md`](./WELLNESS-VERTICAL-INSPIRATION.md): Mindbody, Fresha, Jane, Vagaro, Acuity, ClassPass-adjacent. Backlog above maps **questions** those products answer, not feature parity.

---

## Suggested build waves (execution order)

| Wave | Focus | WB range (approx) | Outcome |
|------|--------|-------------------|---------|
| **0** | Shipped spine | WB-001–022 | Room board + ledger live |
| **1** | Studio day complete | WB-100–113 | ✅ Gift, wallet, smoke, E2E, Liv memory |
| **2** | Owner perception | WB-700–712, WB-300–301 | ✅ Reports pack + package waterfall |
| **3** | Money + calendar | WB-900–905, WB-901 | 🟡 Stripe confirm ✅; GCal/Xero live sync deferred |
| **4** | Desk + Liv ops | WB-600–604, WB-800–805 | ✅ Reception + duty solver; Liv room/package tools partial |
| **5** | Switchers + comms | WB-906–911, WB-930–931 | 🟡 Broker stubs + parallel-run JSON |
| **6** | Multi-site + trust | WB-1100–1102, WB-1200–1201 | ✅ Chain glance + guest export |
| **7** | Blue ocean | WB-404–405, WB-1500–1502 | 🔲 Vault, hotel folio, full corporate — Ring 2 |

---

## EU common stack (research anchor)

| Very common | Common ≥4 staff | Common gifts | On site |
|-------------|-----------------|--------------|---------|
| WhatsApp, GCal, Stripe/terminal, Xero/CSV, Google reviews, IG bio link | Mindbody, Vagaro, Fresha (often resented) | Paper voucher + spreadsheet | Paper run sheet, reception PC, phone |

**Win order:** owned guest + room + package + WhatsApp → brokers (calendar, pay, accounting) → marketplace import for switchers.

---

## CI & verification (when closing WB ids)

- `pnpm vertical:check`
- `pnpm run typecheck`
- `pnpm codegen` after OpenAPI changes
- Founder: [`WELLNESS-FOUNDER-SMOKE.md`](../operations/WELLNESS-FOUNDER-SMOKE.md)
- Visual: [`docs/design/assets/w4-tenant/wellness/`](../design/assets/w4-tenant/wellness/)

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-03 | Initial master backlog — merges north star, inspiration, integration brainstorm, session shipped items, persona reports |
| 2026-06-03 | Wave 1–2 build: gift `/b`, guest wallet credits, reports, reception scan, Liv memory kinds, stress on Today |
| 2026-06-03 | Waves 3–6: brokers panel, settlement/commission CSV, chain/TV/corporate pages, extended reports, duty solver, mobile complete+turnover, founder smoke paths 6–7 |
