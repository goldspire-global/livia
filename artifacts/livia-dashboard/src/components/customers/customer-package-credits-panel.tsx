import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@workspace/api-client-react";

type PackageCreditRow = {
  id: string;
  packageName: string;
  creditsRemaining: number;
  creditsTotal: number;
  expiresAt?: string | null;
};

type Props = {
  businessId: string;
  customerId: string;
  canEdit?: boolean;
};

export function CustomerPackageCreditsPanel({ businessId, customerId, canEdit = false }: Props) {
  const { toast } = useToast();
  const [rows, setRows] = useState<PackageCreditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [packageName, setPackageName] = useState("");
  const [creditsTotal, setCreditsTotal] = useState("6");
  const [busy, setBusy] = useState(false);

  async function reload() {
    if (!businessId || !customerId) return;
    setLoading(true);
    try {
      const data = await customFetch<PackageCreditRow[]>(
        `/api/businesses/${businessId}/package-credits?customerId=${encodeURIComponent(customerId)}`,
      );
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, [businessId, customerId]);

  async function grant() {
    if (!packageName.trim()) return;
    setBusy(true);
    try {
      await customFetch(`/api/businesses/${businessId}/package-credits`, {
        method: "POST",
        body: JSON.stringify({
          customerId,
          packageName: packageName.trim(),
          creditsTotal: Number.parseInt(creditsTotal, 10) || 1,
        }),
      });
      toast({ title: "Prepaid balance recorded" });
      setPackageName("");
      await reload();
    } catch {
      toast({ title: "Could not record balance", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  async function burn(ledgerId: string) {
    setBusy(true);
    try {
      await customFetch(`/api/businesses/${businessId}/package-credits/${ledgerId}/burn`, {
        method: "POST",
        body: JSON.stringify({ amount: 1 }),
      });
      toast({ title: "Session redeemed" });
      await reload();
    } catch {
      toast({ title: "Redeem failed", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Skeleton className="h-24 w-full" />;

  return (
    <Card data-testid="customer-package-credits">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Prepaid sessions & packs</CardTitle>
        <CardDescription>Balances owed to this guest — visible on guest hub when signed in.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length ? (
          <ul className="space-y-2 text-sm">
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
              >
                <span>
                  {r.packageName}{" "}
                  <span className="text-muted-foreground">
                    {r.creditsRemaining}/{r.creditsTotal} left
                  </span>
                </span>
                {canEdit && r.creditsRemaining > 0 ? (
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => void burn(r.id)}>
                    Redeem 1
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No prepaid balance on file.</p>
        )}
        {canEdit ? (
          <div className="grid gap-2 border-t pt-3 sm:grid-cols-3">
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs">Package name</Label>
              <Input
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder="e.g. Six-session series"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Sessions</Label>
              <Input value={creditsTotal} onChange={(e) => setCreditsTotal(e.target.value)} />
            </div>
            <Button className="sm:col-span-3" disabled={busy || !packageName.trim()} onClick={() => void grant()}>
              Record prepaid balance
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
