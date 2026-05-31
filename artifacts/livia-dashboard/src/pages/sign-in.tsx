import { useEffect, useState } from "react";
import { Link } from "wouter";
import { SignIn } from "@clerk/clerk-react";
import { useTheme } from "next-themes";
import { ChevronDown } from "lucide-react";
import { LiviaWordmark } from "@/components/brand/LiviaMark";
import { DemoPasswordSignIn } from "@/components/demo-password-sign-in";
import { fetchDemoCatalog } from "@/lib/demo-portal";
import { isDemoLoginEnabled } from "@/lib/persona";
import { clerkGatewayAppearance } from "@/lib/clerk-gateway-appearance";
import { getMarketingOrigin } from "@/lib/surface-urls";

export default function SignInPage() {
  const { theme } = useTheme();
  const [devPassword, setDevPassword] = useState<string | undefined>();
  const marketing = getMarketingOrigin();

  useEffect(() => {
    if (!isDemoLoginEnabled) return;
    fetchDemoCatalog()
      .then((c) => setDevPassword(c.devPassword))
      .catch(() => undefined);
  }, []);

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-aurora-cyan/10 blur-[140px]" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-6">
        <a href={marketing} className="opacity-90 hover:opacity-100 transition-opacity">
          <LiviaWordmark size="md" />
        </a>
        <a
          href={`${marketing}/#waitlist`}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[44px] inline-flex items-center"
        >
          Join beta
        </a>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center sm:text-left">
            <h1 className="font-serif text-4xl md:text-[2.75rem] font-normal leading-[1.08] tracking-tight">
              Your day,
              <span className="block mt-1 italic text-muted-foreground/90">already handled.</span>
            </h1>
            <p className="mt-3 text-sm text-aurum-champagne/80 font-serif italic">Her name is Liv.</p>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card/30 p-1 backdrop-blur-sm">
            <SignIn
              appearance={clerkGatewayAppearance(theme)}
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              fallbackRedirectUrl="/dashboard"
            />
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            New here?{" "}
            <a href="/sign-up" className="font-medium text-primary underline underline-offset-2">
              Create an account
            </a>
          </p>

          {isDemoLoginEnabled ? (
            <details className="mt-6 group rounded-xl border border-dashed border-border/70 bg-muted/10 open:bg-muted/20 transition-colors">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
                <span>Staging demo access</span>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-border/40 px-4 pb-4 pt-3">
                <DemoPasswordSignIn devPasswordHint={devPassword} embedded />
              </div>
            </details>
          ) : null}
        </div>
      </main>
    </div>
  );
}
