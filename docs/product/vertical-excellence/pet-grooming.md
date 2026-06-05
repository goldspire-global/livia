# Pet grooming vertical — excellence spec (V10)

**Status:** canonical (2026-06-03)  
**Demo:** `paws-parlour-dublin`  
**Program:** [PET-GROOMING-VERTICAL-PROGRAM.md](../PET-GROOMING-VERTICAL-PROGRAM.md)

---

## 1. “Yes, this is my parlour” bar

Groomer books **Biscuit**, not just “Sarah” — breed, temperament, vaccinations visible before groom; parent gets pickup SMS.

---

## 2. Operating reality

| Entity | Fields | Ops |
|--------|--------|-----|
| Pet parent | Contact, address | SMS to parent |
| Pet | Breed, coat, weight, temperament, allergies, vax expiry | Safety |
| Appointment | Service by size, duration | Price by size tier |
| Mobile groomer | Route, van | Travel buffer |

**2026 bar (GroomBoard, MoeGo, SchedulingKit):** pet-centric CRM, vax expiry badges, before/after photos to parent, online book creates pet profile.

---

## 3. Current Livia audit

| Works | Gaps |
|-------|------|
| Pet guards on `/b` (name, breed, notes) | Pet entity on client profile (persistent) |
| pet-grooming vocabulary | Vaccination expiry tracking |
| paws-parlour demo | Size-based pricing matrix |
| Booking guards | Multi-pet household |
| | Mobile route planning |
| | Cat-specific duration defaults |

---

## 4. Exceptional operator (phased)

### P0
- Client profile: **pets** sub-record (not one-off form fields).
- Services: groom packages by size (S/M/L/XL).
- `/b` book flow: select pet or add pet.

### P1
- Vaccination dates + expired badge on day-of groom.
- Temperament flag (aggressive → alert banner).
- Before/after photo → SMS to parent.
- Multi-pet discount / sequential book.

### P2
- Mobile route optimizer (defer integrated maps).
- AI breed → suggested service (GroomGrid pattern).

### Never
- Veterinary diagnosis; medical treatment records.

---

## 5. Exceptional guest

Book **Max** (Golden Retriever, nervous) → see vax ok → pickup time SMS → rebook tidy in 6 weeks.

---

## 6. Competitive bar (2026)

MoeGo, GroomBoard, Animalo — pet profiles, vax, temperament. Livia: same inbox/Liv OS for multi-service pet spas.

---

## 7. Changelog

| Date | Change |
|------|--------|
| 2026-06-03 | Excellence spec |
