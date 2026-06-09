import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

type CommerceAlertRow = {
  businessId: string;
  shopName: string;
  severity: "act" | "watch";
  code: string;
  message: string;
  href: string;
};

export function ChainCommercePanel({
  commerceAlerts,
  commerceSummary,
}: {
  commerceAlerts?: CommerceAlertRow[];
  commerceSummary?: {
    totalCapturedMinor30d: number;
    shopsWithActSignal: number;
    shopsWithWatchSignal: number;
  };
}) {
  if (!commerceAlerts?.length && !commerceSummary?.shopsWithActSignal) return null;

  return (
    <Card className="border-primary/15" data-testid="chain-commerce-panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Portfolio commerce
        </CardTitle>
        <CardDescription>
          {commerceSummary
            ? `${commerceSummary.shopsWithActSignal} act · ${commerceSummary.shopsWithWatchSignal} watch across locations`
            : "Revenue signals by location"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {(commerceAlerts ?? []).slice(0, 5).map((a) => (
          <div key={`${a.businessId}-${a.code}`} className="flex items-start justify-between gap-2 text-sm">
            <div className="min-w-0">
              <Badge variant={a.severity === "act" ? "destructive" : "secondary"} className="mr-2">
                {a.severity}
              </Badge>
              <span>{a.message}</span>
            </div>
            <Button size="sm" variant="ghost" className="shrink-0 h-8" asChild>
              <Link href={a.href}>Billing</Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
