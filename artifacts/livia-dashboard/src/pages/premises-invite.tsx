import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { useBusiness } from "@/lib/business-context";
import { customFetch } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Building2 } from "lucide-react";

export default function PremisesInvitePage() {
  const [, params] = useRoute("/premises/invite/:token");
  const token = params?.token ?? "";
  const { business } = useBusiness();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) return;
  }, [token]);

  async function accept() {
    if (!token || !business?.id) return;
    setBusy(true);
    try {
      await customFetch(`/api/premises/invites/${token}/accept`, {
        method: "POST",
        body: JSON.stringify({ businessId: business.id }),
      });
      toast({
        title: "Premises linked",
        description: "Your business now appears on the shared address page.",
      });
      setDone(true);
    } catch (e) {
      toast({
        title: "Could not accept invite",
        description: e instanceof Error ? e.message : "Invite may be expired",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Shared premises invite
          </CardTitle>
          <CardDescription>
            Link <strong>{business?.name ?? "your business"}</strong> to a building another owner
            manages — separate clients and data, one customer-facing address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {done ? (
            <Link href="/premises">
              <Button>Open shared premises</Button>
            </Link>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Accepting adds your shop to their unified booking page. You keep your own tenant,
                inbox, and GDPR boundary.
              </p>
              <Button disabled={busy || !business?.id} onClick={() => void accept()}>
                {busy ? "Linking…" : "Accept and link my business"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
