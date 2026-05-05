import { useEffect } from "react";
import { useBusiness } from "@/lib/business-context";
import {
  useGetBusiness,
  getGetBusinessQueryKey,
  useUpdateBusiness,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Copy, ExternalLink, Globe } from "lucide-react";
import { useForm } from "react-hook-form";

interface SettingsForm {
  name: string;
  slug: string;
  timezone: string;
  phone: string;
  city: string;
  country: string;
  description: string;
  instagramHandle: string;
}

export default function SettingsPage() {
  const { business } = useBusiness();
  const { toast } = useToast();
  const qc = useQueryClient();

  const bid = business?.id ?? "";

  const { data: biz, isLoading } = useGetBusiness(
    bid,
    { query: { enabled: !!bid } as any }
  );

  const updateBusiness = useUpdateBusiness();
  const { register, handleSubmit, reset } = useForm<SettingsForm>();

  useEffect(() => {
    if (biz) {
      const b = biz as any;
      reset({
        name: b.name ?? "",
        slug: b.slug ?? "",
        timezone: b.timezone ?? "Europe/London",
        phone: b.phone ?? "",
        city: b.city ?? "",
        country: b.country ?? "",
        description: b.description ?? "",
        instagramHandle: b.instagramHandle ?? "",
      });
    }
  }, [biz, reset]);

  function onSubmit(vals: SettingsForm) {
    if (!bid) return;
    updateBusiness.mutate(
      { businessId: bid, data: vals },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getGetBusinessQueryKey(bid) });
          toast({ title: "Settings saved" });
        },
        onError: () => toast({ title: "Failed to save settings", variant: "destructive" }),
      }
    );
  }

  const b = biz as any;
  const bookingUrl = b ? `${window.location.origin}/b/${b.slug}` : "";

  function copyLink() {
    if (!bookingUrl) return;
    navigator.clipboard.writeText(bookingUrl);
    toast({ title: "Booking link copied" });
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your business profile</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-96" />
        </div>
      ) : (
        <>
          {b && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="h-4 w-4" />
                  Public Booking Link
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 bg-muted rounded-md px-3 py-2 text-sm font-mono truncate"
                    data-testid="text-booking-url"
                  >
                    {bookingUrl}
                  </div>
                  <Button variant="outline" size="icon" onClick={copyLink} data-testid="button-copy-link">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" data-testid="button-open-link">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="h-4 w-4" />
                Business Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Business Name *</Label>
                  <Input
                    {...register("name", { required: true })}
                    data-testid="input-business-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL Slug *</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">/b/</span>
                    <Input
                      {...register("slug", { required: true })}
                      data-testid="input-slug"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Your public booking URL identifier</p>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input {...register("description")} data-testid="input-description" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input {...register("phone")} data-testid="input-phone" />
                  </div>
                  <div className="space-y-2">
                    <Label>Instagram</Label>
                    <Input {...register("instagramHandle")} placeholder="@handle" data-testid="input-instagram" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input {...register("city")} data-testid="input-city" />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input {...register("country")} data-testid="input-country" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Input
                    {...register("timezone")}
                    placeholder="e.g. America/New_York"
                    data-testid="input-timezone"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={updateBusiness.isPending}
                  className="w-full"
                  data-testid="button-save-settings"
                >
                  {updateBusiness.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
