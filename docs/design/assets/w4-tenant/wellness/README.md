# wellness — W4/W5 presentation mocks

**Four presets per vertical** (policy + picker):

| cssPreset | Role | Product surfaces shown |
|-----------|------|-------------------------|
| `platform-default` | **Sign-up skin** — Constellation ink, champagne Liv, starfield | Owner briefing + schedule · ops inbox · guest `/b` |
| `harbour-light` | **Vertical default** — Atrium top nav | 3-column room swimlanes · concierge tiles · 2×2 treatment grid `/b` |
| `session-rail` | Practitioner POV — icon rail | Dominant timeline · channel-stripe inbox · week + slot grid `/b` |
| `evening-ledger` | Retreat evening — segmented nav | Gold ledger table · full-width guest panels · ritual wizard `/b` |

Built wellness capabilities reflected: rooms, therapists, vouchers, `/b`, visit (W5 extra), day-packages (deferred link on harbour Today).

**Deprecated (do not use):** `spa-calm`, `zen-light`, `retreat-dark` sample folders — superseded by harbour-light / session-rail / evening-ledger. Safe to delete after visual audit confirms no references.

**Inspiration & smoke:** [`WELLNESS-VERTICAL-INSPIRATION.md`](../../../product/WELLNESS-VERTICAL-INSPIRATION.md) · [`WELLNESS-FOUNDER-SMOKE.md`](../../../operations/WELLNESS-FOUNDER-SMOKE.md) · announcement hub [`VERTICAL-ANNOUNCEMENT.md`](../../../engineering/VERTICAL-ANNOUNCEMENT.md).

## Regenerate

```bash
python scripts/generate-wellness-wedge-mocks.py
```

2× supersample downscale · PIL only · no AI screenshots.

Policy ids: `wellness-harbour-light` (default), `wellness-session-rail`, `wellness-evening-ledger`, + shared `platform-default`.

Review `.sample.png` → `.target.png` → unlock wedge in `MARKETING_DEMO_WEDGE_UNLOCK_ORDER`.
