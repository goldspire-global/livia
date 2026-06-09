import type { APIRequestContext } from "@playwright/test";
import { apiBase } from "./demo-auth";

export const DEMO_GUEST_PHONE = "+353 87 100 0001";

/** OTP → hub token for Mary demo guest. */
export async function guestHubToken(request: APIRequestContext): Promise<string> {
  const otpReq = await request.post(`${apiBase}/api/public/guest-hub/otp/request`, {
    data: { phone: DEMO_GUEST_PHONE, country: "IE" },
  });
  if (!otpReq.ok()) {
    throw new Error(`guest-hub otp/request: ${otpReq.status()} ${(await otpReq.text()).slice(0, 200)}`);
  }
  const { sessionToken, magicOtpCode, devOtp } = (await otpReq.json()) as {
    sessionToken: string;
    magicOtpCode?: string;
    devOtp?: string;
  };
  const code = devOtp ?? magicOtpCode ?? "000000";
  const verify = await request.post(`${apiBase}/api/public/guest-hub/otp/verify`, {
    data: { sessionToken, code },
  });
  if (!verify.ok()) {
    throw new Error(`guest-hub otp/verify: ${verify.status()} ${(await verify.text()).slice(0, 200)}`);
  }
  const { hubToken } = (await verify.json()) as { hubToken: string };
  if (!hubToken) throw new Error("guest-hub verify missing hubToken");
  return hubToken;
}

export async function guestHubMe(request: APIRequestContext, hubToken: string) {
  const me = await request.get(`${apiBase}/api/public/guest-hub/me`, {
    headers: { "X-Guest-Hub-Token": hubToken },
  });
  if (!me.ok()) {
    throw new Error(`guest-hub /me: ${me.status()} ${(await me.text()).slice(0, 200)}`);
  }
  return me.json() as Promise<{
    phoneE164: string;
    preferredModality?: string;
    shops: Array<{
      slug: string;
      bookUrl: string;
      bookPath?: string;
      shopRelationshipUrl: string;
    }>;
    upcomingBookings: Array<{
      bookingId: string;
      slug: string;
      visitUrl: string;
    }>;
    packageCredits?: Array<{ slug: string; packageName: string; creditsRemaining: number }>;
  }>;
}

export async function patchGuestPreferredChannel(
  request: APIRequestContext,
  hubToken: string,
  preferredModality: string,
) {
  const res = await request.patch(`${apiBase}/api/public/guest-hub/preferences`, {
    headers: { "X-Guest-Hub-Token": hubToken },
    data: { preferredModality },
  });
  if (!res.ok()) {
    throw new Error(`guest preferences: ${res.status()} ${(await res.text()).slice(0, 200)}`);
  }
  return res.json() as Promise<{ preferredModality?: string }>;
}

export async function guestShopRelationship(
  request: APIRequestContext,
  hubToken: string,
  slug: string,
) {
  const res = await request.get(`${apiBase}/api/public/guest-hub/shops/${encodeURIComponent(slug)}`, {
    headers: { "X-Guest-Hub-Token": hubToken },
  });
  if (!res.ok()) {
    throw new Error(`guest shop ${slug}: ${res.status()} ${(await res.text()).slice(0, 200)}`);
  }
  return res.json() as Promise<{
    shop: { slug: string; businessName: string };
    verticalArtifacts?: Record<string, unknown>;
    packageCredits?: Array<{ creditsRemaining: number }>;
    relationship?: { memoryHighlight: string | null };
    upcomingBookings: Array<{ bookingId: string; manageUrl: string }>;
  }>;
}
