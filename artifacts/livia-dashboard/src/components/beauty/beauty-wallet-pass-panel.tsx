import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-fetch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

type WalletMeta = {
  visitUrl: string;
  serviceName: string;
  startAt: string;
  message: string;
};

export function BeautyWalletPassPanel({
  businessId,
  bookingId,
}: {
  businessId: string;
  bookingId: string;
}) {
  const [meta, setMeta] = useState<WalletMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId || !bookingId) return;
    void apiFetch<WalletMeta>(`/api/businesses/${businessId}/beauty/wallet-pass/${bookingId}`)
      .then(setMeta)
      .catch(() => setMeta(null))
      .finally(() => setLoading(false));
  }, [businessId, bookingId]);

  if (loading || !meta) return null;

  return (
    <Card data-testid="beauty-wallet-pass-panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" aria-hidden />
          Visit reminder
        </CardTitle>
        <CardDescription>{meta.message}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <a href={meta.visitUrl} target="_blank" rel="noopener noreferrer">
            Open visit page
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
