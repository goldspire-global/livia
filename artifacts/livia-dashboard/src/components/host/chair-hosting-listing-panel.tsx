import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Megaphone } from "lucide-react";
import { customFetch } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { CHAIR_HOSTING_COPY, type ChairHostingListing } from "@workspace/policy";
import { formatCurrency } from "@/lib/format";

export function ChairHostingListingPanel({ businessId, currency }: { businessId: string; currency: string }) {
  const { toast } = useToast();
  const [listing, setListing] = useState<ChairHostingListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [amenitiesText, setAmenitiesText] = useState("");
  const [weeklyMajor, setWeeklyMajor] = useState("");

  async function load() {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await customFetch<ChairHostingListing>(`/api/businesses/${businessId}/host/listing`);
      setListing(data);
      setAmenitiesText(data.amenities.join(", "));
      setWeeklyMajor(data.weeklyRateMinor > 0 ? String(data.weeklyRateMinor / 100) : "");
    } catch {
      setListing(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [businessId]);

  async function save() {
    if (!listing || !businessId) return;
    setSaving(true);
    try {
      const weeklyRateMinor = weeklyMajor ? Math.round(parseFloat(weeklyMajor) * 100) : 0;
      const amenities = amenitiesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const next = await customFetch<ChairHostingListing>(`/api/businesses/${businessId}/host/listing`, {
        method: "PATCH",
        body: JSON.stringify({
          ...listing,
          weeklyRateMinor,
          amenities,
        }),
      });
      setListing(next);
      toast({ title: "Chair listing saved" });
    } catch (e) {
      toast({
        title: "Could not save",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Skeleton className="h-48 w-full" />;
  if (!listing) return null;

  return (
    <Card data-testid="chair-hosting-listing-panel">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Megaphone className="h-4 w-4" />
          {CHAIR_HOSTING_COPY.hostPanelTitle}
        </CardTitle>
        <CardDescription>{CHAIR_HOSTING_COPY.hostPanelBody}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="chair-enabled">Show on public book page</Label>
          <Switch
            id="chair-enabled"
            checked={listing.enabled}
            onCheckedChange={(enabled) => setListing({ ...listing, enabled })}
          />
        </div>
        <div className="space-y-2">
          <Label>Headline</Label>
          <Input
            value={listing.headline}
            onChange={(e) => setListing({ ...listing, headline: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            rows={3}
            value={listing.body}
            onChange={(e) => setListing({ ...listing, body: e.target.value })}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Chairs available</Label>
            <Input
              type="number"
              min={1}
              value={listing.chairsAvailable}
              onChange={(e) =>
                setListing({ ...listing, chairsAvailable: Math.max(1, Number(e.target.value) || 1) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Weekly rate ({currency})</Label>
            <Input
              type="number"
              placeholder="175"
              value={weeklyMajor}
              onChange={(e) => setWeeklyMajor(e.target.value)}
            />
            {listing.weeklyRateMinor > 0 ? (
              <p className="text-xs text-muted-foreground">
                Preview: {formatCurrency(listing.weeklyRateMinor, currency)}/week
              </p>
            ) : null}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Amenities (comma-separated)</Label>
          <Input
            placeholder="WiFi, towels, backwash"
            value={amenitiesText}
            onChange={(e) => setAmenitiesText(e.target.value)}
          />
        </div>
        <Button onClick={() => void save()} disabled={saving}>
          {saving ? "Saving…" : "Save listing"}
        </Button>
      </CardContent>
    </Card>
  );
}
