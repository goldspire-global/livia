# Engagement exit program

**Authority:** `lib/policy/src/engagement-exit-program.ts` · `lib/policy/src/enquiry-decline-program.ts` · `lib/policy/src/pii-display-program.ts`

How Livia handles **operator decline**, **client pull-out**, and **stage exits** across verticals — with PII-safe studio surfaces and deposit automation.

## Real-life scenarios

| When | Who | What happens in Livia |
|------|-----|----------------------|
| New enquiry not a fit | Operator | Inbox → **Decline** → pick reason → templated email/WhatsApp with inline reason sentence → enquiry **Closed** |
| Quote sent, client ghosts | Operator | Quotes → **Mark lost** (no outbound) |
| Client declines on quote link | Client | Public `/e/:slug/q/:token` decline → quote **declined**, enquiry **lost**, studio in-app notification (ref only) |
| Client pulls out after accept / deposit | Operator or client | Quotes → **Client withdrew** → closes quote + enquiry, releases date hold; notification flags deposit for refund review |
| Deposit paid online | Client (Stripe) | Quote status → **booked**, enquiry → **booked**, event prep timeline seeds, in-app + push notification |
| Appointment cancelled | Client / operator | Booking verticals — existing `booking.cancelled` flows (see `booking-experience-copy`) |

## Decline reasons (event-vendors)

Operator picks a reason in the decline modal. Copy uses `{{reasonSentence}}` in the `decline_reply` template (Settings → Liv outbound).

| Reason ID | Label |
|-----------|--------|
| `calendar_full` | Calendar full |
| `scope_mismatch` | Outside our scope |
| `capacity` | Guest count / capacity |
| `budget` | Budget doesn't fit |
| `location` | Location / travel |
| `timing` | Lead time too short |
| `other` | Other |

## Client withdrew reasons

Recorded when operator marks withdrew on `/quotes` (audit context; optional in API body).

## PII display rules

| Surface | Rule |
|---------|------|
| Quote list (`/quotes`) | **Quote #REF** + event type/date — no client name |
| Quote detail header | Ref-first; bill-to name only in Bill-to panel |
| In-app notifications | Ref-only titles (`Quote #ABCDEF12 — deposit paid`) |
| Public quote page | `Your quote · {businessName}` — token URL, no name in path |

Policy: `studioQuoteListLabel`, `notificationQuoteRefLabel`, `publicQuoteDocumentTitle`.

## Event day (quotes)

Single **Event day** panel on `/quotes` after deposit secures the date — timed prep tasks from `buildEventPrepPlan`. Removed duplicate “event day sheet” + “event prep teaser” blocks.

## Deposit automation

1. Guest pays deposit on public quote link (Stripe webhook or dev sim).
2. `applyGuestQuoteDepositFromWebhook` credits milestone, sets quote `booked` when date secured.
3. Enquiry → `booked`, `onBookingSecured` seeds prep tasks.
4. `deliverInAppNotification` kind `quote.deposit_paid` + push to operators.

## Vertical applicability

| Vertical | Exit kinds |
|----------|------------|
| event-vendors | operator decline, mark lost, client declined quote, client withdrew |
| hair / beauty / wellness / medspa / pet-grooming | client_cancelled_booking, client_no_show, operator_mark_lost |
| body-art | operator_mark_lost, client_cancelled_booking |
| fitness | client_cancelled_booking, client_no_show |

Extend via `ENGAGEMENT_EXIT_VERTICALS` when adding verticals.

## API

| Route | Purpose |
|-------|---------|
| `GET …/decline-draft?reason=` | Preview decline with reason |
| `POST …/decline-with-liv` `{ reasonId }` | Send decline + close enquiry |
| `POST …/quotes/:id/client-withdrew` | Operator records client pull-out |
| `POST /public/:slug/q/:token/decline` | Guest declines quote |

## Surfaces cascade

| Change | Also verify |
|--------|-------------|
| Policy exit / decline | Dashboard inbox + quotes, mobile enquiries + quotes, API consult-first routes |
| PII list labels | Notification feed, public quote page title |
| Deposit webhook | E2E guest quote pay, demo atelier quote flow |
