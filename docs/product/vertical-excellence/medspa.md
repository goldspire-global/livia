# Medspa vertical — excellence spec (V6)

**Status:** canonical (2026-06-03)  
**Demo:** `clarity-medspa-dublin`  
**Program:** [MEDSPA-VERTICAL-PROGRAM.md](../MEDSPA-VERTICAL-PROGRAM.md)

---

## 1. “Yes, this is my clinic” bar

Practice manager: **procedures** with consent before chair, **deposit** on book, **mandate queue** visible, practitioner sees **intake + history** — Liv never diagnoses.

---

## 2. Operating reality

| Concern | Requirement |
|---------|-------------|
| Clinical | Consent, contraindications, practitioner-only notes |
| Commercial | Packages, memberships, high ASP deposits |
| Compliance | Audit trail, before/after photos, HIPAA/GDPR posture (EU: GDPR + honest claims) |
| Guest | Calm brand, prep instructions, no salon tone |

**2026 bar (PatientNow, Pabau, Zenoti, Delam):** digital intake before arrival, e-sign consent, photo gallery per patient, deposit at book, membership billing — **not** six disconnected tools.

---

## 3. Current Livia audit

| Works | Gaps |
|-------|------|
| `/medspa` hub nav | Procedure-specific chart templates |
| Consent guest surface | Before/after photo vault |
| Mandate + intake API | Injection mapping / body diagram |
| clarity demo + UAT | Membership autopay |
| clinical-calm preset | AI scribe (defer) |
| Medspa guards | State-specific consent packs |

---

## 4. Exceptional operator (phased)

### P0
- Consent queue zero on day of treatment (signed).
- Procedure catalog with duration + deposit + consent template link.
- Practitioner day list with intake status icons.

### P1
- Before/after photos on client (encrypted, consent flag).
- Treatment plan: multi-visit series (Botox cycle, laser course).
- Package burn + membership status on book.
- Audit log on note edits (support-ready).

### P2
- Patient portal: history, book follow-up, pay balance.
- Lead capture → book consult funnel.
- Integration path to EMR export (partner) — not Livia as EHR.

### Never
- Diagnosis, prescription, or Liv treatment recommendations (G3 counsel).

---

## 5. Exceptional guest

Complete intake on phone → sign consent → pay deposit → visit prep SMS → calm `/b` — no neon salon UX.

---

## 6. Competitive bar (2026)

Aesthetic Record, PatientNow, Pabau — clinical depth. Livia: **lite clinical** + shared OS with beauty/hair for hybrid groups.

---

## 7. Changelog

| Date | Change |
|------|--------|
| 2026-06-03 | Excellence spec |
