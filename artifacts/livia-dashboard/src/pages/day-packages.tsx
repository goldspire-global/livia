import { useEffect, useState } from "react";
import { useBusiness } from "@/lib/business-context";
import { useListServices } from "@workspace/api-client-react";
import { customFetch } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PersonaRitualHeader } from "@/components/ritual/persona-ritual-header";
import { PageFrame } from "@/components/ui/page-frame";
import { VerticalPackBanner } from "@/components/vertical-pack-banner";
import { careProgrammesPageCopy } from "@/lib/vertical-page-copy";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/format";
import { Sparkles } from "lucide-react";

type DayPackage = {
  id: string;
  name: string;
  totalDurationMinutes: number;
  priceMinor: number;
  currency: string;
  steps: Array<{ sequence: number; serviceId: string; durationMinutes: number; label: string | null }>;
};

export default function DayPackagesPage() {
  const { business } = useBusiness();
  const { toast } = useToast();
  const [packages, setPackages] = useState<DayPackage[]>([]);
  const [loadingPkgs, setLoadingPkgs] = useState(true);
  const [name, setName] = useState("");
  const [stepServiceId, setStepServiceId] = useState("");
  const [stepDuration, setStepDuration] = useState("60");
  const [saving, setSaving] = useState(false);

  const bid = business?.id ?? "";
  const { data: services, isLoading: loadingServices } = useListServices(
    bid,
    { isActive: true },
    { query: { enabled: !!bid } as never },
  );

  async function reload() {
    if (!bid) return;
    setLoadingPkgs(true);
    try {
      setPackages(await customFetch<DayPackage[]>(`/api/businesses/${bid}/day-packages`));
    } catch {
      setPackages([]);
    } finally {
      setLoadingPkgs(false);
    }
  }

  useEffect(() => {
    void reload();
  }, [bid]);

  useEffect(() => {
    if (services?.length && !stepServiceId) {
      setStepServiceId(services[0].id);
      setStepDuration(String(services[0].durationMinutes ?? 60));
    }
  }, [services, stepServiceId]);

  async function handleCreate() {
    if (!bid || !name.trim() || !stepServiceId) return;
    setSaving(true);
    try {
      await customFetch(`/api/businesses/${bid}/day-packages`, {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          steps: [
            {
              serviceId: stepServiceId,
              durationMinutes: Number.parseInt(stepDuration, 10) || 60,
              bufferAfterMinutes: 15,
            },
          ],
        }),
      });
      toast({ title: "Day package created", description: "Customers can book the full ritual as one flow." });
      setName("");
      void reload();
    } catch {
      toast({ title: "Create failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const vertical = (business as { vertical?: string } | null)?.vertical;
  const pageCopy = careProgrammesPageCopy(vertical, business?.category);

  return (
    <PageFrame>
      <PersonaRitualHeader
        variant="page"
        title={pageCopy.title}
        subtitle={pageCopy.subtitle}
      />
      <div className="flex flex-wrap items-center gap-2 -mt-4 mb-2">
        <VerticalPackBanner />
        {vertical === "wellness" || vertical === "medspa" ? (
          <p className="text-xs text-muted-foreground">
            Demo packages are seeded on wellness/medspa tenants — create your first programme below.
          </p>
        ) : vertical === "allied-health" ? (
          <p className="text-xs text-muted-foreground">
            Bundle treatment plans for patients — e.g. physio block bookings or multi-visit rehab programmes.
          </p>
        ) : null}
      </div>

      <Card className="hover-elevate">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            New package
          </CardTitle>
          <CardDescription>
            Pick a service for the first step — add more steps in settings once the package exists.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 sm:col-span-2">
            <Label>Package name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Harbour Day Escape"
            />
          </div>
          <div className="space-y-2">
            <Label>First step service</Label>
            {loadingServices ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={stepServiceId}
                onValueChange={(id) => {
                  setStepServiceId(id);
                  const svc = services?.find((s) => s.id === id);
                  if (svc?.durationMinutes) setStepDuration(String(svc.durationMinutes));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {(services ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.durationMinutes} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2">
            <Label>Step duration (min)</Label>
            <Input
              type="number"
              min={15}
              value={stepDuration}
              onChange={(e) => setStepDuration(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <Button
              className="w-fit"
              disabled={saving || !name.trim() || !stepServiceId}
              onClick={() => void handleCreate()}
            >
              {saving ? "Creating…" : "Create package"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loadingPkgs ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      ) : packages.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {vertical === "wellness" || vertical === "medspa"
              ? "No packages yet — ideal for half-day spa rituals and thermal + treatment combos."
              : "Day packages work best for wellness and spa verticals. Switch to Harbour Wellness in the demo to see a seeded example."}
          </CardContent>
        </Card>
      ) : (
        packages.map((p) => (
          <Card key={p.id} className="hover-elevate transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">{p.name}</CardTitle>
              <CardDescription>
                {p.totalDurationMinutes} min total · {p.steps.length} step(s)
                {p.priceMinor > 0
                  ? ` · ${formatCurrency(p.priceMinor, p.currency)}`
                  : null}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {p.steps.map((s) => (
                <div
                  key={s.sequence}
                  className="flex items-center gap-3 text-sm border rounded-md px-3 py-2 bg-muted/20"
                >
                  <span className="font-mono text-xs text-muted-foreground w-5">{s.sequence}</span>
                  <span>{s.label ?? "Step"}</span>
                  <span className="text-muted-foreground ml-auto">{s.durationMinutes} min</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}

      {vertical === "wellness" ? (
        <WellnessPackageCreditsPanel businessId={bid} />
      ) : null}
    </PageFrame>
  );
}

type PackageCreditRow = {
  id: string;
  customerId: string;
  packageName: string;
  creditsTotal: number;
  creditsRemaining: number;
  expiresAt?: string | null;
};

function WellnessPackageCreditsPanel({ businessId }: { businessId: string }) {
  const { toast } = useToast();
  const [rows, setRows] = useState<PackageCreditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState("");
  const [packageName, setPackageName] = useState("");
  const [creditsTotal, setCreditsTotal] = useState("6");
  const [customers, setCustomers] = useState<Array<{ id: string; displayName?: string | null; firstName?: string | null; lastName?: string | null }>>([]);

  async function reload() {
    if (!businessId) return;
    setLoading(true);
    try {
      const [credits, cust] = await Promise.all([
        customFetch<PackageCreditRow[]>(`/api/businesses/${businessId}/package-credits`),
        customFetch<{ data: typeof customers }>(`/api/businesses/${businessId}/customers?limit=50`),
      ]);
      setRows(credits);
      setCustomers(Array.isArray(cust) ? cust : (cust as { data?: typeof customers }).data ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, [businessId]);

  async function handleGrant() {
    if (!businessId || !customerId || !packageName.trim()) return;
    try {
      await customFetch(`/api/businesses/${businessId}/package-credits`, {
        method: "POST",
        body: JSON.stringify({
          customerId,
          packageName: packageName.trim(),
          creditsTotal: Number.parseInt(creditsTotal, 10) || 1,
        }),
      });
      toast({ title: "Prepaid balance recorded", description: "Guest can use sessions until the balance runs out." });
      setPackageName("");
      void reload();
    } catch {
      toast({ title: "Grant failed", variant: "destructive" });
    }
  }

  function customerLabel(c: (typeof customers)[0]) {
    return (
      c.displayName ||
      [c.firstName, c.lastName].filter(Boolean).join(" ").trim() ||
      c.id.slice(0, 8)
    );
  }

  return (
    <Card className="mt-8 border-primary/20" data-testid="wellness-package-credits">
      <CardHeader>
        <CardTitle className="text-base">Prepaid sessions & gift vouchers</CardTitle>
        <CardDescription className="max-w-2xl space-y-2">
          <span className="block">
            Not the same as <strong className="font-medium text-foreground">day itineraries</strong> above —
            this is what guests <em>already paid for</em> (a six-session series, a 90‑min gift voucher, a couples
            bundle).
          </span>
          <span className="block text-muted-foreground">
            Record a sale here so front desk and Today can see how many sessions are still owed. Summary totals
            also appear on Today when you use the evening-ledger home layout.
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Skeleton className="h-20 w-full" />
        ) : rows.length ? (
          <ul className="space-y-2 text-sm" aria-label="Active prepaid balances">
            {rows.map((r) => (
              <li key={r.id} className="flex justify-between border rounded-md px-3 py-2">
                <span>
                  {r.packageName}{" "}
                  <span className="text-muted-foreground">
                    · {r.creditsRemaining} of {r.creditsTotal} sessions remaining
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No prepaid balances yet — record a series or voucher sale below (demo tenants may already have seeded
            examples).
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-3 border-t pt-4">
          <div className="space-y-2 sm:col-span-1">
            <Label>Guest</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select guest" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {customerLabel(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>What they bought</Label>
            <Input
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              placeholder="e.g. Six-session massage series"
            />
          </div>
          <div className="space-y-2">
            <Label>Sessions included</Label>
            <Input type="number" min={1} value={creditsTotal} onChange={(e) => setCreditsTotal(e.target.value)} />
          </div>
        </div>
        <Button size="sm" onClick={() => void handleGrant()} disabled={!customerId || !packageName.trim()}>
          Record sale
        </Button>
      </CardContent>
    </Card>
  );
}
