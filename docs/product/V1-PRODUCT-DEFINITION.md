# V1 Product Definition

**Status:** canonical Volume A (2026-06-05)  
**Audience:** founder, product, engineering, design, GTM, Cursor  
**Authority:** **Nothing outside this document should influence V1 scope.** Future layers are in Master Blueprint volumes B–H; they are V2+ unless explicitly scheduled in [`LIVIA-MASTER-EXECUTION-PLAN-V3.md`](./LIVIA-MASTER-EXECUTION-PLAN-V3.md) Era 1.

---

## Why this document exists

The vision of Livia is enormous and correct. The timing is dangerous. The fastest way to kill Livia is attempting to launch 80 verticals, marketplace, Business Twin, advanced Liv, and trust network **before proving demand**.

This document stops that. It defines exactly what V1 is and what V1 is not.

---

## The single goal of V1

V1 exists to answer **one question**:

> Will appointment-based service businesses trust Livia enough to run their daily operations through it?

Nothing else matters for V1: not AI showcase, not marketplace, not category-creation press, not investor demos of future layers.

---

## V1 mission statement

Livia helps service businesses:

1. Get booked  
2. Stay organized  
3. Communicate better  
4. Get paid  

…from one place.

---

## V1 positioning

| Livia **is** (external) | Livia is **not** (external) |
|---------------------------|-----------------------------|
| The easiest way to run your service business | AI Platform |
| | Marketplace |
| | Business Twin (as marketed feature) |
| | "Operating System" (as category claim at launch) |

Internally, Livia **is** building toward the People Business OS. Externally at V1, lead with **operational trust** — run your business from one place.

---

## V1 customer (ICP)

**Ideal customer profile:**

- Owner-operator  
- Appointment-based  
- Mobile-first in daily work  
- 1–10 staff  
- Direct purchasing authority — owner feels every operational pain personally  

**GTM Wave 1 verticals (founder lock 2026-06-05):**

All **nine code verticals** ship at the **same creative parity bar** — see [`GTM-VERTICAL-DEPTH-PROGRAM.md`](./GTM-VERTICAL-DEPTH-PROGRAM.md) and [`VERTICAL-INNOVATION-PROGRAM.md`](./VERTICAL-INNOVATION-PROGRAM.md).

| Vertical | Sub-segments (onboard profiles) |
|----------|--------------------------------|
| Hair & barbering | Salon, barber, colour, chair-rental, mobile |
| Beauty (full aisle) | Lash, nail, brow, wax, facial, tan, PMU-light, mobile, multi-service |
| Wellness & spa | Massage, float, holistic, couples, day/hotel spa |
| Body art | Custom, flash, piercing, cosmetic tattoo |
| Medspa | Injectables, laser, skin clinic, memberships |
| Allied health | Physio, chiro, OT, speech, sports rehab |
| Fitness | Class studio, PT, hybrid gym, yoga/pilates |
| Pet grooming | Salon, mobile, multi-pet, temperament-sensitive |
| Automotive detailing | Bay, ceramic, fleet, mobile pickup |

**Guest surfaces:** `{slug}.livia-hq.com` book + `/my` relationship vault — user-facing `/b` retired.

**Explicitly ignored for V1 GTM:** enterprise, hospital-scale, large gym chains, franchises, dental, mental health at clinical depth. Partner docs only.

---

## Core promise

| Market today | Livia V1 |
|--------------|----------|
| Manage appointments | **Run your business** |

---

## The V1 job

When a business owner downloads Livia, they must be able to:

1. Create business  
2. Add services  
3. Add staff  
4. Set availability  
5. Accept bookings  
6. Take payments  
7. Talk to customers  
8. Collect reviews (simple)  
9. Share booking page  
10. Show portfolio (simple)  

And that's it.

---

## V1 product scope

### Included

| Domain | Scope |
|--------|-------|
| **Business** | Create, edit, manage |
| **Staff** | Create, edit, assign services, availability |
| **Services** | Create, edit, duration, price, description |
| **Customers** | Create, view, history, notes |
| **Bookings** | Create, edit, cancel, reschedule, status |
| **Availability** | Working hours, time off, blocked time |
| **Public booking** | Required — critical path |
| **Payments** | Stripe — deposits + booking payments |
| **Reviews** | Simple collection + display |
| **Portfolio** | Simple version |
| **Messaging** | Inbox foundation |
| **Liv** | Setup assistant (required) |
| **Notifications** | Email; SMS/push later |

### Explicitly excluded from V1

- Marketplace / capability marketplace  
- Workflow packs (as purchasable products)  
- Partner ecosystem  
- Trust network / advanced verification  
- Business Twin (as user-facing product)  
- Advanced Liv / advanced AI / advanced automation  
- Multi-location enterprise  
- Developer platform / white label / agency mode  
- Custom domains  
- International expansion features beyond core EU path  

**Repo note (2026-06-05):** Wellness depth work (chain, reports, guest vault pages) is **engineering ahead of V1 proof**. New V1 work must serve activation; depth ships when gated in execution plan Era 1 Q2+.

---

## Activation journey

The entire company optimizes for **First Successful Booking**.

```text
Create Account
  ↓
Create Business
  ↓
Choose Vertical
  ↓
Add Services
  ↓
Set Availability
  ↓
Connect Payments
  ↓
Publish Booking Page
  ↓
Receive First Booking  ← SUCCESS
```

### Sacred metric

Everything optimizes toward **First Successful Booking**.

Not: account created. Not: business created. Not: staff added.

**Repo implementation:** `lib/policy/src/onboarding-program.ts` — `test-booking` activation step; auto-marked via `markOnboardingTestBooking()` on first booking in `public.ts` / `bookings.ts`. Go-live blocked without it (`onboarding-analytics.service.ts`).

**Gap:** No dedicated activation funnel analytics dashboard; events exist but product analytics layer is thin.

---

## V1 founder dashboard

Must answer: **What is happening today?** — not what happened this year.

**Required widgets:**

- Today's bookings  
- Today's revenue  
- Today's customers  
- Messages  
- Liv tasks  
- Upcoming appointments  

Nothing more for V1.

**Repo status:** Dashboard exists with richer modules (wellness ops, chain, etc.) — V1 polish means **default owner view** matches this widget set before vertical depth surfaces.

---

## Liv in V1

| Liv is **not** | Liv **is** |
|----------------|------------|
| Business advisor | Setup assistant |
| Revenue strategist | Operational assistant |
| AI agent / automation engine | Navigation assistant |

**Examples of sufficient V1 Liv:**

- "Help me add staff."  
- "How do I connect Stripe?"  
- "How do I publish my booking page?"  

---

## Public booking experience

The most important customer-facing surface.

**Must feel:** professional, fast, trustworthy, mobile-native, beautiful.

**Customer must:** view services → view availability → book → pay deposit → receive confirmation in **under 2 minutes**.

**Repo:** `artifacts/livia-dashboard/src/pages/public-booking.tsx`, `GET /api/public/:slug/*`, presentation presets on `/b`. Bucket C UAT still open for founder sign-off.

---

## Pricing (V1 recommendation)

| Tier | Price | Notes |
|------|-------|-------|
| Free | €0 | 1 staff, limited bookings — trial/adoption |
| Pro | €29/mo | Most customers |
| Growth | €79/mo | Growing teams |

No custom pricing. No enterprise sales team at V1.

**Revenue targets:** €1,000 MRR first, then €10,000 MRR. Ignore everything else until repeatability.

Aligns with [`../business/pricing-and-packaging.md`](../business/pricing-and-packaging.md) — reconcile before prod billing switch.

---

## Success metrics

| Metric | Purpose |
|--------|---------|
| Activation rate | % reaching first booking |
| Time to first booking | Speed of value |
| Bookings per business | Engagement depth |
| Weekly active businesses | Operational return |
| Monthly retention | Trust proof |
| Review collection rate | Trust loop |
| Payment connection rate | Commerce readiness |

---

## Customer learning phases

**First 10 customers:** goal = learning. Interview every customer. Watch onboarding, booking creation, failures.

**First 100 customers:** goal = repeatability. Why buy, stay, leave.

---

## Five proofs (V1 exit)

| Proof | Question |
|-------|----------|
| 1 | Businesses will onboard |
| 2 | Businesses will publish booking pages |
| 3 | Customers will book |
| 4 | Businesses will return weekly |
| 5 | Businesses will pay |

If all five are true → Livia earns V2. If not → fix V1.

### V2 exit criteria (numeric)

- 100 activated businesses  
- 70%+ monthly retention  
- €10k MRR  

Only then: Business Twin product, Capability Graph marketplace, Advanced Liv, full Experience OS.

---

## Instruction to engineering and Cursor

For V1: **do not build the future. Build the proof.**

Every screen, API, workflow, and design decision should help a business reach **First Successful Booking** as quickly and beautifully as possible.

That is the entire purpose of Version 1.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-05 | Volume A canonical — repo activation mapping + wellness depth caveat |
