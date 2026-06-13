import type { ConsultLeadActionId, ConsultLeadDecision } from "@workspace/policy";
import { Button } from "@/components/ui/button";
import { ArrowRight, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  decision: ConsultLeadDecision;
  busy?: boolean;
  onAction: (action: ConsultLeadActionId) => void;
  className?: string;
};

/** Slim inbox action row — qualify, issue quote, or decline. No hero panels. */
export function ConsultLeadDecisionPanel({ decision, busy, onAction, className }: Props) {
  return (
    <div className={cn("space-y-2", className)} data-testid="consult-lead-decision">
      {decision.hint ? (
        <p className="text-xs text-muted-foreground leading-relaxed">{decision.hint}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={busy}
          onClick={() => onAction(decision.primary.action)}
          data-testid="consult-lead-primary"
        >
          {decision.primary.label}
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
        {decision.secondary ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={cn(
              decision.secondary.destructive &&
                "border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive",
            )}
            disabled={busy}
            onClick={() => onAction(decision.secondary!.action)}
            data-testid="consult-lead-secondary"
          >
            {decision.secondary.destructive ? (
              <XCircle className="mr-1.5 h-3.5 w-3.5" />
            ) : null}
            {decision.secondary.label}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
