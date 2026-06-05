import { useEffect, useState } from "react";
import { useBusiness } from "@/lib/business-context";
import { apiFetch } from "@/lib/api-fetch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { WELLNESS_WHATSAPP_TEMPLATES } from "@workspace/policy";

type Broker = { id: string; label: string; connected: boolean; note: string };

export function WellnessIntegrationsPanel() {
  const { business } = useBusiness();
  const { toast } = useToast();
  const bid = business?.id ?? "";
  const [brokers, setBrokers] = useState<Broker[]>([]);

  useEffect(() => {
    if (!bid) return;
    void apiFetch<Broker[]>(`/api/businesses/${bid}/integration-brokers`).then(setBrokers);
  }, [bid]);

  async function sync(id: string) {
    try {
      const r = await apiFetch<{ ok: boolean; message: string }>(
        `/api/businesses/${bid}/integration-brokers/${id}/sync`,
        { method: "POST", body: JSON.stringify({}) },
      );
      toast({ title: r.message });
    } catch {
      toast({ title: "Sync failed", variant: "destructive" });
    }
  }

  if (!bid) return null;

  return (
    <Card data-testid="wellness-integrations-panel">
      <CardHeader>
        <CardTitle className="text-base">Wellness integrations</CardTitle>
        <CardDescription>Brokers, parallel run, settlement export</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="text-sm space-y-2">
          {brokers.map((b) => (
            <li key={b.id} className="flex justify-between gap-2 items-start">
              <div>
                <p className="font-medium">{b.label}</p>
                <p className="text-xs text-muted-foreground">{b.note}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => void sync(b.id)}>
                {b.connected ? "Sync" : "Configure"}
              </Button>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" asChild>
            <a href={`/api/businesses/${bid}/wellness/settlement.csv`}>Settlement CSV</a>
          </Button>
          <Button size="sm" variant="secondary" asChild>
            <a href={`/api/businesses/${bid}/wellness/parallel-run/mindbody`} target="_blank" rel="noreferrer">
              Parallel run (JSON)
            </a>
          </Button>
        </div>
        <div>
          <p className="text-xs font-medium mb-1">WhatsApp templates (when channel connected)</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            {WELLNESS_WHATSAPP_TEMPLATES.map((t) => (
              <li key={t.id}>{t.label}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
