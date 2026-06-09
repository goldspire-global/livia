import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useBusiness } from "@/lib/business-context";
import { useListServices } from "@workspace/api-client-react";
import { apiFetch } from "@/lib/api-fetch";
import { OperationalPageShell } from "@/components/layout/operational-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CalendarPlus, ScanLine, Tv } from "lucide-react";
import { BeautyStationCompass } from "@/components/beauty/beauty-station-compass";
import { useOperationalChrome } from "@/lib/operational-chrome";
import { beautyPrimaryButton } from "@/lib/beauty-operational-ui";
import { cn } from "@/lib/utils";
import { inboxFloorGuidance } from "@workspace/policy";

export default function BeautyReceptionPage() {
  const { business } = useBusiness();
  const { toast } = useToast();
  const bid = business?.id ?? "";
  const vertical = (business as { vertical?: string } | null)?.vertical;
  const op = useOperationalChrome(vertical);
  const [serviceId, setServiceId] = useState("");
  const [walkInMsg, setWalkInMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [patchBanner, setPatchBanner] = useState<string | null>(null);

  const { data: services } = useListServices(
    bid,
    { isActive: true },
    { query: { enabled: !!bid } as never },
  );
  const svcList = (services as { id: string; name: string; requiresPatchTest?: boolean }[]) ?? [];

  useEffect(() => {
    if (svcList.length && !serviceId) setServiceId(svcList[0]!.id);
  }, [svcList, serviceId]);

  const floorCopy = inboxFloorGuidance("receptionist");

  async function proposeWalkIn() {
    if (!bid || !serviceId) return;
    setBusy(true);
    try {
      const r = await apiFetch<{ ok: boolean; message: string; bookUrl?: string }>(
        `/api/businesses/${bid}/beauty/walk-in`,
        { method: "POST", body: JSON.stringify({ serviceId }) },
      );
      setWalkInMsg(r.message);
      if (r.ok && r.bookUrl) {
        toast({ title: "Walk-in slot found", description: r.message });
      }
    } catch {
      setWalkInMsg("No slot found today — try tomorrow or add to waitlist.");
    } finally {
      setBusy(false);
    }
  }

  async function checkPatchTest() {
    if (!bid || !clientSearch.trim()) return;
    setBusy(true);
    setPatchBanner(null);
    try {
      const res = await apiFetch<{ data: Array<{ id: string; displayName: string; patchTestCompletedAt?: string | null }> }>(
        `/api/businesses/${bid}/customers?search=${encodeURIComponent(clientSearch.trim())}&limit=5`,
      );
      const hit = res.data?.[0];
      if (!hit) {
        setPatchBanner("No client found — create on the floor calendar.");
        return;
      }
      if (!hit.patchTestCompletedAt) {
        setPatchBanner(`${hit.displayName} — no patch test on file. Book patch test before lash or tint.`);
      } else {
        const d = new Date(hit.patchTestCompletedAt).toLocaleDateString();
        setPatchBanner(`${hit.displayName} — patch test ${d}. Clear to book colour services.`);
      }
    } catch {
      setPatchBanner("Could not look up client.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <OperationalPageShell
      title="Front desk"
      subtitle={floorCopy?.body ?? "Walk-ins on the floor calendar — inbox is for messages and missed calls."}
      width="full"
      data-testid="beauty-reception-page"
      actions={
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/beauty-tv">
              <Tv className="h-4 w-4 mr-1" aria-hidden />
              TV mode
            </Link>
          </Button>
          <Button asChild size="sm" className={beautyPrimaryButton(op.beauty)}>
            <Link href="/bookings?create=1">
              <CalendarPlus className="h-4 w-4 mr-1" aria-hidden />
              Add booking
            </Link>
          </Button>
        </div>
      }
    >
      <div className="beauty-reception-desk grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-6">
          <Card className={cn(op.beauty && "beauty-operational-panel")}>
            <CardHeader>
              <CardTitle className="text-base">Walk-in routing</CardTitle>
              <CardDescription>{floorCopy?.body ?? "Propose the next open chair for a walk-in."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Service</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                >
                  {svcList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="button"
                disabled={busy || !serviceId}
                className={beautyPrimaryButton(op.beauty)}
                onClick={() => void proposeWalkIn()}
              >
                Find next chair
              </Button>
              {walkInMsg ? <p className="text-sm text-muted-foreground">{walkInMsg}</p> : null}
            </CardContent>
          </Card>

          <Card className={cn(op.beauty && "beauty-operational-panel")}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ScanLine className="h-4 w-4" aria-hidden />
                Patch-test check
              </CardTitle>
              <CardDescription>Search before booking lash or tint at the desk.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Name, email, or phone"
                  onKeyDown={(e) => e.key === "Enter" && void checkPatchTest()}
                />
                <Button type="button" variant="outline" disabled={busy} onClick={() => void checkPatchTest()}>
                  Check
                </Button>
              </div>
              {patchBanner ? (
                <p
                  className={cn(
                    "text-sm flex items-start gap-2 rounded-lg px-3 py-2",
                    patchBanner.includes("no patch test")
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted/50 text-muted-foreground",
                  )}
                >
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                  {patchBanner}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {bid ? <BeautyStationCompass businessId={bid} beauty={op.beauty} /> : null}
          <Card className={cn(op.beauty && "beauty-operational-panel")}>
            <CardHeader>
              <CardTitle className="text-base">Floor calendar</CardTitle>
              <CardDescription>Walk-ins live on the schedule — not in inbox threads.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/bookings">Open schedule</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </OperationalPageShell>
  );
}
