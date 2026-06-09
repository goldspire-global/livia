import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-fetch";
import { useBusiness } from "@/lib/business-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  parseOperationalPolicy,
  mergeOperationalPolicy,
  parseGuestCareAutomation,
  type GuestCareAutomation,
} from "@workspace/policy";

export function GuestCarePolicyControls() {
  const { business } = useBusiness();
  const { toast } = useToast();
  const businessId = business?.id ?? "";
  const [saving, setSaving] = useState(false);
  const [care, setCare] = useState<GuestCareAutomation>(parseGuestCareAutomation({}));

  useEffect(() => {
    if (!businessId) return;
    void apiFetch<{ operationalPolicy?: unknown }>(`/businesses/${businessId}`).then((b) => {
      const op = parseOperationalPolicy(b.operationalPolicy);
      setCare(parseGuestCareAutomation(op.guestCare));
    });
  }, [businessId]);

  async function save() {
    if (!businessId) return;
    setSaving(true);
    try {
      const current = await apiFetch<{ operationalPolicy?: unknown }>(`/businesses/${businessId}`);
      const op = parseOperationalPolicy(current.operationalPolicy);
      await apiFetch(`/businesses/${businessId}`, {
        method: "PATCH",
        body: JSON.stringify({
          operationalPolicy: mergeOperationalPolicy({ guestCare: care }, op),
        }),
      });
      toast({ title: "Guest care settings saved" });
    } catch {
      toast({ title: "Could not save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card data-testid="guest-care-policy-card">
      <CardHeader>
        <CardTitle className="text-base">Aftercare & follow-up</CardTitle>
        <CardDescription>
          Liv sends post-session instructions on the guest&apos;s preferred channel — thread first when
          possible.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Label>Automatic aftercare</Label>
          <Switch
            checked={care.aftercareEnabled}
            onCheckedChange={(v) => setCare({ ...care, aftercareEnabled: v })}
          />
        </div>
        <div className="grid gap-2">
          <Label>Mode</Label>
          <Select
            value={care.aftercareMode}
            onValueChange={(v) =>
              setCare({ ...care, aftercareMode: v as GuestCareAutomation["aftercareMode"] })
            }
          >
            <SelectTrigger data-testid="aftercare-mode-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-send after visit</SelectItem>
              <SelectItem value="liv_draft">Liv draft — you approve once</SelectItem>
              <SelectItem value="manual_only">Manual only (inbox draft)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Timing</Label>
          <Select
            value={care.aftercareDelay}
            onValueChange={(v) =>
              setCare({ ...care, aftercareDelay: v as GuestCareAutomation["aftercareDelay"] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2h">~2 hours after complete</SelectItem>
              <SelectItem value="same_evening">Same evening</SelectItem>
              <SelectItem value="next_morning">Next morning</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>Include retail usage tips</Label>
            <p className="text-xs text-muted-foreground">When a linked product was sold or attached</p>
          </div>
          <Switch
            checked={care.retailAftercareEnabled}
            onCheckedChange={(v) => setCare({ ...care, retailAftercareEnabled: v })}
          />
        </div>
        <Button onClick={() => void save()} disabled={saving}>
          {saving ? "Saving…" : "Save guest care"}
        </Button>
      </CardContent>
    </Card>
  );
}
