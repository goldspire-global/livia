# Maestro — mobile visual capture

Captures signed-in tenant screens for parity review with `e2e/visual-captures/web/`.

## Prerequisites

1. [Maestro CLI](https://maestro.mobile.dev/getting-started/installing-maestro) installed (`maestro -v`).
2. API + demo provisioned: `pnpm dev:api` and `POST /api/demo/provision` (or `pnpm e2e:prep`).
3. Expo app running on simulator/emulator or device:
   - iOS Simulator: `pnpm --filter livia-mobile run ios`
   - Android: `pnpm --filter livia-mobile run android`
4. Env (optional, for sign-in flow):
   - `MAESTRO_DEMO_EMAIL=demo-owner@livia.io`
   - `MAESTRO_DEMO_PASSWORD=LiviaDemo2026!`
   - `MAESTRO_APP_ID` — Android Expo Go: **`host.exp.exponent`** · iOS Expo Go: `host.exp.Exponent` · dev build: `io.livia.app` (script auto-picks Android Expo Go when `adb devices` shows an emulator)

## Run (Android Expo Go + emulator)

```powershell
# Terminals 1–2: API + Metro (port 8083)
pnpm dev:api
$env:Path += ";$env:LOCALAPPDATA\Android\Sdk\platform-tools"
adb reverse tcp:3000 tcp:3000
adb reverse tcp:8083 tcp:8083
pnpm dev:mobile

# Terminal 3: one flow while debugging
$env:MAESTRO_FLOWS = "capture-cold-open-gateway.yaml"
pnpm maestro:visual-capture
```

Output: `e2e/visual-captures/mobile/*.png`

### Windows / Expo Go notes

- **Do not use `launchApp`** in flows — Maestro defaults `stopApp: true` and flakes against Expo Go on Windows adb. Cold open uses `openLink: exp://127.0.0.1:8083` only.
- **`MAESTRO_APP_ID`**: script auto-sets `host.exp.exponent` when an Android device is connected. Do not set `host.exp.Exponent` (iOS casing).
- **Driver timeout**: set `MAESTRO_DRIVER_STARTUP_TIMEOUT=180000` if you see “Android driver did not start up in time”.
- **adb gRPC `UNAVAILABLE` / `tcp:… closed`**: close Maestro Studio, run `adb kill-server && adb start-server`, retry with `MAESTRO_ADB_RESET=1` or `MAESTRO_ATTEMPTS=3`. Ensure nothing else binds port **7001** (`netstat -ano | findstr 7001`).
- **Single flow**: `MAESTRO_FLOWS=capture-cold-open-gateway.yaml`

## Flows

| Flow | Persona / path |
|------|----------------|
| `capture-cold-open-gateway.yaml` | **First-run:** entry gateway → My Livia → sign-in → demo G1 → wedge → owner Today |
| `sign-in-demo.yaml` | Clerk email sign-in (skip if already signed in) |
| `capture-owner-tabs.yaml` | Owner: tabs + More (staff, services, premises, audit, new booking) |
| `capture-founder-more.yaml` | Founder: Glance, Today, Approvals, Inbox, rota, lifecycle, audit |
| `capture-founder-verticals.yaml` | Founder: open each EU vertical shop → Today screenshot |
| `capture-persona-manager.yaml` | Manager: queue, floor, clients, messages, time-off |
| `capture-persona-staff.yaml` | Staff: my chair, appointments, clients, time-off |
| `capture-persona-receptionist.yaml` | Reception: floor, clients, messages |

Full suite: `pnpm e2e:full-visual-audit` (web Playwright + these flows). See `docs/testing/FULL-VISUAL-AUDIT-WEB-MOBILE.md`.

## Dev shortcut (no Clerk)

On a dev build with `EXPO_PUBLIC_DEMO_LOGIN=true`, use **More → Switch persona** instead of `sign-in-demo.yaml` — run flows with `MAESTRO_SKIP_SIGN_IN=1`.
