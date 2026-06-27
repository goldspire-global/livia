import {
  onboardingIntentFromTrack,
  onboardingTrackFromIntent,
  type MigrationIntent,
  type OnboardingTrack,
} from "@workspace/policy";

/** UX-only session flags — not auth boundaries. Prefer sessionStorage over URL query params. */
const MIGRATION_INTENT_KEY = "livia.onboarding.migrationIntent";
const FRESH_SESSION_KEY = "livia.onboarding.freshSession";

const LEGACY_URL_PARAMS = ["fresh", "track", "path"] as const;

export type OnboardingSessionIntent = {
  /** New-founder portal handoff (legal → onboarding). Cleared when a shop resumes or setup completes. */
  fresh?: boolean;
  secondShop?: boolean;
};

function stripLegacyOnboardingUrlParams(): void {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    let dirty = false;
    for (const key of LEGACY_URL_PARAMS) {
      if (!url.searchParams.has(key)) continue;
      url.searchParams.delete(key);
      dirty = true;
    }
    if (!dirty) return;
    const qs = url.searchParams.toString();
    window.history.replaceState({}, "", qs ? `${url.pathname}?${qs}` : url.pathname);
  } catch {
    /* ignore */
  }
}

/**
 * Consume legacy ?fresh= / ?track= / ?path= once (backward compat + OAuth redirects),
 * persist to sessionStorage, then remove from the address bar.
 */
export function bootstrapOnboardingSessionIntent(): OnboardingSessionIntent {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  let consumedLegacy = false;

  if (params.get("fresh") === "1") {
    writeOnboardingFreshSession();
    consumedLegacy = true;
  }
  if (params.get("path") === "1") {
    clearOnboardingMigrationIntent();
    consumedLegacy = true;
  }
  const fromTrack = onboardingIntentFromTrack(params.get("track"));
  if (fromTrack) {
    writeOnboardingMigrationIntent(fromTrack);
    consumedLegacy = true;
  }

  if (consumedLegacy) {
    stripLegacyOnboardingUrlParams();
  }

  return readOnboardingSessionIntent();
}

export function readOnboardingSessionIntent(): OnboardingSessionIntent {
  if (typeof window === "undefined") return {};
  const secondShop = new URLSearchParams(window.location.search).get("intent") === "second-shop";
  return {
    fresh: readOnboardingFreshSession(),
    secondShop,
  };
}

export function writeOnboardingFreshSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(FRESH_SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function readOnboardingFreshSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(FRESH_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearOnboardingFreshSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(FRESH_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function readOnboardingTrack(): OnboardingTrack | null {
  const stored = readOnboardingMigrationIntent();
  return stored ? onboardingTrackFromIntent(stored) : null;
}

export function readOnboardingMigrationIntent(): MigrationIntent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(MIGRATION_INTENT_KEY);
    if (raw === "fresh" || raw === "switching") return raw;
  } catch {
    /* ignore */
  }
  return null;
}

export function writeOnboardingMigrationIntent(intent: MigrationIntent): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(MIGRATION_INTENT_KEY, intent);
  } catch {
    /* ignore */
  }
}

export function clearOnboardingMigrationIntent(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(MIGRATION_INTENT_KEY);
  } catch {
    /* ignore */
  }
}

export function clearOnboardingSessionIntent(): void {
  clearOnboardingMigrationIntent();
  clearOnboardingFreshSession();
}

/** After start-path pick — stay on clean `/onboarding`; intent lives in sessionStorage. */
export function onboardingPathAfterTrackPick(intent: MigrationIntent): string {
  writeOnboardingMigrationIntent(intent);
  writeOnboardingFreshSession();
  return "/onboarding";
}
