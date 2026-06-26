# Chair hosting program

**Status:** v1 slice (advertise → enquire → host link)  
**Authority:** [`p2b-chair-rental-host.md`](../journeys/p2b-chair-rental-host.md) · policy `lib/policy/src/chair-hosting-program.ts`

## Intent

Studios advertise chair or booth rental on their public book page. Stylists enquire without booking flow confusion. Host reviews on **Host floor** (`/host`), then links an onboarded renter business (existing host ↔ renter model).

## Flow (E2E)

```text
Owner enables listing (headline, rate, chairs) on /host
  → Public /b/{slug} shows chair strip + enquire form
  → POST /public/b/:slug/chair-hosting/enquire
  → Enquiry row + in-app notification (host.enquiry)
  → Owner marks contacted → links renter via slug on /host (existing)
```

## Policy hub

| Module | Role |
|--------|------|
| `chair-hosting-program.ts` | Listing shape, vertical eligibility, copy |
| `notification-policy.ts` | `host.enquiry` deep link → `/host` |
| `host-renter-links` (DB) | Linked renter tenants after onboarding |

## Revenue (later)

- `chair-host` plan (€99 + €19/renter) already in billing
- Listing fee / featured chair on book page — Track C commercial

## Honest limits (v1)

- No automated renter onboarding from enquiry — host links slug manually
- No payment collection for rent in enquiry flow — use existing rent status on host dashboard
- Eligible verticals: hair, beauty, body-art (policy `chairHostingEligibleVertical`)

## Cascade

| Touch | Also verify |
|-------|-------------|
| Public strip | Mobile book parity when `/b` ships on mobile |
| Host APIs | `chair-host` tier nav `/host` |
| Marketing | `/for/chair-rental` narrative unchanged |
