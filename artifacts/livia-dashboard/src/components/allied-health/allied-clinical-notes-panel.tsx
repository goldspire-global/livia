import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/lib/business-context";
import { apiFetch } from "@/lib/api-fetch";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Stethoscope } from "lucide-react";

type ClinicalNote = {
  id: string;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  createdAt: string;
};

export function AlliedClinicalNotesPanel({ customerId }: { customerId: string }) {
  const { business } = useBusiness();
  const { toast } = useToast();
  const bid = business?.id ?? "";
  const vertical = (business as { vertical?: string } | null)?.vertical;
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");

  const load = useCallback(() => {
    if (!bid || !customerId || vertical !== "allied-health") return;
    setLoading(true);
    apiFetch<{ data: ClinicalNote[] }>(
      `/businesses/${bid}/allied-health/notes/${customerId}`,
    )
      .then((d) => setNotes(d.data ?? []))
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, [bid, customerId, vertical]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!bid || !customerId) return;
    setSaving(true);
    try {
      await apiFetch(`/businesses/${bid}/allied-health/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          subjective,
          objective,
          assessment,
          plan,
        }),
      });
      toast({ title: "Clinical note saved" });
      setSubjective("");
      setObjective("");
      setAssessment("");
      setPlan("");
      load();
    } catch {
      toast({ title: "Could not save note", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (vertical !== "allied-health" || !bid || !customerId) return null;

  return (
    <Card data-testid="allied-clinical-notes-panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-primary" aria-hidden />
          SOAP-lite notes
        </CardTitle>
        <CardDescription>Audit trail for assessments — not a full EHR.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Subjective</Label>
            <Textarea value={subjective} onChange={(e) => setSubjective(e.target.value)} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>Objective</Label>
            <Textarea value={objective} onChange={(e) => setObjective(e.target.value)} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>Assessment</Label>
            <Textarea value={assessment} onChange={(e) => setAssessment(e.target.value)} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>Plan</Label>
            <Textarea value={plan} onChange={(e) => setPlan(e.target.value)} rows={2} />
          </div>
        </div>
        <Button size="sm" onClick={() => void save()} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save note"}
        </Button>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : notes.length > 0 ? (
          <ul className="space-y-2 border-t border-border/60 pt-3">
            {notes.slice(0, 5).map((n) => (
              <li key={n.id} className="text-xs text-muted-foreground">
                <span className="font-mono tabular-nums">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
                {" — "}
                {[n.subjective, n.assessment, n.plan].filter(Boolean).join(" · ").slice(0, 120)}
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
