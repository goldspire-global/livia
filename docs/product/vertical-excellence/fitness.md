# Fitness vertical — excellence spec (V5)

**Status:** canonical (2026-06-03)  
**Demo:** `peak-fitness-dublin`  
**Program:** [FITNESS-VERTICAL-PROGRAM.md](../FITNESS-VERTICAL-PROGRAM.md)

---

## 1. “Yes, this is my gym” bar

Studio manager: **classes** with capacity + waitlist, **PT sessions** separate, **packs** burn on book, member gets **clear book/waitlist/cancel** on phone.

---

## 2. Operating reality

| Model | Core loop | Failure if generic booking |
|-------|-----------|----------------------------|
| Boutique class | Fill 20 spots, waitlist promote | Treating class as 1:1 appointment |
| PT studio | Trainer calendar, 60m blocks | No pack/session balance |
| Hybrid gym | Membership + classes | Wrong billing cadence |
| Intro funnel | Free assessment → convert | No assessment service type |

**2026 bar:** Waitlist auto-notify, PARQ/waiver before first book, branded member app (Glofox, Zenoti, Recess).

---

## 3. Current Livia audit

| Works | Gaps |
|-------|------|
| `/classes` route + nav | Class recurrence templates |
| Waitlist guest surface | Spot picking / mat position |
| fitness book card overrides | Pack balance on profile |
| peak-fitness seed + waitlist | PARQ digital intake |
| gym-bold preset | Member-facing app parity |
| Minimal fitness guards | Late cancel / no-show fees |

---

## 4. Exceptional operator (phased)

### P0
- Class creation wizard: capacity, duration, instructor, recurrence.
- Waitlist promote flow E2E signed.
- PT vs class split on `/b` and owner home.

### P1
- **Packages:** 10-session pack, auto-decrement, low-balance SMS.
- PARQ / waiver on first book (fitness guard expansion).
- Intro assessment → follow-up PT book chain.
- Late cancel policy enforcement + fee (policy).

### P2
- Member app tab (or PWA) with pack balance + history.
- Class fill % briefing on owner home.
- Equipment/bay booking (hybrid gym).

### Never
- Full membership dunning stack day one; WOD tracking (niche).

---

## 5. Exceptional guest

See class capacity → join waitlist → auto SMS when spot opens → book PT with coach preference → cancel within policy window.

---

## 6. Competitive bar (2026)

Glofox, Mindbody, Pike13, Zenoti fitness — waitlist, packs, PARQ, branded app. Livia: **people-business OS** for owner-operators also running spa/beauty adjacency.

---

## 7. Changelog

| Date | Change |
|------|--------|
| 2026-06-03 | Excellence spec |
