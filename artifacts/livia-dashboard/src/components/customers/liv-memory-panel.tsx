import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { livMemoryKindOptions, livMemoryPlaceholder } from "@workspace/policy";

type MemoryRow = {
  id: string;
  kind: string;
  content: string;
  createdBy: string;
  createdAt: string;
};

export function LivMemoryPanel({
  businessId,
  customerId,
  canEdit,
  vertical,
  category,
}: {
  businessId: string;
  customerId: string;
  canEdit: boolean;
  vertical?: string | null;
  category?: string | null;
}) {
  const kindOptions = livMemoryKindOptions(vertical, category);
  const [kind, setKind] = useState(kindOptions[0]?.value ?? "note");
  const { toast } = useToast();
  const qc = useQueryClient();
  const [draft, setDraft] = useState("");

  const { data } = useQuery({
    queryKey: ["liv-memory", businessId, customerId],
    queryFn: () =>
      apiFetch<{ data: MemoryRow[] }>(
        `/api/businesses/${businessId}/customers/${customerId}/liv-memory`,
      ),
    enabled: !!businessId && !!customerId,
  });

  const rows = data?.data ?? [];

  async function save() {
    const content = draft.trim();
    if (!content) return;
    try {
      await apiFetch(`/api/businesses/${businessId}/customers/${customerId}/liv-memory`, {
        method: "POST",
        body: JSON.stringify({ content, kind }),
      });
      setDraft("");
      await qc.invalidateQueries({ queryKey: ["liv-memory", businessId, customerId] });
      toast({ title: "Liv will remember this for future threads" });
    } catch {
      toast({ title: "Could not save memory", variant: "destructive" });
    }
  }

  if (!canEdit && rows.length === 0) return null;

  return (
    <Card data-testid="liv-memory-panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Liv memory
        </CardTitle>
        {rows.length > 0 ? (
          <CardDescription>What Liv remembers for this client in inbox and booking.</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length > 0 ? (
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {rows.map((r) => (
              <li key={r.id} className="text-sm border rounded-md px-3 py-2">
                <span className="text-[10px] font-mono uppercase text-muted-foreground">{r.kind}</span>
                <p className="mt-1">{r.content}</p>
              </li>
            ))}
          </ul>
        ) : null}
        {canEdit ? (
          <div className="space-y-2">
            <select
              className="w-full text-sm border rounded-md px-2 py-1.5 bg-background"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              aria-label="Memory kind"
            >
              {kindOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <Textarea
              placeholder={livMemoryPlaceholder(vertical, category)}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              className="text-sm"
            />
            <Button size="sm" onClick={() => void save()} disabled={!draft.trim()}>
              Add memory
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
