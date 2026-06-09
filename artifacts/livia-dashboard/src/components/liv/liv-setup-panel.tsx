import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetLivSetupGuidedFlowQueryKey,
  useGetLivSetupGuidedFlow,
  usePostLivSetupAssist,
  type LivSetupGuidedFlow as LivSetupGuidedFlowData,
} from "@workspace/api-client-react";
import { useBusiness } from "@/lib/business-context";
import { useMembership } from "@/lib/membership-context";
import { LivSettingsOperationalPanel } from "@/components/liv/liv-settings-operational-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LivSetupGuidedFlow } from "@/components/liv/liv-setup-guided-flow";

type Turn = { role: "user" | "assistant"; content: string };

function LivSetupCopilotCard({
  bid,
  compact,
  className,
  flow,
}: {
  bid: string;
  compact?: boolean;
  className?: string;
  flow?: LivSetupGuidedFlowData;
}) {
  const qc = useQueryClient();
  const [message, setMessage] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([
    flow?.nextLivPrompt ?? "What's left before I'm live?",
    "Which presentation presets can I use?",
  ]);

  const assist = usePostLivSetupAssist({
    mutation: {
      onSuccess: (result) => {
        setTurns((t) => [...t, { role: "assistant", content: result.reply }]);
        if (result.suggestions?.length) setSuggestions(result.suggestions);
        void qc.invalidateQueries({ queryKey: getGetLivSetupGuidedFlowQueryKey(bid) });
      },
      onError: () => {
        setTurns((t) => [
          ...t,
          {
            role: "assistant",
            content: "Liv couldn't reach the server — try again or continue the step below.",
          },
        ]);
      },
    },
  });

  function send(prompt?: string) {
    const text = (prompt ?? message).trim();
    if (!text || !bid || assist.isPending) return;
    setMessage("");
    const history = turns.slice(-8);
    setTurns((t) => [...t, { role: "user", content: text }]);
    assist.mutate({ businessId: bid, data: { message: text, history } });
  }

  const blockersOnly = flow?.complete && (flow.capabilityBlockers?.length ?? 0) > 0;

  return (
    <Card className={cn("border-primary/25", className)} data-testid="liv-setup-panel">
      <CardHeader className={compact ? "pb-2" : undefined}>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          {blockersOnly ? "Finish what's blocking you" : "Get live with Liv"}
        </CardTitle>
        <CardDescription>
          {blockersOnly
            ? "A few shop capabilities still need attention before guests can book smoothly."
            : "Shop setup → publish your link → first booking. Liv can apply changes after you confirm."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <LivSetupGuidedFlow businessId={bid} compact={compact} onAskLiv={(p) => send(p)} />
        {turns.length > 0 ? (
          <div className="max-h-48 overflow-y-auto space-y-2 rounded-md border border-border/60 p-3 text-sm bg-muted/30">
            {turns.map((t, i) => (
              <p
                key={i}
                className={t.role === "user" ? "text-foreground" : "text-muted-foreground"}
              >
                {t.role === "user" ? "You: " : "Liv: "}
                {t.content}
              </p>
            ))}
          </div>
        ) : null}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            blockersOnly
              ? "Ask Liv how to unblock bookings or payments…"
              : "Ask about setup, presets, or going live…"
          }
          rows={compact ? 2 : 3}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <Button
              key={s}
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-auto py-1.5"
              disabled={assist.isPending}
              onClick={() => send(s)}
            >
              {s.length > 44 ? `${s.slice(0, 42)}…` : s}
            </Button>
          ))}
        </div>
        <Button type="button" onClick={() => send()} disabled={assist.isPending || !message.trim()}>
          {assist.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Send
        </Button>
      </CardContent>
    </Card>
  );
}

export function LivSetupPanel({ className, compact }: { className?: string; compact?: boolean }) {
  const { business } = useBusiness();
  const { effectiveRole } = useMembership();
  const bid = business?.id ?? "";

  const { data: flow, isLoading } = useGetLivSetupGuidedFlow(bid, {
    query: { enabled: !!bid } as never,
  });

  if (!business || !["OWNER", "ADMIN"].includes(effectiveRole ?? "")) return null;

  if (isLoading) {
    return (
      <Skeleton
        className={cn("h-40 w-full rounded-lg", className)}
        data-testid="liv-setup-panel-loading"
      />
    );
  }

  const hasBlockers = (flow?.capabilityBlockers?.length ?? 0) > 0;
  const setupComplete = flow?.complete ?? false;

  if (setupComplete && !hasBlockers) {
    return <LivSettingsOperationalPanel className={className} compact={compact} />;
  }

  return (
    <LivSetupCopilotCard bid={bid} compact={compact} className={className} flow={flow} />
  );
}
