import { ExternalLink, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CROSS_SURFACE_WEB_COPY,
  mobileOnboardingSetupUrl,
} from "@/lib/cross-surface-urls";

type Props = {
  className?: string;
};

/** Onboarding wizard — hand off to native app without losing business row progress. */
export function CrossSurfaceContinueCard({ className }: Props) {
  const deepLink = mobileOnboardingSetupUrl();

  return (
    <Card className={className} data-testid="cross-surface-continue-mobile">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-primary" aria-hidden />
          {CROSS_SURFACE_WEB_COPY.continueOnMobileTitle}
        </CardTitle>
        <CardDescription>{CROSS_SURFACE_WEB_COPY.continueOnMobileBody}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button variant="outline" size="sm" asChild>
          <a href={deepLink}>
            Open Livia app
            <ExternalLink className="ml-2 h-3.5 w-3.5" aria-hidden />
          </a>
        </Button>
        <p className="text-xs text-muted-foreground font-mono">{deepLink}</p>
      </CardContent>
    </Card>
  );
}
