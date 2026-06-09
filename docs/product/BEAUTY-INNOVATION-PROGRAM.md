# Beauty vertical — innovation program

**Status:** living (2026-06-05)  
**Authority:** [`BEAUTY-VERTICAL-PROGRAM.md`](./BEAUTY-VERTICAL-PROGRAM.md) · [`GTM-VERTICAL-DEPTH-PROGRAM.md`](./GTM-VERTICAL-DEPTH-PROGRAM.md) · master matrix [`VERTICAL-INNOVATION-PROGRAM.md`](./VERTICAL-INNOVATION-PROGRAM.md)  
**Principle:** People-business OS for the **full beauty aisle** (lash, nail, brow, wax, facial, tan, PMU-light, mobile, multi-service) — not salon-shaped, not clinical. Cascade **policy → API → web + mobile + subdomain book + `/my`**.

---

## North star

Onboarding should feel like the studio already runs on Livia: **inbox triage, fill cycles, patch-test discipline, and link-in-bio booking** — on whatever device is in hand (owner phone, reception iPad, artist Apple Pencil, guest phone).

---

## Operator wow — by persona

### Owner / manager

| Idea | Real problem | Cross-surface | Build lane |
|------|--------------|-------------|------------|
| **Fill-cycle radar** | Lash fills due in 14–21 days slip → empty chairs | Today KPI + Liv briefing + SMS batch | R2 · `fill-cycle-rebook` |
| **DM → book without context loss** | Instagram DM screenshot ≠ booking record | Inbox thread carries service + artist preference into booking | R1 live · extend with **lash map attach** |
| **Preset = company skin** | Staff/reception see different app than owner | Morph + operational chrome on my-day, floor, inbox (all personas) | R3 · Track D |
| **Sunday triage in 90 seconds** | Cross-location owners drown in noise | Chain glance: pending + handoffs only, per shop | org_admin ritual |
| **Deposit truth** | “Did they pay?” arguments at chair | Pending reason line on every surface + guest visit page | live |

### Reception / front desk

| Idea | Real problem | Cross-surface | Build lane |
|------|--------------|-------------|------------|
| **Floor-first walk-ins** | Walk-ins aren’t inbox threads | iPad `/bookings?create=1` + NFC “tap to check in” | R2 · desk mode |
| **Missed call → SMS hold** | Phone rings during rush | VOICE channel in inbox (not “walk-in” label) | live · seed fixed |
| **Artist routing compass** | “Who can take a brow tint now?” | Live availability strip: next free slot per tech | R2 · `beauty-station-compass` |
| **Patch-test gate at desk** | Colour service blocked without test | Scanner / search client → red banner before book | R1 guard · per-service flag P1 |

### Staff (chair)

| Idea | Real problem | Cross-surface | Build lane |
|------|--------------|-------------|------------|
| **My chair, not the business** | Juniors overwhelmed by owner UI | My-day hero + preset skin + haptic “next client” | R3 live |
| **Formula handoff card** | Colour notes lost between visits | Apple Pencil sketch on booking notes → guest profile | R3 · `beauty-formula-canvas` |
| **Run late cascade** | One late client breaks the day | One tap → Liv texts next two + front desk banner | live mobile |
| **Retail attach at checkout** | Aftercare never sold | Complete session → Liv suggests SKU → SMS link | R2 · post-session flow |

---

## Guest (P7) wow — link-in-bio to loyalty

| Idea | Real problem | Cross-surface | Build lane |
|------|--------------|-------------|------------|
| **Fill vs full set clarity** | Guests book wrong service | `/b` menu cards with cycle hints (“due for fill”) | R2 |
| **Patch-test trust moment** | Serious studio signal | Inline question + block if needed — no account wall | R1 live |
| **Visit token** | “When am I in?” anxiety | Branded visit page: time, artist, prep, map | live |
| **Aftercare in character** | Generic SMS feels cheap | Continuity templates per service (lash vs wax vs nail) | R2 |
| **Wallet pass reminder** | Lock-screen > email | Apple/Google wallet appt pass (T-24h) | R3 |
| **Rebook in two taps** | 11pm link-in-bio moment | `/b` remembers last service + artist preference | R2 · guest memory |

---

## Hardware & modality matrix

| Surface | Beauty-native use |
|---------|-------------------|
| **Owner phone** | Briefing, approve refund, peek inbox |
| **Reception iPad (touch)** | Floor calendar, walk-in create, voucher scan |
| **Staff phone** | My chair, run late, complete session |
| **Apple Pencil / stylus** | Brow mapping, colour formula notes on client |
| **Apple Watch / glance** | “Next client in 5” — staff only |
| **TV / display** | Optional queue board for waiting area (anonymised) |
| **Voice** | Missed call → Liv SMS back; not a fake inbox walk-in |

---

## Onboarding jaw-drop sequence (target)

1. **Pick preset** — live iframe, no white flash; app + `/b` match (Track D polish).
2. **Menu in 60s** — beauty templates pre-load lash/nail/brow services.
3. **Inbox seeded** — real DM + missed call threads; floor guidance explains walk-ins.
4. **Patch-test on `/b`** — guest flow shows discipline immediately.
5. **Switch persona (demo)** — reception sees floor; staff sees my chair; same preset skin.

---

## P0–P3 prioritisation (beauty-only)

| Priority | Item | Why now |
|----------|------|---------|
| **P0** | Preset anti-flash + global persona chrome | Trust in Settings; accessibility |
| **P0** | Walk-in vs inbox policy | Operational truth |
| **P1** | Per-service patch-test flag | Playbook promise |
| **P1** | Fill-cycle SMS + `/b` fill hints | Category wedge vs Phorest |
| **P2** | Station compass (reception iPad) | Real floor pain |
| **P2** | Formula canvas (Pencil) | Differentiator vs booking widgets |
| **P3** | Wallet pass + TV queue | Delight layer |

---

## Cascade checklist (when shipping any row)

- [ ] `lib/policy` vocabulary + guards  
- [ ] API service + demo seed  
- [ ] Dashboard + mobile + `/b` thin renderers  
- [ ] Registry row + demo slug `bloom-beauty-dublin`  
- [ ] `pnpm vertical:doc-check`

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-05 | Initial innovation program — persona matrix, hardware, onboarding sequence |
| 2026-06-05 | P0–P3 shipped: studio-setup, beauty-reception/tv, fill KPI, patch-test gate UI, formula canvas, wallet pass panel, demo bloom metadata |
| 2026-06-05 | Mini store (R2): `/beauty-store` admin, `/b` shop section, pay links, post-session attach |
