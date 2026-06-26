import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GUEST_HUB_COPY } from "@workspace/policy";
import { Loader2 } from "lucide-react";

type HubView = {
  guestId: string;
  phoneE164: string;
  email?: string | null;
  displayName?: string | null;
  preferredModality?: string;
  packageCredits?: unknown[];
  shops?: unknown[];
  upcomingBookings?: unknown[];
};

export function GuestHubRedeemPanel({
  hubToken,
  onRedeemed,
}: {
  hubToken: string;
  onRedeemed: (view: HubView) => void;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function redeem() {
    const trimmed = code.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setErr(null);
    setSuccess(null);
    try {
      const r = await fetch("/api/public/guest-hub/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Guest-Hub-Token": hubToken,
        },
        body: JSON.stringify({ code: trimmed }),
      });
      const j = (await r.json().catch(() => ({}))) as {
        error?: string;
        view?: HubView;
        packageName?: string;
        businessName?: string;
      };
      if (!r.ok) {
        throw new Error(j.error ?? GUEST_HUB_COPY.redeemNotFound);
      }
      if (j.view) onRedeemed(j.view);
      setSuccess(
        j.packageName && j.businessName
          ? `${GUEST_HUB_COPY.redeemSuccess} (${j.packageName} · ${j.businessName})`
          : GUEST_HUB_COPY.redeemSuccess,
      );
      setCode("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : GUEST_HUB_COPY.actionFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3" id="redeem" data-testid="guest-hub-redeem">
      <Label htmlFor="guest-redeem-code">{GUEST_HUB_COPY.redeemCodeLabel}</Label>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          id="guest-redeem-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. HAVEN-2026"
          className="min-h-[44px] font-mono uppercase"
          data-testid="guest-hub-redeem-input"
          onKeyDown={(e) => {
            if (e.key === "Enter") void redeem();
          }}
        />
        <Button
          type="button"
          className="min-h-[44px] shrink-0"
          disabled={busy || !code.trim()}
          data-testid="guest-hub-redeem-submit"
          onClick={() => void redeem()}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : GUEST_HUB_COPY.redeemCodeCta}
        </Button>
      </div>
      {success ? <p className="text-xs text-primary">{success}</p> : null}
      {err ? <p className="text-xs text-destructive">{err}</p> : null}
    </div>
  );
}
