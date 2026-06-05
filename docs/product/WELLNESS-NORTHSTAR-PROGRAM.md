# Wellness vertical — north star program (V4 execution)

**Status:** active execution (2026-06-03)  
**Full inventory:** [`WELLNESS-MASTER-BACKLOG.md`](./WELLNESS-MASTER-BACKLOG.md) — **every** shipped, planned, and brainstorm item (`WB-###`)  
**Authority:** Supplements [`WELLNESS-VERTICAL-PROGRAM.md`](./WELLNESS-VERTICAL-PROGRAM.md) L0–L8 with execution tracks.  
**Reference cascade:** [`VERTICAL-COMES-TOGETHER.md`](../engineering/VERTICAL-COMES-TOGETHER.md)  
**Inspiration:** [`WELLNESS-VERTICAL-INSPIRATION.md`](./WELLNESS-VERTICAL-INSPIRATION.md)

---

## Thesis

Livia wellness is the **operating layer for rooms + therapists + gift economics** — not salon software with teal paint. Every surface (owner Today, therapist rail, guest `/b`, reception tablet) reads one policy hub and one schedule truth.

**Category bet:** **operating reality layer** above Mindbody/Fresha + WhatsApp + Xero — one graph for room + guest + package + conversation.

**Done means:** a founder can run the [`WELLNESS-FOUNDER-SMOKE.md`](../operations/WELLNESS-FOUNDER-SMOKE.md) “studio day” script and hit **live room physics**, **package ledger**, and **guest wallet** — then Waves 2–4 from the master backlog (reports, brokers, desk, Liv operator).

---

## Execution tracks (all items in master backlog)

| Track | Spine | Maturity |
|-------|--------|----------|
| **A** — Room physics | `booking_resources` → board → assign → turnover | R3 live → week swimlane, walk-in, rerooming |
| **B** — Gift & package economics | ledger, day packages, liability charts | R3 live → gift `/b`, waterfall, breakage |
| **C** — Guest E2E | `/b`, intake, visit, wallet, couples | R1.1 → R3 |
| **D** — Staff & rota | Session rail, payroll export, preference cloud | R1 → R3 |
| **E** — Reception / tablet | Host check-in, walk-in solver, voucher scan, print | R∞ |
| **F** — Admin & reports | Heatmaps, digests, chain glance, DK locale | R∞ |
| **G** — Liv floor operator | Room/package aware, policy cite, EOD close | R2 → R3 |
| **H** — Integration brokers | GCal, Stripe, Xero, Fresha, parallel run | Stubs → live |
| **I** — Persona POVs | Reception, therapist, accountant, gift buyer homes | R∞ |
| **J** — Multi-site / brand | Havn + Harbour, brand gift, float roster | R2 |
| **K** — Trust / export | Audit diary, guest export, anti lock-in copy | R2 |
| **L** — Physical / partner | Terminal, printer, TV mode, lock (optional) | Partner |
| **M** — Platform polish | Liv memory, channels, inbox calm | Ongoing |
| **O** — Ring 2 | Corporate HR, hotel folio, marketplace margin | Deferred |

**Build waves:** see master backlog § Suggested build waves (0–7).

---

### Track A — Room physics (shipped chunk 2026-06-03)

| Item | Status | WB |
|------|--------|-----|
| Demo rooms Serenity / Stillness / Garden | ✅ | WB-001 |
| Bookings enriched with `resource` | ✅ | WB-002 |
| PATCH `resourceId` + turnover | ✅ | WB-003 |
| Interactive room board (drag lanes) | ✅ | WB-004 |
| Policy turnover minutes | ✅ | WB-005 |
| Week swimlane, walk-in, rerooming, GCal poison, TV mode | 🔲 | WB-200–206 |

### Track B — Package economics (shipped chunk 2026-06-03)

| Item | Status | WB |
|------|--------|-----|
| Package credit summary API + evening ledger | ✅ | WB-006–008 |
| Gift on `/b`, wallet, waterfall, scan, brand gift | 🔲 | WB-100–101, WB-300–305 |

### Tracks C–G — Open (summary)

See [`WELLNESS-MASTER-BACKLOG.md`](./WELLNESS-MASTER-BACKLOG.md) for full `WB-###` list: guest wallet, host tablet, six killer reports, Liv room/package tools, persona digests.

### Tracks H–O — Open (summary)

Common EU stack brokers, marketplace source, corporate/hotel Ring 2, hardware partners — all inventoried in master backlog; **do not** hand-wave in chat only.

---

## Surface matrix

| Surface | Web | Tablet | Mobile | Signature interaction |
|---------|-----|--------|--------|------------------------|
| Today atrium | ✅ | ✅ landscape | preview | Drag session between room lanes |
| Evening ledger | ✅ | ✅ | — | Live voucher/session credits |
| Session rail | ✅ | ✅ portrait | 🔲 full | Swipe complete + turnover |
| `/day-packages` | ✅ | — | hook | Multi-step journey + credits |
| `/b` | ✅ | ✅ | ✅ | Session grid + intake + gift |
| Reports | 🔲 | — | — | Room heatmap, package waterfall |
| Host / reception | 🔲 | 🔲 | — | Check-in, scan, walk-in |
| Settings rooms | ✅ | — | — | CRUD resources |

---

## E2E studio day (acceptance — extend as waves land)

1. Owner opens Harbour Light Today → **three real rooms** with today’s sessions.
2. Drags Serenity → Garden → persists; conflict if turnover blocks.
3. Evening Ledger morph → **live** package credit counts.
4. Grants 6-session pack on `/day-packages` → credits remaining visible.
5. Guest books on `/b/harbour-wellness-cork` → wellness intake + confirm copy.
6. Visit token shows prep lines.
7. *(Wave 1)* Gift buy + `/my` wallet redeem.
8. *(Wave 2)* Reports: utilisation heatmap + package waterfall.
9. *(Wave 4)* Reception check-in + voucher scan.

---

## Policy hub touchpoints

| Module | Role |
|--------|------|
| `wellness-operator-shell.ts` | Nav, operator preset, turnover |
| `vertical-announcement.ts` | R1/R1.1/R2/R3 capabilities |
| `booking-experience-copy.ts` | Session detail, pending, hold |
| `guest-public-experience.ts` | W5 hero, grid, visit prep |
| `booking-guards.ts` | Intake on `/b` |
| `persona-reports.ts` | Digest catalog — **implement** |
| `public-liv-chat-copy.ts` | Vertical Liv chips |

---

## CI & smoke

- `pnpm vertical:check`
- `pnpm run typecheck`
- Founder: [`WELLNESS-FOUNDER-SMOKE.md`](../operations/WELLNESS-FOUNDER-SMOKE.md)
- E2E: `wellness-room-board.spec.ts` (WB-103)

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-03 | V4 kickoff — Track A+B live room board + package ledger |
| 2026-06-03 | Master backlog doc; tracks H–O; waves 0–7; link all brainstorm scope |
