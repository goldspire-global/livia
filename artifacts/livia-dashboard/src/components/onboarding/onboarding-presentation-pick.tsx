import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@workspace/api-client-react";
import { applyPresentationTheme } from "@/lib/experience-theme";
import { presentationPresetsUiEnabled } from "@/components/settings/public-appearance-panel";
import { cn } from "@/lib/utils";
import { Palette } from "lucide-react";

type Preset = { id: string; label: string; description: string; cssPreset: string };

type PresentationPayload = {
  presetId: string;
  preset: Preset;
  availablePresets: Preset[];
  brandAccentHex: string | null;
};

type Props = {
  businessId: string;
  onReviewed?: () => void;
};

export function OnboardingPresentationPick({ businessId, onReviewed }: Props) {
  const { toast } = useToast();
  const [data, setData] = useState<PresentationPayload | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!businessId || !presentationPresetsUiEnabled()) return;
    void customFetch<PresentationPayload>(`/api/businesses/${businessId}/presentation`)
      .then((d) => {
        setData(d);
        applyPresentationTheme({ cssPreset: d.preset.cssPreset, brandAccentHex: d.brandAccentHex });
      })
      .catch(() => setData(null));
  }, [businessId]);

  if (!presentationPresetsUiEnabled() || !data?.availablePresets?.length) return null;

  async function pickPreset(id: string) {
    setBusy(true);
    try {
      const next = await customFetch<PresentationPayload>(`/api/businesses/${businessId}/presentation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presentationPresetId: id }),
      });
      setData(next);
      applyPresentationTheme({
        cssPreset: next.preset.cssPreset,
        brandAccentHex: next.brandAccentHex,
      });
      onReviewed?.();
      toast({ title: "Look updated", description: next.preset.label });
    } catch {
      toast({ title: "Could not save preset", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3"
      data-testid="onboarding-presentation-pick"
    >
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-primary" aria-hidden />
        <Label className="text-sm font-medium">How customers see your booking page</Label>
      </div>
      <p className="text-xs text-muted-foreground">
        Pick a presentation preset — you can change this anytime under Settings → Public appearance.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {data.availablePresets.map((p) => (
          <Button
            key={p.id}
            type="button"
            variant={data.presetId === p.id ? "default" : "outline"}
            disabled={busy}
            className={cn("h-auto py-3 text-left justify-start flex-col items-start")}
            data-testid={`onboarding-preset-${p.id}`}
            onClick={() => void pickPreset(p.id)}
          >
            <span className="font-medium text-sm">{p.label}</span>
            <span className="text-xs text-muted-foreground font-normal">{p.description}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
