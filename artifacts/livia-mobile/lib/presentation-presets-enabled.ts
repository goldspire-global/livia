import { getApiBaseUrl } from "@/lib/api-base";

/** Mirrors web `presentationPresetsUiEnabled()` — staging/dev until prod promotion. */
export function presentationPresetsUiEnabled(): boolean {
  if (__DEV__) return true;
  if (process.env.EXPO_PUBLIC_PRESENTATION_PRESETS === "true") return true;
  try {
    const base = getApiBaseUrl();
    if (base.includes("staging")) return true;
  } catch {
    /* api base unset in some test contexts */
  }
  return false;
}
