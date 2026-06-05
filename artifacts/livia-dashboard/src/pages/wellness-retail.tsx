import { Link } from "wouter";
import { useBusiness } from "@/lib/business-context";
import { OperationalPageShell } from "@/components/layout/operational-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  WELLNESS_DEMO_RETAIL_SKUS,
  WELLNESS_RETAIL_PROGRAM,
  buildWellnessPostSessionInboxDraft,
} from "@workspace/policy";
import { formatCurrency } from "@/lib/format";

export default function WellnessRetailPage() {
  const { business } = useBusiness();
  const draftPreview = buildWellnessPostSessionInboxDraft({ skuName: "Harbour Calm body oil" });
  const inboxHref = `/inbox?flow=post_session&sku=harbour-calm-oil`;

  return (
    <OperationalPageShell
      title={WELLNESS_RETAIL_PROGRAM.title}
      subtitle={WELLNESS_RETAIL_PROGRAM.subtitle}
      width="lg"
      data-testid="wellness-retail-page"
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Take-home catalogue (demo)</CardTitle>
          <CardDescription>{WELLNESS_RETAIL_PROGRAM.note}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-sm divide-y">
            {WELLNESS_DEMO_RETAIL_SKUS.map((sku) => (
              <li
                key={sku.id}
                className="flex justify-between gap-4 py-2.5 first:pt-0"
                data-testid={`wellness-retail-sku-${sku.id}`}
              >
                <div className="min-w-0">
                  <p className="font-medium">{sku.name}</p>
                  <p className="text-xs text-muted-foreground">{sku.description}</p>
                </div>
                <p className="text-sm font-medium tabular-nums shrink-0">
                  {formatCurrency(sku.priceMinor, sku.currency)}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card data-testid="wellness-retail-continuity">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">After checkout — send continuity thread</CardTitle>
          <CardDescription>{WELLNESS_RETAIL_PROGRAM.inboxFlowHint}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
            {draftPreview.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className="rounded-lg border bg-muted/30 px-3 py-2.5 text-muted-foreground whitespace-pre-wrap text-xs leading-relaxed">
            {draftPreview.body}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href={inboxHref}>{WELLNESS_RETAIL_PROGRAM.inboxActionLabel}</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/wellness-reception">Mention at reception instead</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {business?.slug ? (
        <p className="text-xs text-muted-foreground">
          Guest-facing shop checkout lands in Ring 2 — today retail is continuity + desk handoff.
        </p>
      ) : null}
    </OperationalPageShell>
  );
}
