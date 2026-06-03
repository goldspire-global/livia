# Liv tool registry matrix — policy vs implementation

**Status:** canonical draft (2026-05-31)  
**Audience:** engineering, product, support  
**Purpose:** Map **Liv capabilities** (what the agent may do) to **code modules** and **ship status** — support `surfaceId` investigation and honest marketing.

**SSOT for tool names:** `lib/policy` Liv mandate + API tool handlers (when split).

---

## 1. Matrix

| Tool / capability | Policy / spec | API / service | UI surface | Status |
|-------------------|---------------|---------------|------------|--------|
| **Reply in inbox thread** | [`liv-mandate.ts`](../../lib/policy/src/liv-mandate.ts) | `liv-inbox.service` | Mobile inbox, web thread | ✅ Live |
| **Suggest booking slot** | booking-guards | availability + booking | Liv chat, `/b` | ✅ Live |
| **Create booking (staff assist)** | operational-policy | booking routes | Dashboard assist | ✅ Live |
| **Hand off to human** | liv-mandate | inbox escalation | Thread banner | ✅ Live |
| **Internal support assist** | INTERNAL-SUPPORT | `internal-liv.service` | `/support` context | ✅ Live |
| **Voice (demo)** | wedge-demo-stories | voice webhook stub | Demo only | 🔨 Demo |
| **Reschedule via visit token** | guest-surfaces `visit` | visit token API | `/b/visit/:token` | ✅ Live |
| **Proof approve/reject** | guest-surfaces `proof` | public proof routes | `/b/proof/:token` | ✅ Live |
| **Consent / intake sign** | guest-surfaces `consent` | intake token API | `/b/intake/:token` | 🔨 Partial |
| **Deposit pay link** | guest-surfaces `deposit-pay` | Stripe guest checkout | `/b/pay/:token` | 🔨 Partial |
| **Waitlist accept** | guest-surfaces `waitlist-accept` | waitlist token | `/b/waitlist/:token` | 📋 R2 |
| **Customer package redeem** | VOUCHER-PACKAGE-SPEC | — | `/my` | 📋 R2 |
| **Global search (tenant)** | GLOBAL-SEARCH-SPEC | — | Dashboard ⌘K | 📋 R2 |
| **Exec hat work log** | INTERNAL-EXEC-COCKPIT §4.2b | `exec-work-events` | Cockpit Hats River | ✅ R2 |

### 1b. Setup copilot (configure via Liv) — Track I, R2

**Spec:** [`LIV-SETUP-COPILOT.md`](./LIV-SETUP-COPILOT.md) · **Program:** [`PLATFORM-EVOLUTION-AND-OPS-PROGRAM.md`](./PLATFORM-EVOLUTION-AND-OPS-PROGRAM.md) §7f

| Tool / capability | Policy / spec | API / service | UI surface | Status |
|-------------------|---------------|---------------|------------|--------|
| **Get tenant experience** | TENANT-EXPERIENCE-CONTRACT | `tenant-experience` | Setup thread | 📋 I-A |
| **List / preview / apply presentation preset** | presentation-presets | business PATCH + preview | Settings Appearance, onboarding | 📋 I-A |
| **Patch brand assets** | SKIN-BRAND-INHERITANCE | business PATCH | Appearance | 📋 I-A |
| **Patch Liv persona** | liv-mandate, aiTone fields | business PATCH | Settings Liv, `a6_liv` | 📋 I-A |
| **Explain / propose operational policy** | operational-policy | policies service | Settings Policy | 📋 I-B |
| **Patch hours / confirm public link** | onboarding-program | onboarding + business | Onboarding portal | 📋 I-B |
| **Invite staff / assign service** | RBAC | staff routes | Setup thread | 📋 I-C |
| **Start channel connect** | CHANNELS-EU | OAuth handoff | Settings Comms | 📋 I-C |

**Legend:** ✅ shipped · 🔨 partial / demo · 📋 spec only

---

## 2. Support registry linkage

Tickets carry `surfaceId` per [`SUPPORT-POINTS-AND-INVESTIGATION.md`](../operations/SUPPORT-POINTS-AND-INVESTIGATION.md).

Guest surfaces use prefix `w5.{type}` from [`guest-surfaces.ts`](../../lib/policy/src/guest-surfaces.ts).

---

## 3. Audit cadence

| When | Action |
|------|--------|
| New Liv tool shipped | Add row + update `liv-mandate` |
| Marketing claims Liv feature | Row must be ✅ or 🔨 with label |
| Gate 2 | All wedge-row tools ✅ |

---

## 4. Related

- [`SYSTEMS-COMPLETENESS-AUDIT.md`](./SYSTEMS-COMPLETENESS-AUDIT.md)
- [`GUEST-SURFACES-AUDIT.md`](../engineering/GUEST-SURFACES-AUDIT.md)
- [`support-points.ts`](../../lib/policy/src/support-points.ts)

---

## 5. Changelog

| Date | Change |
|------|--------|
| 2026-05-31 | Initial tool registry matrix |
| 2026-06-02 | §1b setup copilot planned tools (Track I) |
