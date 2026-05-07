# Livia's bets — what puts us in a league of our own

**Status:** F7 draft (2026-05-07). The most strategic document Livia will ever write.

---

## The thesis

**"In its own league" means changing the unit primitive of the category.**

Stripe didn't make payments faster than Authorize.net. They reframed payments from "merchant account integrations" to "seven lines of code." Different unit primitive: developer experience as the product.

Notion didn't make better docs than Google Docs. They reframed the unit from "page" to "block." Different unit primitive: composability.

Linear didn't make better tickets than Jira. They reframed PM from "ticket" to "cycle" with strong opinions about pace. Different unit primitive: opinions as a product.

Figma didn't make a better design tool than Sketch. They reframed design from "file" to "shared canvas." Different unit primitive: multiplayer.

Tesla didn't make a better car than BMW. They reframed cars from "vehicle" to "platform you charge + update." Different unit primitive: software-defined hardware.

Cursor didn't make a better IDE than VS Code. They reframed coding from "editor with AI plugin" to "AI is the editor." Different unit primitive: AI-as-host.

Each is unfakeable because **competitors cannot copy without becoming a different company.**

## Livia's unit primitive shift

**"Software you operate" → "Colleague you hire."**

Phorest sells software the Owner operates. The Owner logs in, configures, clicks, reads dashboards, manages it. The product is a *tool*.

Livia gives the Owner a colleague who happens to be software. The Owner *works with* her. Owners say "we have Liv." Customers say "Liv handled it." Staff say "ask Liv." A new hire's induction includes *being introduced to Liv*. When the lease is lost, Liv shows up with a relocation plan, in character.

That single shift — colleague, not tool — is the unfakeable wedge. **Phorest cannot copy this without firing their entire product team and hiring novelists, voice directors, and behavioural scientists.** Fresha cannot copy this without abandoning the marketplace model. Square cannot copy this without becoming a different company.

The objection: *"Isn't every product an AI assistant now?"*

The answer: no. Most are AI features bolted onto tools — a chatbot in the dashboard, an autocomplete in the form, a summary on the dashboard. The dashboard remains the product. We are reshaping the unit. The dashboard becomes the *means by which the colleague is reachable*, not the product itself. There is a difference between a chef in your kitchen and a recipe app on your phone, and the difference is the *unit*.

The 10 bets below are coherent expressions of this single shift. Each one, on its own, would move us. Together they describe a product unlike anything in the category.

---

## Per-bet documentation format

Each bet documents:

- **Thesis** — what the bet claims.
- **Evidence** — why we think it's true.
- **What it makes possible** — the resulting product moments, in concrete sentences (often in Liv's voice).
- **What we have to build** — engineering implications.
- **Who would have to copy** — and what it would cost them.
- **Moat duration** — how long the wedge holds.
- **Failure mode** — what happens if we're wrong about the bet.
- **Kill criteria** — when do we abandon the bet.
- **Build wave** — v1 launch / v2 (6-12 mo) / v3 (12-24 mo) / Aspirational.

---

## Bet 1 — Liv has a character. Name. Backstory. Register. Opinions. Refusals.

**Thesis.** A named character with a coherent personality is more valuable than ten dashboards. Owners and staff will form a relationship with a *colleague named Liv* in a way they will never form with a "platform." The relationship itself is product.

**Evidence.** Superhuman demonstrated that ritual + character can sustain $30/mo per inbox where Gmail is free. Notion's "block" naming created a vocabulary moat. Stripe's documentation voice is a wedge competitors still chase. Apple's "Siri," Amazon's "Alexa," and Tesla's "Autopilot" all ship as named entities, not features. Salons in Ireland already name their tools ("the calendar," "the system"); a *named colleague* fills a slot in their language.

**What it makes possible:**
- Daily briefing signed by Liv: "Good morning. Three things before coffee. Mary's running 10 minutes late — I've held the slot. The new product range arrived; I've added it to the booking page in your tone. Niamh asked to swap Saturday — I said you'd have a view by lunch."
- New-staff-introduction page: "This is Liv. She'll text you on your first day. She knows the regulars, the rules, and the unwritten rules. If you're unsure, ask her — she won't tell on you to the boss."
- Refusal: "I can't book Mary into Niamh's Saturday — Niamh told me last week she was holding it. Want me to ask her?"
- Christmas-eve email signed: *"From Liv and the team at Aurora Studio."*

**What we have to build.** Character bible (backstory, voice, register, refusal canon). Per-locale voice variants (English-IE default; Gaeilge symbolic; UK English, Polish, Portuguese-BR for v2). Voice consistency across surfaces (briefing, audit log, "Liv was wrong" pages, email signatures, voice line). Tone-inflection logic for vertical and salon brand-positioning.

**Who would have to copy.** Phorest, Fresha, Square. Cost: hire character writers + voice directors + accept the discipline of saying *no* to features that don't fit a colleague's identity. Most competitors cannot pay this organisational cost.

**Moat duration.** 18-36 months minimum to copy credibly. Brand-anchored — first-mover advantage compounds because owners associate "the colleague" with Liv specifically.

**Failure mode.** Owners find the character cloying or fake. Mitigation: the character is *understated, professional, dry-warm*, not Disney. Every line tested with design partners.

**Kill criteria.** Measured at month 6 with the design-partner cohort: in transcribed unprompted conversation about the product, references to Liv by name vs. by category ("the AI," "the bot," "the system") must exceed **60% Liv-by-name**. Below 60%, the character has failed; re-evaluate the bible and ship without claiming the colleague frame publicly.

**Build wave.** **v1 launch.** Without character, none of the other bets feel coherent.

---

## Bet 2 — Liv answers the phone, in voice, with character

**Thesis.** Voice is the deepest wedge in the category. Salons lose more revenue to busy phone lines than to any other operational failure. A voice colleague who answers in character — knowing the regulars, holding the line warmly through a refund call, never rude even at midnight — is worth more than a thousand dashboard improvements.

**Evidence.** Industry data (Phorest State of the Salon, IBISWorld) consistently shows ~30-40% of salon revenue comes from phone bookings. Industry surveys put missed-call rates at 20-30% in single-receptionist shops. No incumbent (Phorest, Fresha, Booksy, Square, Mindbody) handles voice with character. A handful of US startups (Goodcall, Numa) do voice for SMB, but as generic receptionists — no character, no per-tenant memory, no integration with the rest of the operating surface.

**What it makes possible:**
- Mary calls at 9pm: *"Aurora Studio, this is Liv. Mary — your usual Tuesday at 10? I can do that. Same with Niamh? Lovely. I'll text you the confirmation."*
- A first-time caller gets the same warmth: *"Aurora Studio, this is Liv — I'm the salon's AI receptionist, and I'd love to help. What were you thinking about today?"* (mandatory AI disclosure per consumer-protection posture, in character).
- Refund call handled with steel-soft warmth, escalation to the Owner only when the cap is exceeded.
- Owner's phone is the salon's main number; calls are answered 24-7 with no human cost.
- The voice is the *same Liv* who signs the audit log. Continuity of identity across surfaces.

**What we have to build.** Telephony stack (Twilio Voice, ElevenLabs or comparable for per-tenant voice memory). Latency budget: ≤ 600ms first-token, ≤ 2s typical response. Mandatory AI disclosure (consumer-protection + EU AI Act). Per-tenant call memory (Mary's voice tone → caller-id mapping with consent). Bridge to live human (the Owner) on demand. Call transcripts go into the audit-log diary.

**Who would have to copy.** Anyone who wants to compete on the deepest revenue-leak surface. Cost: voice stack + character work + per-tenant memory + accepting voice latency-vs-character tradeoffs.

**Moat duration.** 12-18 months for engineering + 12+ months for character integration. Phorest unlikely to invest at all (architecture mismatch).

**Failure mode.** Customers find AI on the phone uncanny or untrustworthy. Mitigation: mandatory disclosure + warm voice + immediate hand-off on request + design-partner stress-testing across age cohorts.

**Kill criteria.** If design partners' customer satisfaction scores for voice handling fall below their pre-Livia baseline after 3 months, kill voice as v1 and ship as v2 instead.

**Build wave.** **v1 launch.** Voice is the proof point that earns the most attention.

---

## Bet 3 — The trust ratchet is visible to humans

**Thesis.** Most products have static permissions. Livia has an *earned trust staircase* the Owner can see. Owners *watch Liv grow up* over months — Rung 1 → Rung 2 → Rung 3 → Rung 4 → Rung 5 — and explicitly promote her with one tap. Trust as theater, with real consequence. This makes "AI as colleague" believable in a way no permissions matrix can.

**Evidence.** The unit primitive of the trust system is *promotion*, not *configuration*. Owners do not want to fill out a permissions form for an AI; they want to gauge competence over time and grant authority incrementally — exactly as they do with human staff. The "promotion ceremony" is itself a dopamine moment that makes the relationship feel real.

**What it makes possible:**
- A literal staircase in the dashboard. "Liv is at Rung 2 (Active Concierge). She's earned the next rung — see what she's done."
- A promotion screen: "In the last 30 days, Liv handled 142 bookings, recovered 8 no-shows, refused 2 refunds you would have refused, and surfaced 1 issue you would have missed. Promote her to Rung 3 (Floor Manager)?"
- Per-rung explicit boundaries: "At Rung 3, Liv will refund up to €50 per case without asking. She'll keep asking on anything above."
- Demotion is one tap with no judgement: "Liv made a mistake. Move her back to Rung 2 while we figure out what went wrong." She narrates the demotion in her own voice.
- Per-vertical default rung curves (a medspa starts more cautiously than a barbershop).

**What we have to build.** Rung definition and per-rung policy boundaries (refund caps, hire/fire authority, comms autonomy, etc.). Promotion ceremony UX. Per-cell rung tracking. The "Liv's resume" page — what she's done that earned each rung.

**Who would have to copy.** Any AI-native competitor. Cost: design + ML + change management + the discipline to refuse the "settings panel" pattern.

**Moat duration.** 12 months to copy. Defensible through first-mover branding — once owners associate the staircase with Liv, copies feel derivative.

**Failure mode.** Owners ignore the staircase or feel coerced into promoting. Mitigation: never push for promotion; the surface is opt-in. Liv works perfectly fine at her current rung.

**Kill criteria.** If 6 months in, < 30% of design-partner Owners have promoted Liv past Rung 2, the ratchet UX has failed. Re-design.

**Build wave.** **v1.5 (3-6 mo post-launch).** Earlier reflection had this at v1; honest reading is that the staircase is meaningless until the first cohort has lived with Liv long enough to feel a promotion is earned. v1 ships the rung concept conceptually (Liv operates at her assigned rung) without the explicit promotion UI.

---

## Bet 4 — The audit log is Liv's diary, not a table

**Thesis.** Owners don't read CSV rows. They read *Liv's account of her day in her own voice*. The audit trail is reframed from compliance artefact to colleague's diary. Compliance through narrative.

**Evidence.** Salon owners reading existing audit logs (Phorest, Fresha) describe the experience as "checking the books" — chore, not engagement. Reading a colleague's daily summary is something humans *want* to do (cf. Stripe's daily transaction summary email, Linear's cycle reports, Slack's weekly digest). The format change reframes the activity.

**What it makes possible:**
- "Yesterday I handled 23 bookings, recovered 4 no-shows, refused one refund (Mary McNamara, €120 — she'd already had 3 this month, I asked you on Slack at 6pm and you said no). Today I expect a busy 4pm because two regulars usually book then. I've already prepped Niamh's chair."
- Drill-down: tap any line for the underlying CSV-grade detail (compliance and inspector-friendly).
- Searchable diary across months: *"What did Liv do for Sarah Brown?"* → narrative thread of every interaction.
- Auditor mode (toggle): the same data in classical CSV/PDF form for inspections.

**What we have to build.** Action narrator (templated in Liv's voice, parameterised). Per-action diary entry generation. Diary timeline UI with Liv's typography and tone. Underlying audit table preserved for compliance (just re-rendered).

**Who would have to copy.** Any AI-native competitor. Cost: writing tone + UX + accepting that the audit format becomes a brand surface, not just a table.

**Moat duration.** 12 months. Brand-anchored.

**Failure mode.** Auditors or accountants reject narrative form. Mitigation: classical mode is one tap away.

**Kill criteria.** If owners turn the diary view off in favour of the table within 30 days of onboarding, the format has failed.

**Build wave.** **v1.5 (3-6 mo post-launch).** v1 ships a clean classical audit log; v1.5 reframes the same data through Liv's voice. Reframing requires the voice (Bet 1) to have stabilised under real load, which doesn't happen until the first cohort.

---

## Bet 5 — "Liv was wrong" is a designed product surface

**Thesis.** Mistakes are inevitable. Most AI products treat them as exceptions to handle. Livia treats them as *moments of relationship-building* — Liv says she was wrong, in her own voice, with what she did to fix it. Owners screenshot these moments and share them. **That is the marketing.**

**Evidence.** The single most common "AI-as-colleague-fails" story in the wild is Microsoft's Tay (apologetic deletion) and Google's Bard launch ($100B market cap loss after one wrong answer). The opposite case — Anthropic's Claude apologising in plain language — generates positive social-media coverage every week. The handling of mistakes signals more about character than the absence of mistakes.

**What it makes possible:**
- "I rebooked Sarah for Wednesday but she meant Tuesday. I've reached out, comp'd a deposit, and added a note to my own playbook. I'm sorry." (Sent as in-app card; copyable; shareable.)
- Owner share moment: a post on r/salonowners with a screenshot — *"This AI just apologised better than my last front-desk hire."*
- Auto-rollback class (Liv reverses the action) vs Human-approved class (Liv proposes the fix; owner ratifies).
- The "Liv's sorry" log becomes its own page — every mistake she's made and what she did to fix it. Trust through transparency.
- Insurance posture: a financial cap per mistake, paid by Livia, no questions asked.

**What we have to build.** Mistake detection (eval failure, rollback signal, customer complaint trigger). Apology language generator (in voice, parameterised). Auto-rollback engine for the safe class. Insurance-cap workflow. The "Liv's sorry" page.

**Who would have to copy.** Anyone. Cost: design + ML + insurance posture + the *willingness* to make mistakes visible.

**Moat duration.** 18+ months. Most competitors cannot make their AI's mistakes visible — it would shatter their marketing.

**Failure mode.** Mistakes don't get auto-detected fast enough; owners feel Liv is hiding errors. Mitigation: aggressive eval framework + proactive escalation on uncertainty.

**Kill criteria.** If, after 6 months, the rate of customer complaints about Liv exceeds 1% of interactions, the apology surface is insufficient — fix Liv first, re-evaluate the surface.

**Build wave.** **v1.5 (basic — Liv writes apologies; humans review) / v2 (auto-rollback class expanded).** v1 handles mistakes through the standard exception path until the cohort has data on what classes of mistake actually occur.

---

## Bet 6 — Customers love Liv (consumer-side brand pull, the Liv Mark)

**Thesis.** The first appointment-software with consumer-side brand recognition. Customers WhatsApp Liv. They prefer her to a human receptionist for routine things. They ask their salons "do you use Liv?" — *reverse pull*. Combined with the **Liv Mark** (a public certification customers see on the booking page indicating "this salon meets Liv's quality bars"), this becomes a category seal.

**Evidence.** Stripe became "Powered by Stripe" — a quality signal customers learned to recognise. Shopify storefronts compete partly on "Shopify-quality" signal. No incumbent in salon software has consumer-side brand recognition; the customer experience is "salon-branded" with the platform invisible. There is a slot.

**What it makes possible:**
- Public booking page: *"Powered by Liv."* Subtle, tasteful, branded.
- Liv-certified salon badge: salons hitting quality bars (response time, no-show rate, NPS) earn a public mark customers learn to trust.
- Customer-side WhatsApp: *"Hi Liv, can I move my Tuesday at Aurora Studio?"* — Liv knows the customer across all Liv-certified salons they've been to (with explicit consent at first interaction).
- Customers ask salons: *"Do you use Liv?"* When the answer is no, they push the salon to switch. (This is the wedge.)
- A customer-facing site (`liv.io/find`) where customers discover Liv-certified salons in their area. **Carefully scoped** — not a marketplace; a quality directory.

**What we have to build.** Public Liv Mark visual identity. Certification quality bars (response-time SLA, NPS threshold, etc.). Salon-side opt-in for the mark. Customer-side cross-tenant identity (with explicit consent at first interaction). The customer-facing discovery site (small, not a marketplace).

**Who would have to copy.** Anyone with consumer-facing reach. Cost: build the brand from zero + invest in customer-side marketing for years before it pays.

**Moat duration.** 36+ months once established. Brand-driven moats compound.

**Failure mode.** Customers don't notice the mark; salons see no value in displaying it. Mitigation: the mark is opt-in for salons; we don't push it on day one. We earn the mark's value over years before requiring it.

**Kill criteria.** If, after 18 months post-launch, < 10% of customer-side interactions reference Liv by name unprompted, the consumer brand isn't taking. Pivot to v3 instead.

**Build wave.** **v2 (6-12 mo).** Need the salon base first.

---

## Bet 7 — The salon's brain (institutional memory + migration broker)

**Thesis.** Over months Liv becomes the salon's institutional memory. Who books with whom. Who tips well. Who's drifting. What days are busy. What the brand voice should be on Instagram. **An owner who fires Liv loses the brain.** Lock-in earned, not coercive.

The migration story reverses too: Liv is the *migration broker*. She calls Phorest's API on the salon's behalf, imports their last 3 years, and *narrates the import*. Migration becomes the first delight moment.

**Evidence.** Notion's lock-in is the *content* users have created; switching means losing the second brain. Same for Roam, Obsidian, Linear. Salons currently lock in to Phorest/Fresha through *switching cost*, which is coercive. Earned lock-in (the brain *worth keeping*) is more durable and more ethical.

**What it makes possible:**
- Day 1 of the migration: *"I've imported your last 3 years of bookings from Phorest. You have 47 regulars who haven't been back in 90 days. Want me to draft re-engagement messages over the next two weeks?"*
- Month 6: Liv knows that Mary always books with Niamh, that Tom tips 25% on a Friday, that the 4pm slot fills on Tuesdays via walk-ins not pre-bookings. She uses this in the briefing without being asked.
- Month 12: *"Your brand voice on Instagram has been more clinical than the in-person experience. I've drafted 5 captions in the in-person tone — review when you have a sec."*
- Departure clause (ethical lock-in): if the Owner ever wants to leave, Liv exports the brain in standard formats, narrated, and offers to draft introduction emails to the new platform.

**What we have to build.** Phorest/Fresha import wizard (API where available, browser-automated where not). Per-tenant memory layer (vector store + structured knowledge). Brand-voice learning. Re-engagement message generator. Brain export utility (the ethical exit).

**Who would have to copy.** Phorest and Fresha could build this for their *own* product, but they cannot offer the *migration* part — they would be migrating customers *out*. The asymmetry is structural.

**Moat duration.** 24+ months for memory depth; the migration broker is permanent (asymmetric).

**Failure mode.** Memory accumulates noise faster than signal; brain becomes useless. Mitigation: aggressive forgetting + per-fact provenance + owner-visible memory inspection.

**Kill criteria.** Measured at month 6 with the design-partner cohort: NPS sub-score for the memory feature, asked as a standalone question. If sub-score is below 0 (more detractors than promoters) OR if more than 1 in 10 owners volunteer the word "creepy"/"intrusive"/"surveillance" in unprompted feedback, redesign the privacy boundary before scaling.

**Build wave.** **v1 (migration broker) / v2 (mature brain).** The migration broker is the deepest delight moment at launch.

---

## Bet 8 — Cross-tenant intelligence with an explicit privacy line

**Thesis.** Network effects in a category that has none. Liv knows what's typical for *salons like yours* — your vertical, your size, your geography — and uses that intelligence to make better recommendations *to* you, never *about* you to anyone else.

**Evidence.** Phorest is sitting on 10 years of multi-tenant data and does almost nothing with it because their architecture isn't AI-native and their customer-comms posture is conservative. The intelligence is there for the taking — for an AI-native competitor that handles the privacy line credibly.

**What it makes possible:**
- *"Salons like yours typically book 12 deposits at 7pm Sundays — pre-empt with deposit collection?"*
- *"Stylists with your service mix typically charge €X per cut; you're at €Y. Want me to draft a price-review note?"*
- *"Bank-holiday Mondays in your vertical see no-shows spike 40%. I've added a deposit to all bookings on the next two — you can override."*
- Annual benchmark report (vertical + region) — never identifying any single salon.

**What we have to build.** Cross-tenant aggregation pipeline (k-anonymity, k≥10 minimum, never per-row exposure). **Explicit owner opt-IN** (no default opt-in — the Owner must affirmatively enable benchmarking after reading the privacy line; this is a non-negotiable GDPR posture, not a UX choice). The privacy line: a public document the Owner reads on day 1 explaining exactly what is shared and what is not. Independent third-party audit of the aggregation before public launch. **No cross-tenant *customer* identity without that customer's explicit consent at the point of first interaction with each new salon** — a customer being known to Liv at Aurora Studio does not, ever, allow another Liv-using salon to learn anything about that customer until the customer explicitly opts in there too.

**Who would have to copy.** AI-native competitors. Cost: legal + data engineering + the willingness to be transparent. Phorest could try but would have to retrofit their architecture *and* their customer relationships.

**Moat duration.** 24+ months. Compounds with scale (more tenants = better benchmarks).

**Failure mode.** A tenant's data leaks (or appears to) into another tenant's surface. Mitigation: aggressive aggregation discipline + per-row privacy review + owner-visible benchmarking inspection.

**Kill criteria.** Any single privacy incident kills this bet for 12 months. We re-build under closer scrutiny.

**Build wave.** **v3 (12-24 mo).** Need scale + trust first. Premature would be net-negative.

---

## Bet 9 — Configuration-and-vertical native simultaneously

**Thesis.** The only product whose data model and workflows natively understand chair-rental, franchise, multi-brand, partnership, AND the vertical-specific rituals (medspa consent, tattoo design proof, physio progress notes, fitness class capacity, pet vaccination check) without forcing them into one canonical shape. **The under-served owners come to Livia because no one else fits them.**

**Evidence.** Phorest assumes single-shop-with-mgr; Fresha assumes solo-and-marketplace; Mindbody assumes fitness-vertical depth; Pabau assumes medspa; Cliniko assumes physio. No competitor handles >2 of these well. The chair-rental barbershop chain owner, the multi-brand portfolio Founder, and the medspa franchisee are all currently writing scripts in Excel because no incumbent fits.

**What it makes possible:**
- Chair-rental Liv: *"Your Saturday chair-rent invoice is ready for 4 stylists. Auto-deduct at end of day or send for review?"*
- Multi-brand Liv: knows that Aurora Studio's customer Mary is also a customer at Aurora Mews — surfaces this *only* when both brands' Owners have opted in.
- Medspa Liv: *"Mary's first botox booking. I've sent her the consent form and the contraindication checklist. She'll need to confirm before her appointment."*
- Tattoo Liv: *"Tom's design proof is overdue — booking is in 7 days. I've nudged him with the proof link. Want me to escalate?"*
- Fitness Liv: handles class capacity, waitlist promotion, package consumption — *not* one-on-one appointment depth.

**What we have to build.** Polymorphic data model where appointment shape, consumable, consent, post-visit need are all configurable per vertical. Workflow library per vertical (forks shared base). Per-configuration financial model (chair-rental rent, franchise royalty, partnership profit-distribution).

**Who would have to copy.** Anyone. Cost: refactor data model + hire vertical specialists + accept multi-config product complexity.

**Moat duration.** 24+ months for any competitor with a single-shape data model. Compounds because every cell we serve well grows our defensibility.

**Failure mode.** Trying to be everything to everyone dilutes depth. Mitigation: explicit v1 / v2 / v3 vertical commitments (heartland Hair+Beauty first; never Dental/Mental Health without partners).

**Kill criteria.** Measured at each vertical-launch checkpoint (v1 +12mo, v1 +24mo): time-to-market per new vertical must stay under **9 months from spec to first paying customer**. If two consecutive verticals exceed 9 months, freeze new-vertical work and consolidate the existing footprint until cycle time recovers.

**Build wave.** **v1 (Hair + Beauty heartland only — single-shop and solo configurations); v1.5 (chair-rental + partnership + multi-shop chain); v2 (Wellness, Body art, Fitness); v3 (Medspa, Allied health with partnerships).** Earlier draft had chair-rental and partnership in v1; honest scoping pushes them to v1.5.

---

## Bet 10 — EU-anchored sovereignty as worldview, with outcome-based pricing as proof

**Thesis.** Not "GDPR-compliant" as a footer line — **EU-anchored as a worldview.** Irish cultural surface (Liv speaks Gaeilge symbolically). EU data residency by design. AI-Act-compliant with auditable AI reasoning. Customer-protection-aware. Employment-law-aware. Outcome-based pricing where applicable ("Liv keeps 5% of recovered no-show revenue"). **Posture as moat** — strengthens as EU regulation tightens against US-led platforms.

**Evidence.** EU AI Act enforcement begins in earnest in 2026-2027. EU Digital Services Act and Digital Markets Act are reshaping competitive dynamics. US-led incumbents (Square, Mindbody, Booksy) face structural disadvantages. Irish regulator (DPC) is the de-facto enforcer for EU GDPR; being Irish-anchored is a *visibility* advantage with regulators and a *trust* advantage with EU SMBs already wary of US data-handling practices.

**What it makes possible:**
- Public booking page: *"Cuir in áirithe / Book."* Tasteful Gaeilge surface as cultural anchor.
- Auditable AI reasoning: any owner can ask "why did Liv do X?" and get a real answer with the inputs Liv considered. EU AI Act compliance becomes a *feature*.
- Outcome-based pricing tier: small base + 5% of recovered no-show revenue. Liv literally pays for herself out of money she makes you. Sales conversation shifts from "is this worth €X" to "Liv made you €Y last month and we kept €Z."
- "Powered in Ireland, hosted in the EU" badge — quality signal to EU buyers.
- Employment-law-aware Liv: refuses to schedule Junior STAFF beyond legal break thresholds; nudges on minimum-wage shortfalls; understands the Working Time Act.

**What we have to build.** EU-only data residency (no US fallback). AI reasoning explainability layer (for every action, the inputs considered are loggable and surfaceable). Outcome-based pricing infra (revenue attribution, monthly settlement). Employment-law rule library (per-jurisdiction). Multi-language support with per-locale Liv voice.

**Who would have to copy.** US-led incumbents cannot match without restructuring. UK-headquartered (Phorest, Treatwell) could match technically but would dilute their marketing posture.

**Moat duration.** Indefinite for US incumbents. 12-18 months for UK competitors who try.

**Failure mode.** Outcome-based pricing creates revenue volatility for us. Mitigation: hybrid base + outcome model; outcome share is bonus, not core revenue.

**Kill criteria.** If outcome-based pricing causes >30% revenue volatility quarter-over-quarter, retire it as a default and offer as alternative tier only.

**Build wave.** **v1 (EU residency, GDPR posture, mandatory AI disclosure) / v2 (AI reasoning explainability subsystem + outcome-based pricing tier) / v3 (full multi-jurisdiction employment law) / Aspirational (full EU-wide expansion).** AI explainability moved from v1 to v2 — it is a real subsystem, not a footer line, and bundling it into v1 would dilute the voice wedge.

---

## Plus three delight bets that compound the worldview

### Delight 1 — End-of-year Wrapped

Like Spotify Wrapped. *"Aurora Studio in 2026: 3,247 bookings. Busiest day June 14. Most-loved stylist Niamh (47 regular requests). Mary McNamara visited 14 times — your most loyal regular. Liv handled 2,180 conversations on your behalf and saved you ~340 hours."* Owners share publicly. **Free annual marketing moment.** Build cost: low. Cultural impact: very high.

### Delight 2 — Liv at the Christmas party

Tiny touches. Liv's signed seasonal email. A one-line acknowledgement in the daily briefing on bank holidays. A thank-you to a 5-year-loyal regular on her anniversary. *"It's been 5 years since Mary's first visit. I sent her a small note in your tone."* Trivial to engineer; transforms how people relate to the product. **Build cost: trivial. Identity impact: profound.**

### Delight 3 — Crisis-playbook-as-character

When something terrible happens (staff walks out, burst pipe, social-media dogpile), Liv shows up *in character* with a plan. *"Mary, this is bad but we've handled worse. Here's what I'm going to do for the next four hours. You take a breath."* Crisis management is product, not service. **The moment that turns a customer into an evangelist.**

---

## The bet portfolio — what ships when

Weight each bet by **impact** × **confidence** × **cost**. Commit to a release cadence that keeps the vision visible from launch and proves bets in waves.

### v1 — Launch (credibility-first; three wedges, not eight)

The honest constraint: a small EU startup cannot ship character-grade voice, trust-ratchet UX, narrative audit logs, mistake-handling, migration import, polymorphic vertical model, *and* AI explainability all at once with quality. Trying produces a thin demo of eight bets instead of a real shipment of three. We commit to **three wedges as v1, with everything else explicitly deferred**:

- **Bet 1 (Character)** — the connective tissue. Surface-light at v1: the named voice across briefing, audit log, email signatures, and the voice line. No deep persona work yet beyond the bible.
- **Bet 2 (Voice with character)** — the wedge proof point, narrowed: **single vertical (Hair + Beauty), single locale (English-IE), single configuration shape (single-shop with mgr or solo).** This is one company-bet shipped well, not five shipped thinly.
- **Bet 7 (Migration broker subset)** — Phorest import wizard, narrated by Liv. The first delight moment.

Plus the *baseline* (table stakes, not wedges) without which we cannot ship at all:

- **Bet 9 baseline** — Hair + Beauty heartland only at v1. Chair-rental and partnership configs deferred to v1.5.
- **Bet 10 baseline** — EU residency + GDPR posture. AI reasoning explainability deferred to v2 (it's a non-trivial subsystem, not a footer line).

### v1.5 — 3-6 months post-launch

Bets we deferred from v1 because they were not strictly needed to prove the wedge, but are needed to defend "the colleague" identity at scale:

- **Bet 3 (Trust ratchet visible)** — Rungs 1-3 implemented; Rungs 4-5 defined but not unlocked. We initially shipped this as v1; honest reflection is that the staircase is meaningless until owners have lived with Liv for ~3 months. Ship at v1.5 once the first cohort has data.
- **Bet 4 (Audit-as-diary)** — narrative format. v1 ships a clean classical log; v1.5 reframes it.
- **Bet 5 ("Liv was wrong" surface)** — basic version (Liv writes apologies; humans review; auto-rollback for safe class).
- **Bet 9 expansion** — chair-rental + partnership configurations.

### v2 — 6-12 months post-launch

The bets that scale the wedge once the cohort exists:

- **Bet 6 (Customer-side brand pull / Liv Mark)** — needs the salon base first.
- **Bet 7 (Salon's brain at maturity)** — memory has accumulated by now.
- **Bet 5 (Auto-rollback class expanded)**.
- **Bet 9 (verticals expand)** — Wellness, Body art, Fitness.
- **Bet 10 (AI reasoning explainability + Outcome-based pricing tier)** — alternative tier for confident buyers.
- **Voice expansion** — UK English, Polish, Gaeilge symbolic.

### v3 — 12-24 months

The bets that make Livia inevitable:

- **Bet 8 (Cross-tenant intelligence)** — needs scale + trust.
- **Bet 9 (verticals expand)** — Medspa, Allied health with partnerships.
- **Delight 1 (End-of-year Wrapped)** — first annual cycle.
- **Bet 10 (full multi-jurisdiction employment law)** — UK, Nordics.
- **Customer-facing discovery site (liv.io/find)** — Liv-certified salons.

### Aspirational — 24+ months

- **Outcome-based pricing as default** for new tier.
- **Full EU expansion** — DACH, France, Iberia, Nordics.
- **The Liv Mark as category seal** — customers preferentially book Liv-certified salons.

---

## How the portfolio attracts interest before it ships

The user's instinct is correct: **the vision must be visible before the product is complete.** The mechanism:

1. **Manifesto published first.** `livia.io` opens with the manifesto (separate doc). Waitlist signups follow the manifesto, not the feature list.
2. **Bet showcase per release.** Each release proves one bet publicly — a Loom, a screenshot, a customer quote. The bet is the news, not the feature.
3. **Design partners as evangelists.** The 10 Dublin design partners aren't testers; they're proof of the colleague-not-tool relationship. Their language ("we have Liv") becomes our marketing language.
4. **Reverse pull.** As Bet 6 matures, customers ask their salons for Liv. The salon doesn't choose Livia; the customer does.

**The bet portfolio is the product roadmap.** Engineering planning (F8) reads from this list. Pricing (F9) reads from Bet 10. Hiring (F10) reads from the team-to-hire columns above. Everything downstream defends these bets.
