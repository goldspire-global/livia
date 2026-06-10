import {
  mobileRouteFromDemoLanding,
  persistDemoSession,
  type DemoSession,
} from "@/lib/demo-session";
import type { DemoSignInResult } from "@/lib/demo-portal";
import { markGatewaySkinHandoff } from "@/lib/gateway-handoff";

type ClerkTicketSignIn = {
  create: (params: { strategy: "ticket"; ticket: string }) => Promise<{
    status: string | null;
    createdSessionId: string | null;
  }>;
};

export async function completeMobileDemoSignIn(
  signIn: ClerkTicketSignIn,
  setActive: (params: { session: string }) => Promise<void>,
  result: DemoSignInResult,
  verticalHint?: string | null,
): Promise<string> {
  if (result.signInStrategy === "public") {
    return mobileRouteFromDemoLanding(result.landingPath);
  }
  if (!result.token) {
    throw new Error("No sign-in ticket returned — run demo provision on the API.");
  }

  const sessionPayload: Parameters<typeof persistDemoSession>[0] = {
    token: result.token,
    landingPath: result.landingPath,
    email: result.email,
    displayName: result.displayName,
    persona: result.persona,
    businessId: result.businessId,
    primaryBusinessSlug: result.primaryBusinessSlug,
    businessSlugs: result.businessSlugs,
  };
  await persistDemoSession(sessionPayload);

  const attempt = await signIn.create({
    strategy: "ticket",
    ticket: result.token,
  });
  if (attempt.status !== "complete" || !attempt.createdSessionId) {
    throw new Error("Clerk ticket sign-in did not complete.");
  }
  await setActive({ session: attempt.createdSessionId });
  await markGatewaySkinHandoff(verticalHint ?? null);
  return mobileRouteFromDemoLanding(result.landingPath);
}

export function demoSessionFromSignIn(result: DemoSignInResult): DemoSession | null {
  if (!result.email) return null;
  return {
    email: result.email,
    persona: result.persona,
    landingPath: result.landingPath,
    businessId: result.businessId,
    primaryBusinessSlug: result.primaryBusinessSlug ?? "",
    businessSlugs: result.businessSlugs ?? [],
  };
}
