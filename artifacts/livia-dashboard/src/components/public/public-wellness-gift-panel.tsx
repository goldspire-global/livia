import { useState } from "react";
import { WELLNESS_GIFT_PACKAGE_PRESETS } from "@workspace/policy";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift } from "lucide-react";

type GiftResult = {
  redemptionCode: string;
  packageLabel: string;
  creditsTotal: number;
  confirmLines: string[];
  myLiviaPath: string;
};

export function PublicWellnessGiftPanel({
  slug,
  onPurchased,
}: {
  slug: string;
  onPurchased?: (result: GiftResult) => void;
}) {
  const [presetId, setPresetId] = useState(WELLNESS_GIFT_PACKAGE_PRESETS[0]?.id ?? "");
  const [purchaserFirstName, setPurchaserFirstName] = useState("");
  const [recipientFirstName, setRecipientFirstName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<GiftResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function purchase() {
    if (!slug || !purchaserFirstName.trim() || !recipientFirstName.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(`/api/public/b/${encodeURIComponent(slug)}/gift-package`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presetId,
          purchaserFirstName: purchaserFirstName.trim(),
          recipientFirstName: recipientFirstName.trim(),
          recipientPhone: recipientPhone.trim() || undefined,
        }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error ?? "Could not complete gift");
      }
      const j = (await r.json()) as GiftResult;
      setResult(j);
      onPurchased?.(j);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Try again");
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <Card data-testid="public-gift-confirm" className="border-primary/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Gift ready</CardTitle>
          <CardDescription className="font-mono text-lg tracking-widest">{result.redemptionCode}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          {result.confirmLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <a href={result.myLiviaPath} className="text-primary underline-offset-2 hover:underline">
            Open My Livia
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="public-gift-panel" className="border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Gift className="h-4 w-4" />
          Gift a session pack
        </CardTitle>
        <CardDescription>Buy for someone else — they redeem with the code in My Livia</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {WELLNESS_GIFT_PACKAGE_PRESETS.map((p) => (
            <Button
              key={p.id}
              type="button"
              size="sm"
              variant={presetId === p.id ? "default" : "outline"}
              onClick={() => setPresetId(p.id)}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Your first name</Label>
            <Input value={purchaserFirstName} onChange={(e) => setPurchaserFirstName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Recipient first name</Label>
            <Input value={recipientFirstName} onChange={(e) => setRecipientFirstName(e.target.value)} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>Recipient phone (optional)</Label>
            <Input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} />
          </div>
        </div>
        {err ? <p className="text-sm text-destructive">{err}</p> : null}
        <Button type="button" onClick={() => void purchase()} disabled={busy}>
          Purchase gift pack
        </Button>
      </CardContent>
    </Card>
  );
}
