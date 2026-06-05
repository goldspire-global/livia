# Wellness vertical — inspiration and product research

**Status:** living doc (2026-06-03)  
**Program:** [`WELLNESS-VERTICAL-PROGRAM.md`](./WELLNESS-VERTICAL-PROGRAM.md)  
**Full build inventory:** [`WELLNESS-MASTER-BACKLOG.md`](./WELLNESS-MASTER-BACKLOG.md) (`WB-###` — every wow, integration, report, POV)  
**Execution:** [`WELLNESS-NORTHSTAR-PROGRAM.md`](./WELLNESS-NORTHSTAR-PROGRAM.md)  
**Announcement hub:** [`VERTICAL-ANNOUNCEMENT.md`](../engineering/VERTICAL-ANNOUNCEMENT.md)

This is the captured research and “exceptional bar” — competitor patterns and wow mapping. **Implementation checklist** lives in the master backlog, not here alone.

---

## 1. Category reality (not beauty, not clinical)

Massage, holistic, and day-spa studios optimize for:

| Operator pain | Guest pain |
|---------------|------------|
| **Room turnover** and double-book risk | Picking **duration** (60 / 90 / couples) without confusion |
| **Therapist preference** and gender requests | Light **health intake** without medical fear |
| **Voucher / package liability** | Gift purchase and “for someone else” |
| Calm **SMS** continuity, not alarm inbox | **Visit prep** (parking, hydration, arrival) |
| Multi-site (Harbour + Havn) | Trusting **their studio brand**, not a generic app |

Livia must never feel like a hair salon with teal paint or a medspa consent wall.

---

## 2. Reference products (patterns to borrow, not clone)

| Product | Steal the pattern | Livia mapping |
|---------|-------------------|---------------|
| **Mindbody / Booker** | Room/resource calendar, staff preference, packages | `room-board-schedule` → R1.1; `booking-guards`; `/day-packages` |
| **Fresha (spa)** | Calm mobile book, treatment grid, deposit | `/b` presets · `harbour-light` W5 targets |
| **Jane App (wellness)** | Health notes, practitioner choice | `booking-guards` wellness intake |
| **Vagaro (spa)** | Gift cards, series packages | R2 `gift-public-book`, `voucher-ledger-today` |
| **Acuity** | Simple confirm + reminder thread | `continuity` wellness template · visit token |
| **ClassPass-adjacent** | Session packs | R2 `membership-minutes` |

We do **not** rebuild their full ERP — we keep the **hotel principle**: same Livia kernel, wellness keys.

---

## 3. Operator “wow” backlog → announcement capabilities

**Canonical checklist:** [`WELLNESS-MASTER-BACKLOG.md`](./WELLNESS-MASTER-BACKLOG.md) (`WB-###`). Summary:

| Wow moment | Maturity | Policy / surface |
|------------|----------|------------------|
| Rooms-first Today (swimlanes) | **R3 live** | WB-001–005 · drag assign |
| Voucher sold vs redeemed | **R3 live** | WB-006–008 · evening ledger |
| Reports (heatmap, waterfall, stress score) | 🔲 | WB-700–707 · Track F |
| Gift on `/b` + wallet | 🔲 | WB-100–101 · Track B/C |
| Reception host + scan | 🔲 | WB-600–602 · Track E |
| Calm inbox + gift/couples thread | R1 / 🔲 | WB-112 · continuity |
| DK quiet hours + locale | 🔲 | WB-111 · Havn market |

---

## 4. Guest “wow” backlog

| Moment | Target |
|--------|--------|
| Treatment grid (60 / 90 / couples) | `w5` `book-mobile` harbour-light |
| Intake in book flow, not diagnosis | `booking-guards` on `/b` |
| Confirm copy: session + studio name | `publicAwaitingContinuityHoldLines` |
| Visit prep page | `/b/{slug}/visit/:token` |
| Premises picker multi-site | `/p/{slug}` when enabled |

---

## 5. Presentation inspo (layout ≠ colour)

Locked in [`docs/design/assets/w4-tenant/wellness/README.md`](../design/assets/w4-tenant/wellness/README.md):

| Preset | POV |
|--------|-----|
| **harbour-light** | Atrium — room swimlanes, split inbox |
| **session-rail** | Therapist day — dominant timeline |
| **evening-ledger** | Retreat owner — ledger table + voucher row |
| **platform-default** | Sign-up Constellation |

Obsolete names (`spa-calm`, `zen-light`, `retreat-dark`) are **deprecated** — do not use for new work.

---

## 6. Changelog

| Date | Change |
|------|--------|
| 2026-06-03 | Initial inspiration doc; maps to `vertical-announcement` capabilities |
