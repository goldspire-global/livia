import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GUEST_HUB_COPY, guestHubContactLabel } from "@workspace/policy";
import { formatDateTime } from "@/lib/format";
import { Loader2 } from "lucide-react";

export function GuestHubProfileCard({
  hubToken,
  phoneE164,
  email,
  displayName,
  memberSince,
  onUpdated,
}: {
  hubToken: string;
  phoneE164: string;
  email?: string | null;
  displayName?: string | null;
  memberSince?: string | null;
  onUpdated: (displayName: string | null) => void;
}) {
  const [name, setName] = useState(displayName ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const contact = guestHubContactLabel({ phoneE164, email });

  async function save() {
    setSaving(true);
    setErr(null);
    setSaved(false);
    try {
      const r = await fetch("/api/public/guest-hub/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Guest-Hub-Token": hubToken,
        },
        body: JSON.stringify({ displayName: name }),
      });
      if (!r.ok) throw new Error("save");
      const view = (await r.json()) as { displayName?: string | null };
      onUpdated(view.displayName ?? null);
      setSaved(true);
    } catch {
      setErr("Could not save — try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card data-testid="guest-hub-profile-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{GUEST_HUB_COPY.profileSection}</CardTitle>
        <CardDescription>{GUEST_HUB_COPY.signInBodyColdStart}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <Label className="text-xs text-muted-foreground">Signed in as</Label>
            <p className="text-sm font-mono mt-1 tabular-nums break-all">{contact}</p>
          </div>
          {memberSince ? (
            <div>
              <Label className="text-xs text-muted-foreground">{GUEST_HUB_COPY.profileMemberSince}</Label>
              <p className="text-sm mt-1">{formatDateTime(memberSince)}</p>
            </div>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="guest-display-name">{GUEST_HUB_COPY.profileDisplayNameLabel}</Label>
          <Input
            id="guest-display-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={GUEST_HUB_COPY.profileDisplayNamePlaceholder}
            className="min-h-[44px]"
            data-testid="guest-hub-display-name"
          />
          {err ? <p className="text-xs text-destructive">{err}</p> : null}
          {saved ? <p className="text-xs text-primary">{GUEST_HUB_COPY.profileSaved}</p> : null}
          <Button
            type="button"
            size="sm"
            className="w-fit min-h-[40px]"
            disabled={saving || name === (displayName ?? "")}
            onClick={() => void save()}
            data-testid="guest-hub-profile-save"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : GUEST_HUB_COPY.profileSaveCta}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
