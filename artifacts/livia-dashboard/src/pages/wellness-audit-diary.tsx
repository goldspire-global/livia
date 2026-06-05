import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useBusiness } from "@/lib/business-context";
import { apiFetch } from "@/lib/api-fetch";
import { PersonaRitualHeader } from "@/components/ritual/persona-ritual-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WELLNESS_TRUST_COPY } from "@workspace/policy";
import { ScrollText } from "lucide-react";

type DiaryRow = { at: string; kind: string; line: string };

export default function WellnessAuditDiaryPage() {
  const { business } = useBusiness();
  const bid = business?.id ?? "";
  const [lines, setLines] = useState<DiaryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bid) return;
    setLoading(true);
    void apiFetch<{ lines: DiaryRow[] }>(`/api/businesses/${bid}/wellness/audit-diary`)
      .then((r) => setLines(r.lines))
      .catch(() => setLines([]))
      .finally(() => setLoading(false));
  }, [bid]);

  return (
    <div className="space-y-6 max-w-3xl" data-testid="wellness-audit-diary-page">
      <PersonaRitualHeader title="Audit diary" subtitle={WELLNESS_TRUST_COPY.auditDiary} />

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ScrollText className="h-4 w-4" />
              Last 14 days
            </CardTitle>
            <CardDescription>Bookings, Liv memory, and staff audit events</CardDescription>
          </CardHeader>
          <CardContent>
            {lines.length ? (
              <ul className="text-sm space-y-2">
                {lines.map((row) => (
                  <li key={`${row.at}-${row.line}`} className="flex gap-3">
                    <span className="text-xs text-muted-foreground tabular-nums shrink-0 w-36">
                      {new Date(row.at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>
                      <span className="text-[10px] uppercase tracking-wide text-primary mr-2">
                        {row.kind}
                      </span>
                      {row.line}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No diary entries yet.</p>
            )}
          </CardContent>
        </Card>
      )}

      <Link href="/wellness-reports" className="text-sm text-primary">
        ← Reports
      </Link>
    </div>
  );
}
