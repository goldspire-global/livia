# Hair vertical — excellence spec (V1 heartland)

**Status:** canonical (2026-06-03)  
**Demo:** `luxe-salon-spa`, `aurora-studio`, `conors-cut-co`  
**Program:** [HAIR-VERTICAL-PROGRAM.md](../HAIR-VERTICAL-PROGRAM.md)

---

## 1. “Yes, this is my shop” bar

Barber/salon owner within 15 minutes: build **cut/colour menu**, assign **stylists**, set **deposit on colour**, share **`/b`** that books **preferred stylist**, see **today’s chair** with colour blocks visible.

---

## 2. Operating reality

| Sub-segment | Physics | Software must |
|-------------|---------|---------------|
| Barbershop | Fast chair turns, walk-ins | Queue + appointments coexist |
| Salon | Colour blocks 90–180m | Processing gap / double-booking prevention |
| Chair rental | Renter PII firewall | Host cannot see renter clients |
| Blow-dry bar | Add-on services | Short slots + upsell |

**Day-one jobs:** confirm pending colour deposits, see who’s in chair, SMS running late, midnight booking with stylist preference.

---

## 3. Current Livia audit

| Works | Gaps |
|-------|------|
| Hair guards (colour visit, duration check) | **`/services` not in sidebar nav** (same platform bug as beauty) |
| Vocabulary (client, stylist, chair) | Services UI generic (Scissors, “Haircut” placeholder) |
| Chair-rental org patterns | Colour **formula** not structured (notes only) |
| Deposits platform-level | Per-service deposit rules UI |
| Wedge + Luxe demo | warm-chair preset PNGs incomplete |
| Stylist preference on `/b` | Optional — not guided in onboarding |

---

## 4. Exceptional operator (phased)

### P0
- Treatments/Cuts in nav; blocking menu onboarding; hair templates (Cut, Skin fade, Full colour, Toner, Blow-dry).
- Category: Cut | Colour | Styling | Grooming.
- Studio setup hub: menu + stylists + deposit policy for colour.

### P1
- **Colour consult** service type + longer default buffer.
- Client profile: colour history note, inspiration photos, formula text fields (not Vish grams).
- **Processing gap** calendar visual (blocked chair during develop).
- Stylist preference on `/b` (default on for salon, off for barber walk-in).
- Continuity: 3-touch SMS (confirm, 24h, 2h).

### P2
- Walk-in queue module (barber).
- Vish/integration hook for formula export (partner).
- Retail attach at checkout.
- No-show scoring → deposit suggestion.

### Never
- Full POS inventory; payroll; competitor migration bots.

---

## 5. Exceptional guest

Pick stylist → honest duration for colour → deposit when required → visit token with name + chair → reschedule SMS. Book at 11pm from Instagram bio.

---

## 6. Competitive bar (2026)

Zenoti, OpenChair, Phorest, Booksy — walk-in queue, colour formulas, chair rental billing, deposit-backed colour, Style Match / photo consult. Livia wins as **OS across verticals** with hair-deep workflows on shared inbox/Liv.

---

## 7. Changelog

| Date | Change |
|------|--------|
| 2026-06-03 | Excellence spec from audit + Zenoti/OpenChair research |
