import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox } from "lucide-react";
import { customFetch } from "@workspace/api-client-react";
import { CHAIR_HOSTING_COPY } from "@workspace/policy";

type Enquiry = {
  id: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  specialty: string | null;
  message: string | null;
  status: string;
  createdAt: string;
};

export function ChairHostingEnquiriesPanel({ businessId }: { businessId: string }) {
  const [rows, setRows] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await customFetch<Enquiry[]>(`/api/businesses/${businessId}/host/enquiries`);
      setRows(data);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [businessId]);

  async function setStatus(id: string, status: Enquiry["status"]) {
    await customFetch(`/api/businesses/${businessId}/host/enquiries/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    void load();
  }

  if (loading) return <Skeleton className="h-32 w-full" />;

  return (
    <Card data-testid="chair-hosting-enquiries">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Inbox className="h-4 w-4" />
          {CHAIR_HOSTING_COPY.enquiriesTitle}
        </CardTitle>
        <CardDescription>From your public booking page — link renters below when ready.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{CHAIR_HOSTING_COPY.emptyEnquiries}</p>
        ) : (
          rows.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-border/60 px-3 py-2 text-sm space-y-1"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-medium">{r.contactName}</span>
                <Badge variant={r.status === "new" ? "destructive" : "secondary"}>{r.status}</Badge>
              </div>
              <p className="text-muted-foreground text-xs">
                {r.contactEmail}
                {r.contactPhone ? ` · ${r.contactPhone}` : ""}
                {r.specialty ? ` · ${r.specialty}` : ""}
              </p>
              {r.message ? <p className="text-xs">{r.message}</p> : null}
              <div className="flex flex-wrap gap-2 pt-1">
                {r.status === "new" ? (
                  <Button size="sm" variant="outline" onClick={() => void setStatus(r.id, "contacted")}>
                    Mark contacted
                  </Button>
                ) : null}
                {r.status !== "linked" ? (
                  <Button size="sm" variant="secondary" onClick={() => void setStatus(r.id, "linked")}>
                    Mark linked
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
