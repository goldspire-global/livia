import { useState } from "react";
import { Link } from "wouter";
import { useBusiness } from "@/lib/business-context";
import { apiFetch } from "@/lib/api-fetch";
import { PersonaRitualHeader } from "@/components/ritual/persona-ritual-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WELLNESS_TRUST_COPY } from "@workspace/policy";
import { useToast } from "@/hooks/use-toast";

type VaultProfile = {
  guestId: string | null;
  linkedShops: Array<{ businessId: string; slug: string | null; name: string | null }>;
  chainPeers: Array<{ businessId: string; slug: string | null; name: string | null }>;
  crossSiteMemoryEnabled: boolean;
  consentRequired: boolean;
  note: string;
};

type FloatRoster = {
  staff: Array<{ id: string; displayName: string | null; siteName: string }>;
  note: string;
};

export default function WellnessGuestVaultPage() {
  const { business } = useBusiness();
  const { toast } = useToast();
  const bid = business?.id ?? "";
  const [phone, setPhone] = useState("");
  const [profile, setProfile] = useState<VaultProfile | null>(null);
  const [floatRoster, setFloatRoster] = useState<FloatRoster | null>(null);
  const [busy, setBusy] = useState(false);

  async function lookup() {
    if (!bid || !phone.trim()) return;
    setBusy(true);
    try {
      const [vault, roster] = await Promise.all([
        apiFetch<VaultProfile>(
          `/api/businesses/${bid}/wellness/guest-vault?phone=${encodeURIComponent(phone.trim())}`,
        ),
        apiFetch<FloatRoster>(`/api/businesses/${bid}/wellness/float-roster`),
      ]);
      setProfile(vault);
      setFloatRoster(roster);
    } catch {
      setProfile(null);
      setFloatRoster(null);
      toast({ title: "Guest not found", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  async function transferMemory(targetBusinessId: string) {
    if (!bid || !phone.trim()) return;
    setBusy(true);
    try {
      await apiFetch(`/api/businesses/${bid}/wellness/guest-vault/transfer`, {
        method: "POST",
        body: JSON.stringify({
          phoneE164: phone.trim(),
          targetBusinessId,
          consent: true,
        }),
      });
      toast({ title: "Memory transfer recorded" });
      void lookup();
    } catch {
      toast({ title: "Transfer failed", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl" data-testid="wellness-guest-vault-page">
      <PersonaRitualHeader
        title="Guest lookup"
        subtitle="Cross-visit notes, gift redemption, and float roster"
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Lookup by phone</CardTitle>
          <CardDescription>{WELLNESS_TRUST_COPY.dataPortability}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="vault-phone">Phone (E.164)</Label>
            <Input
              id="vault-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+353…"
              data-testid="vault-phone-input"
            />
          </div>
          <Button onClick={() => void lookup()} disabled={busy || !phone.trim()}>
            Open vault
          </Button>
          {profile ? (
            <div className="rounded-lg border p-3 text-sm space-y-2" data-testid="vault-profile">
              <p className="text-muted-foreground">{profile.note}</p>
              {profile.linkedShops.length ? (
                <ul className="space-y-1">
                  {profile.linkedShops.map((s) => (
                    <li key={s.businessId}>
                      {s.name ?? s.slug}
                      {profile.chainPeers.some((p) => p.businessId === s.businessId) ? (
                        <span className="text-primary ml-2 text-xs">chain</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No linked studios yet.</p>
              )}
              {profile.chainPeers.length > 1 ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  {profile.chainPeers
                    .filter((p) => p.businessId !== bid)
                    .map((p) => (
                      <Button
                        key={p.businessId}
                        size="sm"
                        variant="secondary"
                        onClick={() => void transferMemory(p.businessId)}
                        disabled={busy}
                      >
                        Transfer memory → {p.name ?? p.slug}
                      </Button>
                    ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {floatRoster && floatRoster.staff.length ? (
        <Card data-testid="vault-float-roster">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Float roster</CardTitle>
            <CardDescription>{floatRoster.note}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2">
              {floatRoster.staff.map((r) => (
                <li key={r.id}>
                  {r.displayName ?? "Staff"} — {r.siteName}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <Link href="/wellness-reports" className="text-sm text-primary">
        ← Reports
      </Link>
    </div>
  );
}
