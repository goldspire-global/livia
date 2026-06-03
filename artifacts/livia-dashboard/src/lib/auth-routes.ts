/** Clerk redirect after leaving a tenant session — must not bounce to /demo launcher. */
export const SIGN_IN_AFTER_SIGN_OUT = "/sign-in?signed_out=1";

export function isSignedOutLanding(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("signed_out") === "1";
}
