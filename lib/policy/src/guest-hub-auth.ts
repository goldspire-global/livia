/**
 * Guest hub (W6) — identifier normalization for phone + email OTP.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type GuestHubAuthChannel = "phone" | "email";

export function normalizeGuestHubEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) return null;
  return email;
}

export function guestHubContactLabel(input: {
  phoneE164?: string | null;
  email?: string | null;
}): string {
  if (input.phoneE164?.trim()) return input.phoneE164.trim();
  if (input.email?.trim()) return input.email.trim();
  return "your account";
}

export const GUEST_HUB_WELCOME_SLIDES = [
  {
    title: "Your visits in one place",
    body: "Book at any Livia studio — when you sign in here, upcoming visits and history show up automatically.",
  },
  {
    title: "Rebook in a tap",
    body: "Heart a favourite studio, open session packs, and ask Liv to book again without hunting through texts.",
  },
  {
    title: "You're set",
    body: "No password to remember. Verify with your mobile or email — your profile is ready even before your first booking.",
  },
] as const;
