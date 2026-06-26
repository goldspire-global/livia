import { businessVerticalSchema, type BusinessVertical } from "@workspace/policy";

const STORAGE_KEY = "livia.onboarding.verticalIntent";

export function readOnboardingVerticalIntent(): BusinessVertical | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("vertical")?.trim().toLowerCase();
  if (fromUrl) {
    const parsed = businessVerticalSchema.safeParse(fromUrl);
    if (parsed.success) return parsed.data;
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)?.trim().toLowerCase();
    if (!raw) return null;
    const parsed = businessVerticalSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function writeOnboardingVerticalIntent(vertical: BusinessVertical): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, vertical);
  } catch {
    /* ignore */
  }
}

export function captureOnboardingVerticalFromUrl(): BusinessVertical | null {
  const vertical = readOnboardingVerticalIntent();
  if (!vertical) return null;
  writeOnboardingVerticalIntent(vertical);
  return vertical;
}
