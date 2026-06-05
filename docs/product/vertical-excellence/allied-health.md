# Allied health vertical — excellence spec (V7)

**Status:** canonical (2026-06-03)  
**Demo:** `motion-physio-cork`  
**Program:** [ALLIED-HEALTH-VERTICAL-PROGRAM.md](../ALLIED-HEALTH-VERTICAL-PROGRAM.md)

---

## 1. “Yes, this is my practice” bar

Physio/osteopath: **assessment vs follow-up** clear on book, **recurring plan** (6 visits), **SOAP-lite notes** per session, **GP referral** captured — not pretending to be hospital EHR.

---

## 2. Operating reality

| Pattern | Need |
|---------|------|
| Initial assessment | 45–60m, intake heavy |
| Follow-up | 30m, linked to plan |
| Discharge | Outcome measures |
| Packages | 6-session prepay decrement |
| Multi-practitioner | Per-clinician calendar |

**2026 bar (Cliniko, Pabau, HENO, Medbus):** recurring appointments, package tracking, SOAP templates, reminders, patient portal for HEP (home exercise program) — lite in Livia R2.

---

## 3. Current Livia audit

| Works | Gaps |
|-------|------|
| Vocabulary (patient, practitioner) | SOAP note structure |
| allied-health guards | Treatment plan object |
| `/day-packages` nav | Package auto-decrement |
| motion-physio demo | Outcome measure tracking |
| Care programmes label | Insurance / TELUS billing (partner) |
| Recurring book (generic) | HEP portal |

---

## 4. Exceptional operator (phased)

### P0
- Service types: Assessment | Follow-up | Review with durations.
- Care programme link on recurring bookings.
- Patient profile: reason for visit, referral flag.

### P1
- Session notes template (SOAP sections) — export PDF, not regulated EHR.
- Plan: N visits over M weeks with adherence view.
- Package purchase + burn visible to reception.
- Remind cadence for plan rebook (visit 4 of 6).

### P2
- Outcome scores (pain 0–10) trend on profile.
- GP referral letter attach (storage).
- Patient portal: exercises PDF/link.

### Never
- Full EHR, e-prescribing, Medicare bulk bill claims as Livia core.

---

## 5. Exceptional guest

Book assessment vs follow-up correctly → intake form → prep SMS → know who they’re seeing → reschedule without phone tag.

---

## 6. Competitive bar (2026)

Cliniko, Jane App, ClinDesk — recurring + packages + WhatsApp reminders (IE/EU). Livia: **lite clinic** on appointment OS.

---

## 7. Changelog

| Date | Change |
|------|--------|
| 2026-06-03 | Excellence spec |
