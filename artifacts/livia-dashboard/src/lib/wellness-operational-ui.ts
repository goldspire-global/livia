import { cn } from "@/lib/utils";

/** Primary CTA on W4 operational pages (harbour / session-rail / evening-ledger). */
export function wellnessPrimaryButton(wellness?: boolean, extra?: string) {
  return cn(wellness && "wellness-btn-primary border-0 shadow-sm", extra);
}

export function wellnessOutlineButton(wellness?: boolean, extra?: string) {
  return cn(wellness && "wellness-btn-outline", extra);
}

export function wellnessAvatarRing(wellness?: boolean, extra?: string) {
  return cn(wellness && "wellness-avatar-ring", extra);
}

export function wellnessBookingStatusClass(
  wellness: boolean,
  status: string,
  fallback: string,
): string {
  if (!wellness) return fallback;
  if (status === "PENDING") return "wellness-status-pending";
  if (status === "CONFIRMED") return "wellness-status-confirmed";
  return fallback;
}

/** White list card — matches inbox / guests (not the beige operational panel). */
export function wellnessListPanel(wellness?: boolean, extra?: string) {
  return cn(wellness && "wellness-list-shell", extra);
}

/** @deprecated use wellnessListPanel — kept for imports */
export function wellnessPanel(wellness?: boolean, extra?: string) {
  return wellnessListPanel(wellness, extra);
}

export function wellnessListScroll(extra?: string) {
  return cn(
    "wellness-op-list-scroll divide-y divide-border/70 overscroll-contain",
    extra,
  );
}

export function wellnessRow(wellness?: boolean, attention?: boolean, extra?: string) {
  return cn(
    "flex items-center gap-3 p-3 transition-colors cursor-pointer",
    wellness ? "hover:bg-primary/6" : "hover:bg-muted/30",
    attention && wellness && "wellness-op-row--attention",
    extra,
  );
}
