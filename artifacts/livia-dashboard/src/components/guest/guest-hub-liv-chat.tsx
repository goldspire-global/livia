import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles } from "lucide-react";
import { Link } from "wouter";

type ChatAction = { label: string; href: string };

type ChatTurn = {
  role: "user" | "assistant";
  text: string;
  actions?: ChatAction[];
};

export function GuestHubLivChat({ hubToken }: { hubToken: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([
    {
      role: "assistant",
      text: "Ask me to book again at a shop in your vault, or check your next visit.",
    },
  ]);
  const [err, setErr] = useState<string | null>(null);

  async function send() {
    const text = message.trim();
    if (!text || busy) return;
    setBusy(true);
    setErr(null);
    setMessage("");
    setTurns((t) => [...t, { role: "user", text }]);
    try {
      const r = await fetch("/api/public/guest-hub/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Guest-Hub-Token": hubToken,
        },
        body: JSON.stringify({ message: text }),
      });
      const j = (await r.json().catch(() => ({}))) as {
        reply?: string;
        actions?: ChatAction[];
        error?: string;
      };
      if (!r.ok) throw new Error(j.error ?? "Could not reach Liv");
      setTurns((t) => [
        ...t,
        {
          role: "assistant",
          text: j.reply ?? "Done.",
          actions: j.actions,
        },
      ]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside
      className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 to-transparent overflow-hidden"
      data-testid="guest-hub-liv-orchestrator"
    >
      <button
        type="button"
        className="w-full px-4 py-3 flex gap-2 items-start text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden />
        <span className="text-xs text-muted-foreground leading-relaxed flex-1">
          <span className="text-foreground font-medium">Liv orchestrator</span>
          {open ? " — tap to collapse" : " — book again across your shops"}
        </span>
      </button>
      {open ? (
        <div className="px-4 pb-4 space-y-3 border-t border-primary/10">
          <ul className="max-h-48 overflow-y-auto space-y-2 text-xs" data-testid="guest-hub-liv-messages">
            {turns.map((turn, i) => (
              <li
                key={i}
                className={
                  turn.role === "user"
                    ? "text-foreground text-right"
                    : "text-muted-foreground text-left"
                }
              >
                {turn.text}
                {turn.actions?.length ? (
                  <div className="flex flex-wrap gap-2 mt-2 justify-start">
                    {turn.actions.map((a) => (
                      <Button key={a.href} size="sm" variant="secondary" asChild className="min-h-[40px]">
                        <Link href={a.href}>{a.label}</Link>
                      </Button>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
          {err ? <p className="text-xs text-destructive">{err}</p> : null}
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Book my usual at…"
              className="min-h-[44px] text-base"
              data-testid="guest-hub-liv-input"
              onKeyDown={(e) => {
                if (e.key === "Enter") void send();
              }}
            />
            <Button
              type="button"
              className="min-h-[44px] shrink-0"
              disabled={busy || !message.trim()}
              data-testid="guest-hub-liv-send"
              onClick={() => void send()}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
            </Button>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
