import type { DemoSignInResult } from "@/lib/demo-portal";

type SignInLike = {
  create: (params: Record<string, string>) => Promise<{
    status: string | null;
    createdSessionId: string | null;
  }>;
};

type ClerkSessionActions = {
  signOut?: (opts: { sessionId: string }) => Promise<unknown>;
  setActive: (opts: { session: string }) => Promise<unknown>;
  sessionId?: string | null;
};

const TICKET_INVALID = /invalid ticket|ticket is invalid/i;

/**
 * Demo sign-in: Clerk ticket first (skips MFA), password fallback when ticket
 * fails (common when dashboard PK and API secret are different Clerk apps).
 */
export async function completeDemoClerkSignIn(
  signIn: SignInLike,
  actions: ClerkSessionActions,
  result: DemoSignInResult,
  password?: string,
): Promise<void> {
  if (actions.sessionId && actions.signOut) {
    await actions.signOut({ sessionId: actions.sessionId });
  }

  const finish = async (sessionId: string) => {
    await actions.setActive({ session: sessionId });
  };

  if (result.token) {
    try {
      const attempt = await signIn.create({
        strategy: "ticket",
        ticket: result.token,
      });
      if (attempt.status === "complete" && attempt.createdSessionId) {
        await finish(attempt.createdSessionId);
        return;
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!password || !TICKET_INVALID.test(msg)) throw e;
    }
  }

  if (!password?.trim()) {
    throw new Error(
      "Clerk ticket failed — enter the demo password below, or run “Set up demo world” on /demo first.",
    );
  }

  const pwdAttempt = await signIn.create({
    identifier: result.email,
    password: password.trim(),
  });
  if (pwdAttempt.status === "complete" && pwdAttempt.createdSessionId) {
    await finish(pwdAttempt.createdSessionId);
    return;
  }

  throw new Error(
    "Demo sign-in did not complete. On staging, confirm Clerk keys match between Vercel and Railway.",
  );
}
