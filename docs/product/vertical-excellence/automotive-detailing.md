# Automotive detailing vertical — excellence spec (V-AD)

**Status:** canonical (2026-06-03)  
**Demo:** `shine-studio-belfast`  
**Program:** [AUTOMOTIVE-DETAILING-VERTICAL-PROGRAM.md](../AUTOMOTIVE-DETAILING-VERTICAL-PROGRAM.md)

---

## 1. “Yes, this is my studio” bar

Detailer: book by **vehicle class** (sedan/SUV/van), **package** (wash → full detail → ceramic), **bay** utilization, deposit on 4h+ jobs — mobile or shop.

---

## 2. Operating reality

| Mode | Scheduling | Pricing |
|------|------------|---------|
| Shop | Bay + buffer between jobs | Size tier multiplier |
| Mobile | Drive time + job cap/day | Address on book |
| Fleet | Recurring corporate | Account notes |

**2026 bar (SchedulingKit, DETAILERMADE, Addagio, Anolla):** vehicle type pricing, package tiers, add-ons at book, bay calendar, photo required for heavy soil.

---

## 3. Current Livia audit

| Works | Gaps |
|-------|------|
| Vehicle make/model guard | Vehicle class enum (sedan/SUV/truck) |
| shine-studio demo | Package builder UI |
| Detailing vocabulary | Size-based price rules |
| | Bay resource scheduling |
| | Mobile travel buffer |
| | Fleet account entity |

---

## 4. Exceptional operator (phased)

### P0
- Services: packages + add-ons (engine bay, pet hair).
- `/b`: vehicle class selector → price adjusts.
- Bay as booking resource (optional shop mode).

### P1
- Deposit on ceramic / correction services.
- Photo upload required flag (heavy soil).
- Daily job cap + auto-close book when full.
- Running late broadcast (exists — detailing copy).

### P2
- Fleet portal (multiple vehicles under account).
- Membership unlimited wash (recurring).
- Route day planner (mobile).

### Never
- Parts inventory; mechanical repair workflows.

---

## 5. Exceptional guest

Pick SUV → see package price → add engine bay → pay deposit → visit with drop-off instructions + bay address.

---

## 6. Competitive bar (2026)

Urable, Jobber, Detailermade — vehicle-aware menus. Livia: people-business OS for premium service businesses.

---

## 7. Changelog

| Date | Change |
|------|--------|
| 2026-06-03 | Excellence spec |
