import { useEffect, useState } from "react";
import { useBusiness } from "@/lib/business-context";
import { customFetch } from "@workspace/api-client-react";
import { OperationalPageShell } from "@/components/layout/operational-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type WaitlistRow = {
  id: string;
  status: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  serviceId?: string | null;
  customerId?: string | null;
  createdAt?: string;
};

export default function WaitlistQueuePage() {
  const { business } = useBusiness();
  const bid = business?.id ?? "";
  const [rows, setRows] = useState<WaitlistRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bid) return;
    setLoading(true);
    void customFetch<{ data: WaitlistRow[] }>(`/api/businesses/${bid}/waitlist`)
      .then((res) => setRows(res.data ?? []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [bid]);

  return (
    <OperationalPageShell
      data-testid="waitlist-queue-page"
      title="Slot waitlist"
      subtitle="Guests waiting for cancellations — Liv promotes the first match when a slot opens."
      width="lg"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active queue</CardTitle>
          <CardDescription>
            Works for 1:1 services across verticals. Class waitlists appear on the Classes page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No one on the waitlist right now.</p>
          ) : (
            <ul className="space-y-2">
              {rows.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <div>
                    <span className="font-medium">{r.phone ?? r.email ?? "Guest"}</span>
                    {r.notes ? (
                      <p className="text-xs text-muted-foreground mt-0.5">{r.notes}</p>
                    ) : null}
                  </div>
                  <Badge variant="outline">{r.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </OperationalPageShell>
  );
}
