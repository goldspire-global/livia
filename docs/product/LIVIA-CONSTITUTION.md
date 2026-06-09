# Livia Constitution

**Status:** canonical Volume 0 (2026-06-05)  
**Audience:** every person and agent who makes product, engineering, or company decisions  
**Authority:** When beliefs conflict with convenience, **this doc wins**. Tactical scope: [`V1-PRODUCT-DEFINITION.md`](./V1-PRODUCT-DEFINITION.md).

---

## Preamble

Livia is not being built to compete in the appointment-software category. It is being built to **define and own** the People Business Operating System category. That ambition is correct. The danger is building the future before proving the present.

This constitution exists so that as the company grows — more engineers, more agents, more customers, more capital — decisions stay aligned with one philosophy. Products are built from code. Platforms are built from systems. Companies are built from beliefs.

---

## Article I — Purpose

**Livia exists to help people-businesses succeed.**

Not merely operate. Not merely book appointments. Not merely process payments. Every capability, screen, API, and Liv recommendation must ultimately increase the probability that a real business — run by a real human serving real customers — succeeds.

When a decision is unclear, ask: *Does this increase the likelihood of customer success?* If not, question the decision.

---

## Article II — Understanding over data

Most software stores information. Livia creates **understanding**.

Data alone is not valuable. Understanding creates value. The platform must continually move from *what happened* to *what it means* to *what to do next*. The Business Twin owns understanding; Liv owns interaction; neither duplicates the other's job.

---

## Article III — The business comes first

Not the feature. Not the workflow. Not the technology. **The business.**

Every capability must answer: *How does this help the business?* The root aggregate in Livia is always **Business**. Bookings, customers, staff, and payments are facets of a business — not the business itself.

---

## Article IV — Experience is infrastructure

UX is not decoration. Experience determines adoption, activation, retention, and trust. The Experience OS resolves what appears, when, and why — from role, device, capabilities, presentation, and context. Two businesses on the same platform should both feel *Livia was built for me*.

---

## Article V — Complexity belongs to Livia, not the user

The platform may become extremely sophisticated internally. The user experience must become increasingly simple.

```text
Power increases → Complexity decreases (for the user)
```

Liv exists partly to absorb complexity — setup, navigation, operational assistance — so owners can focus on their craft.

---

## Article VI — One platform, not many products

Livia must resist:

- Salon product, tattoo product, clinic product, coach product…

Instead:

- One platform, many configurations through the Capability Graph and Vertical Registry.

Verticals **configure**. They do not **fork** architecture. No `if (salon)` in core booking, payment, or Liv code.

---

## Article VII — Capabilities over verticals

Businesses differ. Capabilities repeat. The Capability Graph organizes the platform around reusable business functions — bookings, deposits, messaging, reviews, memberships — not industry labels.

When a new business type appears, ask: *What capabilities does it require?* — not *What screens does it need?*

---

## Article VIII — Events are the nervous system

Every meaningful business change emits an event. Events describe business reality, not application mechanics. `BookingCreated` yes; `ButtonClicked` no.

If a meaningful change occurs and no event exists, the platform is blind. Create the event.

The Twin consumes business-reality events. Liv primarily consumes Twin outputs — not raw event floods.

---

## Article IX — Liv is operating intelligence, not a chatbot

Liv is the Operating Intelligence Layer. She orchestrates through registered tools. She never owns data, business logic, or understanding. She does not update databases directly. She does not duplicate Business Twin reasoning.

In V1, Liv is Setup Assistant + Operational Assistant + Navigation Assistant. That is enough to prove value. Advisor and Analyst modes come after the Twin matures.

One Liv, not Beauty Liv / Tattoo Liv / Clinic Liv. Vertical awareness through context, not identity fragmentation.

---

## Article X — Trust precedes revenue

Before a customer books, pays a deposit, or refers a friend, trust must exist. Trust is infrastructure: identity, verification, reputation, proof, behaviour — not a star rating widget.

---

## Article XI — Relationships over channels

Service businesses operate through **relationships**. Bookings are moments within relationships. Communications must answer *what is happening between this business and this person?* — not merely *what message was sent?*

Conversations are channel-agnostic. Channels are delivery mechanisms.

---

## Article XII — Extend before replace

The default engineering question is: *What existing system should this extend?*

Canonical ownership is singular:

| Concept | Owner |
|---------|-------|
| Business understanding | Business Twin |
| Capabilities | Capability Graph |
| Experience | Experience OS |
| Trust | Trust Layer |
| Communications | Relationship Layer |
| Intelligence interaction | Liv Runtime |
| Rules | Policy Layer |
| Change records | Event System |
| Money | Commerce Layer |

No concept may have two competing systems.

---

## Article XIII — V1 proves before V2 earns

V1 exists to answer one question:

> Will appointment-based service businesses trust Livia enough to run their daily operations through it?

The sacred metric is **First Successful Booking** — not account created, not business created, not staff added.

V2 layers — Business Twin at scale, Capability Marketplace, Advanced Liv, Experience OS at full resolution — are earned only after V1 proof:

- 100 activated businesses
- 70%+ monthly retention
- €10k MRR

Until then: **build the proof, not the future.**

---

## Article XIV — Mobile and public surfaces are products

When ambiguity exists about surface priority: **choose mobile** for tenant operators.

The public `/b` experience is the **business front door** — not a booking widget. It must feel professional, fast, trustworthy, and mobile-native. A customer should complete book + pay deposit in under two minutes.

---

## Article XV — Proactive over reactive

Liv should not ask *what do you want me to do?* when the platform already knows. The long-term goal is proactive intelligence grounded in genuine business understanding — not reactive conversation.

---

## Amendment process

Constitutional principles change only by explicit founder decision, documented here with date and rationale. Tactical execution changes through [`LIVIA-MASTER-EXECUTION-PLAN-V3.md`](./LIVIA-MASTER-EXECUTION-PLAN-V3.md) quarterly reviews.

Engineering interpretation: [`../engineering/CURSOR-ENGINEERING-CONSTITUTION.md`](../engineering/CURSOR-ENGINEERING-CONSTITUTION.md).

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-05 | Volume 0 canonical — merged audit Part 18 + Draft 0.1 + repo reality |
