import { useUser } from "@clerk/clerk-react";
import { useGetMyBusinesses } from "@workspace/api-client-react";
import { resolvePostSignInLandingPath, type SessionBusinessLike } from "@workspace/policy";
import { normalizeBusinessList } from "@/lib/business-context";
import { readSignInRedirectPath } from "@/lib/local-dashboard-auth";
import { apiFetch } from "@/lib/api-fetch";

export function usePostSignInLandingPath(enabled: boolean): {
  loading: boolean;
  path: string | null;
} {
  const { user } = useUser();
  const { data, isLoading, isFetching } = useGetMyBusinesses({
    query: {
      enabled,
      retry: 1,
      staleTime: 0,
    } as never,
  });

  if (!enabled) return { loading: false, path: null };
  if (isLoading && data === undefined) return { loading: true, path: null };

  const path = resolvePostSignInLandingPath({
    businesses: normalizeBusinessList(data) as SessionBusinessLike[],
    clerkUserId: user?.id ?? "",
    email: user?.primaryEmailAddress?.emailAddress ?? null,
    requestedRedirect: readSignInRedirectPath(),
  });

  return { loading: isLoading || isFetching, path };
}

/** Resolve landing path immediately after Clerk sign-in (before React Query warms). */
export async function fetchPostSignInLandingPath(args: {
  clerkUserId: string;
  email?: string | null;
  requestedRedirect?: string | null;
}): Promise<string> {
  const raw = await apiFetch("/me/businesses");
  return resolvePostSignInLandingPath({
    businesses: normalizeBusinessList(raw) as SessionBusinessLike[],
    clerkUserId: args.clerkUserId,
    email: args.email ?? null,
    requestedRedirect: args.requestedRedirect ?? readSignInRedirectPath(),
  });
}
