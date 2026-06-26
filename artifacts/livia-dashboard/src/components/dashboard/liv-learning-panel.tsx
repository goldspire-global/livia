import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";
import { useBusiness } from "@/lib/business-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Brain } from "lucide-react";

export type LivHypothesisRow = {
  id: string;
  title: string;
  summary: string;
  domain: string;
  confidence: string;
  evidenceKeys?: string[];
};

export function LivLearningPanel({
  hypotheses,
  className,
}: {
  hypotheses?: LivHypothesisRow[];
  className?: string;
}) {
  const { business } = useBusiness();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);
  const bid = business?.id ?? "";

  if (!hypotheses?.length) return null;

  async function act(hypothesisId: string, action: "confirm" | "dismiss") {
    if (!bid) return;
    setBusyId(hypothesisId);
    try {
      await apiFetch(
        `/api/businesses/${bid}/liv-learning/hypotheses/${hypothesisId}/${action}`,
        { method: "POST" },
      );
      toast({
        title: action === "confirm" ? "Liv will remember this" : "Pattern dismissed",
        description:
          action === "confirm"
            ? "Confirmed — Liv will use this in future conversations."
            : "Liv won't suggest this again.",
      });
      void qc.invalidateQueries({ queryKey: ["owner-intelligence", bid] });
      void qc.invalidateQueries({ queryKey: ["/api/businesses", bid, "owner-intelligence"] });
    } catch {
      toast({ title: "Could not update", variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={className} data-testid="liv-learning-panel">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2">
        <Brain className="h-3.5 w-3.5" />
        Liv noticed — confirm to teach her
      </p>
      <ul className="space-y-2">
        {hypotheses.slice(0, 3).map((h) => (
          <li
            key={h.id}
            className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3 text-sm space-y-2"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{h.title}</span>
              <Badge variant="outline" className="text-[10px]">
                {h.confidence}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {h.domain}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{h.summary}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="h-8"
                disabled={busyId === h.id}
                onClick={() => void act(h.id, "confirm")}
              >
                {busyId === h.id ? "Saving…" : "Yes, remember this"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8"
                disabled={busyId === h.id}
                onClick={() => void act(h.id, "dismiss")}
              >
                Not useful
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
