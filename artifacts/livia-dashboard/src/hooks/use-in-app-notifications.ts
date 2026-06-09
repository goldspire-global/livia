import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";
import { useBusiness } from "@/lib/business-context";

export type InAppNotification = {
  id: string;
  businessId: string | null;
  kind: string;
  priority: "info" | "watch" | "act";
  personaHint: string | null;
  title: string;
  body: string;
  href: string | null;
  mobileHref: string | null;
  resourceKind: string | null;
  resourceId: string | null;
  readAt: string | null;
  createdAt: string;
};

type ListResponse = {
  data: InAppNotification[];
  unreadCount: number;
};

export type MarkReadByResourceInput = {
  resourceKind: string;
  resourceId: string;
  businessId?: string;
};

function notificationsQueryKey(bid: string) {
  return ["in-app-notifications", bid] as const;
}

function notificationsListUrl(bid: string): string {
  const params = new URLSearchParams({ limit: "50", unreadOnly: "true" });
  if (bid) params.set("businessId", bid);
  return `/me/notifications?${params.toString()}`;
}

function applyReadIds(prev: ListResponse | undefined, ids: Set<string>): ListResponse | undefined {
  if (!prev) return prev;
  let removed = 0;
  const data = prev.data.filter((n) => {
    if (ids.has(n.id)) {
      removed += 1;
      return false;
    }
    return true;
  });
  return {
    data,
    unreadCount: Math.max(0, prev.unreadCount - removed),
  };
}

function applyReadByResource(
  prev: ListResponse | undefined,
  input: MarkReadByResourceInput,
): ListResponse | undefined {
  if (!prev) return prev;
  let removed = 0;
  const data = prev.data.filter((n) => {
    const matches =
      !n.readAt &&
      n.resourceKind === input.resourceKind &&
      n.resourceId === input.resourceId &&
      (!input.businessId || n.businessId === input.businessId);
    if (matches) {
      removed += 1;
      return false;
    }
    return true;
  });
  return {
    data,
    unreadCount: Math.max(0, prev.unreadCount - removed),
  };
}

export function useInAppNotifications() {
  const { business } = useBusiness();
  const bid = business?.id ?? "";
  const qc = useQueryClient();
  const listKey = notificationsQueryKey(bid);

  const query = useQuery({
    queryKey: listKey,
    queryFn: () => apiFetch<ListResponse>(notificationsListUrl(bid)),
    refetchInterval: 45_000,
    staleTime: 20_000,
  });

  const markRead = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ ok: boolean }>(`/me/notifications/${id}/read`, { method: "PATCH" }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: listKey });
      const prev = qc.getQueryData<ListResponse>(listKey);
      qc.setQueryData<ListResponse>(listKey, applyReadIds(prev, new Set([id])));
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(listKey, ctx.prev);
    },
  });

  const markAllRead = useMutation({
    mutationFn: () =>
      apiFetch<{ updated: number }>(`/me/notifications/read-all`, {
        method: "POST",
        body: JSON.stringify(bid ? { businessId: bid } : {}),
      }),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: listKey });
      const prev = qc.getQueryData<ListResponse>(listKey);
      qc.setQueryData<ListResponse>(listKey, { data: [], unreadCount: 0 });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(listKey, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: listKey }),
  });

  const markReadByResource = useMutation({
    mutationFn: (input: MarkReadByResourceInput) =>
      apiFetch<{ updated: number }>(`/me/notifications/read-by-resource`, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: listKey });
      const prev = qc.getQueryData<ListResponse>(listKey);
      qc.setQueryData<ListResponse>(listKey, applyReadByResource(prev, input));
      return { prev };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.prev) qc.setQueryData(listKey, ctx.prev);
    },
  });

  return {
    notifications: query.data?.data ?? [],
    unreadCount: query.data?.unreadCount ?? 0,
    isLoading: query.isLoading,
    markRead: markRead.mutateAsync,
    markAllRead: markAllRead.mutateAsync,
    markReadByResource: markReadByResource.mutateAsync,
    refetch: query.refetch,
  };
}
