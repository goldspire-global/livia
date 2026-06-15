import type { Page } from "@playwright/test";
import { apiBase } from "./demo-auth";

type AuthedResult<T> = {
  ok: boolean;
  status: number;
  text: string;
  data: T | null;
};

/** Clerk-authenticated fetch from the dashboard browser context. */
export async function pageAuthedJson<T = unknown>(
  page: Page,
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<AuthedResult<T>> {
  return page.evaluate(
    async ({ api, path, init }) => {
      const clerk = (
        window as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }
      ).Clerk;
      const token = await clerk?.session?.getToken?.();
      if (!token) return { ok: false, status: 0, text: "no_token", data: null };

      const res = await fetch(`${api}${path}`, {
        method: init?.method ?? "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: init?.body != null ? JSON.stringify(init.body) : undefined,
      });
      const text = await res.text();
      let data: unknown = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }
      return { ok: res.ok, status: res.status, text, data };
    },
    { api: apiBase, path, init },
  ) as Promise<AuthedResult<T>>;
}

export async function patchBookingStatus(
  page: Page,
  businessId: string,
  bookingId: string,
  status: string,
): Promise<boolean> {
  const res = await pageAuthedJson(page, `/api/businesses/${businessId}/bookings/${bookingId}`, {
    method: "PATCH",
    body: { status },
  });
  return res.ok;
}

type BookingRow = {
  id: string;
  status: string;
  aftercareSentAt?: string | null;
};

/** Prefer COMPLETED without sent aftercare; else CONFIRMED ready to complete. */
export async function findAftercareBookingCandidate(
  page: Page,
  businessId: string,
): Promise<{ id: string; status: string } | null> {
  const list = await pageAuthedJson<{ data: BookingRow[] }>(
    page,
    `/api/businesses/${businessId}/bookings?status=COMPLETED&limit=30`,
  );
  if (list.ok && list.data?.data?.length) {
    const open = list.data.data.find((b) => !b.aftercareSentAt);
    if (open) return { id: open.id, status: open.status };
  }

  const confirmed = await pageAuthedJson<{ data: BookingRow[] }>(
    page,
    `/api/businesses/${businessId}/bookings?status=CONFIRMED&limit=20`,
  );
  if (confirmed.ok && confirmed.data?.data?.length) {
    return { id: confirmed.data.data[0]!.id, status: confirmed.data.data[0]!.status };
  }

  return null;
}
