# Event Taxonomy

**Status:** canonical Volume H (2026-06-05)  
**Audience:** engineering, product, Cursor, analytics, future marketplace  
**Priority:** Critical — events are the nervous system of the People Business OS  
**Repo hubs:** `lib/event-bus`, `artifacts/api-server/src/lib/domain-events.ts`, `events` DB table

---

## Executive finding

| Layer | Role |
|-------|------|
| Capability Graph | Skeleton |
| Business Twin | Brain |
| Liv | Intelligence layer |
| **Events** | **Nervous system** |

Without events: nothing understands anything. The Twin cannot observe. Liv cannot reason well. Analytics cannot explain. The marketplace cannot react. The platform is blind.

---

## Core philosophy

Every **meaningful business change** becomes an event.

Not every database update. Not every API call. Not every UI interaction.

| Bad | Good |
|-----|------|
| `ButtonClicked` | `BookingCreated` |
| `InputChanged` | `CustomerUpdated` |

Events describe **business reality**, not application mechanics.

---

## Definition

An event is a record of a meaningful change within the platform.

**Properties:** immutable, timestamped, traceable, observable.

Events are **never** edited, rewritten, or reused.

---

## Core rule

```text
Everything important emits an event.
Everything intelligent consumes events.
```

**Future flow:**

```text
Business Action → Event → Twin → Liv → Experience
```

---

## Event structure (mandatory)

```yaml
event_id: uuid
event_name: BookingCreated      # Past tense
event_version: 1
timestamp: ISO-8601
business_id: string
actor_id: string | null
entity_id: string
entity_type: booking | customer | ...
source: api | automation | liv | user | system | integration
payload: object                 # versioned schema
metadata: object
correlation_id: string | null   # future
causation_id: string | null     # future
```

---

## Naming convention

**Past tense only.**

| Correct | Forbidden |
|---------|-----------|
| `BookingCreated` | `CreateBooking` |
| `PaymentCaptured` | `BookingAction` |
| `ReviewReceived` | `review_event` |

Typed domain events in repo use dot notation: `booking.created`, `conversation.updated` — map to PascalCase in analytics exports.

---

## Event categories

### 1. Business events

`BusinessCreated`, `BusinessActivated`, `BusinessSuspended`, `BusinessArchived`, `BusinessVerified`, `BusinessUpdated`

### 2. People events

`StaffCreated`, `StaffUpdated`, `StaffArchived`, `StaffAssigned`, `StaffAvailabilityUpdated`  
`CustomerCreated`, `CustomerUpdated`, `CustomerArchived`, `CustomerMerged`  
`RelationshipCreated`, `RelationshipStrengthened`, `RelationshipAtRisk`, `RelationshipRecovered`

### 3. Scheduling events

`BookingCreated`, `BookingRequested`, `BookingConfirmed`, `BookingRescheduled`, `BookingCancelled`, `BookingCheckedIn`, `BookingCompleted`, `BookingMarkedNoShow`  
`AvailabilityCreated`, `AvailabilityUpdated`, `AvailabilityBlocked`, `AvailabilityReleased`  
`WaitlistJoined`, `WaitlistConverted`

### 4. Communication events

`ConversationCreated`, `ConversationArchived`, `MessageSent`, `MessageDelivered`, `MessageRead`, `MessageReceived`  
`CampaignCreated`, `CampaignSent`, `CampaignCompleted`  
`FollowUpRequested`, `FollowUpCompleted`

### 5. Commerce events

`PaymentIntentCreated`, `DepositRequested`, `DepositPaid`, `DepositRefunded`, `PaymentCaptured`, `PaymentFailed`, `PaymentRefunded`  
`InvoiceCreated`, `InvoicePaid`, `InvoiceCancelled`  
`SubscriptionCreated`, `SubscriptionRenewed`, `SubscriptionCancelled`

### 6. Trust events

`ReviewRequested`, `ReviewReceived`, `ReviewResponded`, `ReviewFlagged`  
`VerificationSubmitted`, `VerificationApproved`, `VerificationRejected`  
`CertificationAdded`, `CertificationExpired`, `TrustScoreUpdated`

### 7. Capability events

`CapabilityInstalled`, `CapabilityConfigured`, `CapabilityActivated`, `CapabilitySuspended`, `CapabilityRemoved`, `CapabilityHealthChanged`, `CapabilityRecommendationGenerated`

### 8. Experience events

`PresentationPackApplied`, `PresentationPackChanged`, `ExperienceResolved`, `RoleExperienceChanged`

### 9. Twin events (understanding outputs)

`SignalGenerated`, `ObservationGenerated`, `InsightGenerated`, `RecommendationGenerated`, `RiskDetected`, `OpportunityDetected`

### 10. Liv events

`LivRecommendationShown`, `LivRecommendationAccepted`, `LivRecommendationDismissed`, `LivActionExecuted`, `LivActionRejected`, `LivEscalationTriggered`

---

## Event ownership

Every event has exactly one domain owner. No shared ownership.

| Domain | Owns |
|--------|------|
| Bookings | Scheduling events |
| Trust layer | Trust events |
| Commerce layer | Commerce events |
| Twin layer | Twin events |
| Liv runtime | Liv events |
| Capability Graph | Capability events |

---

## Consumption rules

| Consumer | Consumes |
|----------|----------|
| **Business Twin** | Almost all business-reality events |
| **Liv** | Primarily Twin outputs + selective business events |
| **Analytics** | Business, commerce, trust events |
| **Automation** | Trigger events |
| **Marketplace** | Capability + Twin events |

### Twin vs Liv

| Twin consumes | Twin ignores |
|---------------|--------------|
| `BookingCompleted` | `ButtonClicked` |
| `ReviewReceived` | `PageViewed` |

**Bad:** Liv reading thousands of raw booking events.  
**Good:** Twin identifies declining bookings → Liv communicates insight.

---

## Importance levels

| Level | Example |
|-------|---------|
| **Critical** | `PaymentCaptured` |
| **High** | `BookingCancelled` |
| **Medium** | `MessageRead` |
| **Low** | `PresentationPackChanged` |

---

## Repo status (2026-06-05)

### System A — Typed domain events (`lib/event-bus`)

- Zod-validated registry: `booking.*`, `conversation.*`, `voice.*`, `refund.*`, `time-off.*`, `audit.event.recorded`  
- `publishDomainEvent()` → Inngest, webhooks, Liv reactions, push  
- **~15 event types** — growing but incomplete vs taxonomy

### System B — Flat events table

- `EventType` literals in `lib/db/src/schema/events/events.ts`  
- `logEvent()` / `events.service.ts` — audit/analytics  
- **30+ types** — not all mapped to domain bus

### Gap: dual systems

Many lifecycle actions hit `logEvent()` only, not `publishDomainEvent()`. Taxonomy catalog is larger than either implementation.

**Remediation (Era 1 Q3):**

1. Single `EVENT_CATALOG` in policy — canonical names + versions + owners  
2. Bridge: every `logEvent` type maps to domain event or is marked analytics-only  
3. CI: new business mutations must register event in catalog  
4. Deprecate ambiguous `EventType` literals over time  

---

## Event retention

Events are strategic assets. Retain for Twin recomputation and future intelligence evolution.

---

## Anti-patterns (forbidden)

- UI events as business events  
- Database triggers as substitute for domain events  
- Duplicate events for same change  
- Ambiguous names  
- Events without owners  
- Events without consumers  

---

## Final rule

If a meaningful business change occurs and no event exists: **the platform is blind. Create the event.**

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-05 | Volume H canonical — dual-system gap + remediation plan |
