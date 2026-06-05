import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { staffLivInboxSuggestions } from "@workspace/policy";
import { beautyOutlineButton } from "@/lib/beauty-operational-ui";
import { cn } from "@/lib/utils";

type Props = {
  vertical?: string | null;
  category?: string | null;
  disabled?: boolean;
  loading?: boolean;
  mode?: "open" | "handoff";
  beautyChrome?: boolean;
  /** Wellness calm inbox — collapsed prompts so the thread stays visible. */
  compact?: boolean;
  onAsk: (prompt: string) => void;
};

function SuggestionChips({
  suggestions,
  disabled,
  loading,
  beautyChrome,
  onAsk,
}: {
  suggestions: readonly string[];
  disabled?: boolean;
  loading?: boolean;
  beautyChrome?: boolean;
  onAsk: (prompt: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {suggestions.map((s) => (
        <Button
          key={s}
          type="button"
          size="sm"
          variant="outline"
          className={cn(
            "h-auto py-1 px-2 text-xs font-normal text-left whitespace-normal max-w-full",
            beautyOutlineButton(beautyChrome),
          )}
          disabled={disabled || loading}
          onClick={() => onAsk(s)}
        >
          {s}
        </Button>
      ))}
    </div>
  );
}

export function LivInboxAssist({
  vertical,
  category,
  disabled,
  loading,
  mode = "open",
  beautyChrome,
  compact,
  onAsk,
}: Props) {
  const suggestions = staffLivInboxSuggestions(vertical, category, mode);

  if (compact) {
    return (
      <details className="wellness-liv-inbox-assist group text-sm" data-testid="liv-inbox-assist">
        <summary className="cursor-pointer list-none text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1 [&::-webkit-details-marker]:hidden">
          <Sparkles className="h-3 w-3 text-primary shrink-0" />
          Ask Liv · {suggestions.length} prompts
          <span className="text-muted-foreground/70 normal-case tracking-normal font-sans">
            (tap to expand)
          </span>
        </summary>
        <div className="pt-2">
          <SuggestionChips
            suggestions={suggestions}
            disabled={disabled}
            loading={loading}
            beautyChrome={beautyChrome}
            onAsk={onAsk}
          />
        </div>
      </details>
    );
  }

  return (
    <div className="space-y-2" data-testid="liv-inbox-assist">
      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1">
        <Sparkles className="h-3 w-3 text-primary" />
        Ask Liv
      </p>
      <SuggestionChips
        suggestions={suggestions}
        disabled={disabled}
        loading={loading}
        beautyChrome={beautyChrome}
        onAsk={onAsk}
      />
    </div>
  );
}
