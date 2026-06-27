# Chair hosting program

**Status:** v1 slice live · Host plan depth v1.5  
**Authority:** [`p2b-chair-rental-host.md`](../journeys/p2b-chair-rental-host.md) · policy `lib/policy/src/chair-hosting-program.ts`

## What it is (plain language)

Chair hosting in Livia is **two layers**, not one signup checkbox:

| Layer | What | When | Billing |
|-------|------|------|---------|
| **A — Advertise a chair** | Listing strip on public `/b/{slug}` + enquiry form → Settings inbox | Any hair/beauty/body-art owner on Solo or Studio | Included in base plan |
| **B — Host program** | `/host` floor: link renter tenants, rent status, occupancy — **no renter guest PII** | After you link one or more independent renters | **Host plan** (€99 + €19/renter/mo) — upgrade from Settings → Billing |

**Real life:** Most shops onboard to run bookings (Solo/Studio). A spare chair or recruiting renters comes **later**. Pure landlord hosts exist (Marcus, 6 chairs, 4 renters) but they still run a floor — they start on **Studio**, enable advertising, then upgrade to **Host** when linking renters.

**Not at signup:** `chair-host` is **not** in the self-serve “How you're set up” picker. It is a **plan upgrade**, like Chain — not an org shape.

## E2E flow (v1 honest)

```text
1. Sign up → Solo or Studio (hair/beauty/barber vertical)
2. Settings → Chair rental advertising → headline, rate, chairs → show on public book page
3. Stylist enquires on /b/{slug} → POST …/chair-hosting/enquire → host notification
4. Host contacts stylist offline; stylist creates own Livia account (Solo tenant)
5. Settings → Billing → upgrade to Host plan (or Billing → Host when ready)
6. /host → link renter by slug → host_renter_links row → firewall enforced
7. Renter keeps guests + revenue; host sees rent/occupancy only
```

## v1.5 depth (not all live)

- Automated rent reminders (`host-rent-collect`)
- Shared shop voice/WhatsApp routing to correct renter tenant
- Concierge-led renter onboarding at scale

See [`p2b-chair-rental-host.md`](../journeys/p2b-chair-rental-host.md) for the north-star journey.

## Policy hub

| Module | Role |
|--------|------|
| `chair-hosting-program.ts` | Listing shape, vertical eligibility, copy |
| `onboarding-tier-options.ts` | Self-serve tiers exclude `chair-host` |
| `notification-policy.ts` | `host.enquiry` deep link → `/host` or Settings |
| `host_renter_links` (DB) | Linked renter tenants after Host upgrade |

## Marketing ↔ product alignment

| Surface | Message |
|---------|---------|
| `/for/chair-rental` | Start on Studio; Host plan when you link renters |
| `/pricing` Host card | Upgrade path — not parallel signup tier |
| Onboarding | Solo / Studio / Multi-location only |
| Settings | “Chair rental advertising” for all eligible verticals |
| `/host` | Host plan only (`wedge-gate`) |

## Honest limits (v1)

- No automated renter onboarding from enquiry — host links slug manually
- No rent collection in enquiry flow — rent status on `/host` dashboard
- Eligible verticals: hair, beauty, body-art (`chairHostingEligibleVertical`)

## Cascade

| Touch | Also verify |
|-------|-------------|
| Public strip | `/b` guest surfaces |
| Host APIs | `chair-host` tier nav `/host` |
| Onboarding catalog | `onboardingCatalogTierIds()` — no chair-host |
| Billing | Host checkout from Settings |
