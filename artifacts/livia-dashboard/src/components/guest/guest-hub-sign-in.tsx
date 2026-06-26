import { useEffect, type ReactNode } from "react";
import { Loader2, Shield, Sparkles } from "lucide-react";
import { LiviaLogoLink } from "@/components/brand/livia-logo-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicSurfaceFooter } from "@/components/public/public-surface-chrome";
import { GUEST_HUB_COPY } from "@workspace/policy";
import { cn } from "@/lib/utils";
import {
  applyGuestHubPlatformTheme,
  clearGuestHubPlatformTheme,
} from "@/lib/experience-theme";

function StepIndicator({ step, authMethod }: { step: 1 | 2; authMethod: "phone" | "email" }) {
  const label = authMethod === "email" ? "Email" : "Phone";
  return (
    <div
      className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest"
      role="group"
      aria-label="Sign-in progress"
    >
      <span
        className={cn(
          "px-2 py-1 rounded-full",
          step === 1 ? "bg-primary/15 text-primary" : "text-muted-foreground",
        )}
      >
        1 · {label}
      </span>
      <span className="text-muted-foreground/50" aria-hidden>
        →
      </span>
      <span
        className={cn(
          "px-2 py-1 rounded-full",
          step === 2 ? "bg-primary/15 text-primary" : "text-muted-foreground",
        )}
      >
        2 · Code
      </span>
    </div>
  );
}

export function GuestHubSignIn({
  authMethod,
  onAuthMethodChange,
  phone,
  onPhoneChange,
  email,
  onEmailChange,
  phonePlaceholder,
  code,
  onCodeChange,
  otpSession,
  busy,
  resendSec,
  err,
  stagingRelaxed,
  stagingHint,
  devOtp,
  magicOtp,
  onRequestOtp,
  onVerifyOtp,
  onChangeIdentifier,
}: {
  authMethod: "phone" | "email";
  onAuthMethodChange: (m: "phone" | "email") => void;
  phone: string;
  onPhoneChange: (v: string) => void;
  email: string;
  onEmailChange: (v: string) => void;
  phonePlaceholder: string;
  code: string;
  onCodeChange: (v: string) => void;
  otpSession: string | null;
  busy: boolean;
  resendSec: number;
  err: string | null;
  stagingRelaxed: boolean;
  stagingHint?: ReactNode;
  devOtp: string | null;
  magicOtp: string | null;
  onRequestOtp: () => void;
  onVerifyOtp: () => void;
  onChangeIdentifier: () => void;
}) {
  const step: 1 | 2 = otpSession ? 2 : 1;
  const identifier = authMethod === "email" ? email : phone;

  useEffect(() => {
    applyGuestHubPlatformTheme();
    return () => clearGuestHubPlatformTheme();
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col bg-background guest-hub-shell guest-hub-platform"
      data-testid="guest-hub-sign-in"
    >
      <div className="flex-1 grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="hidden lg:flex flex-col justify-between border-r border-border/60 bg-gradient-to-br from-primary/10 via-background to-background p-10 xl:p-14">
          <div>
            <LiviaLogoLink size="md" className="opacity-90" home="marketing" />
            <p className="text-[10px] uppercase tracking-widest font-mono text-primary mt-8">
              {GUEST_HUB_COPY.productName}
            </p>
            <h1 className="text-4xl xl:text-5xl font-serif tracking-tight mt-4 max-w-lg leading-tight">
              {GUEST_HUB_COPY.tagline}
            </h1>
            <p className="text-muted-foreground mt-4 max-w-md text-base leading-relaxed">
              {GUEST_HUB_COPY.signInBody}
            </p>
          </div>
          <ul className="space-y-4 max-w-md text-sm text-muted-foreground">
            <li className="flex gap-3">
              <Shield className="h-5 w-5 text-primary shrink-0" />
              <span>{GUEST_HUB_COPY.signInBulletSingleSignIn}</span>
            </li>
            <li className="flex gap-3">
              <Sparkles className="h-5 w-5 text-primary shrink-0" />
              <span>{GUEST_HUB_COPY.signInBulletHistory}</span>
            </li>
          </ul>
        </section>

        <section className="flex flex-col justify-center px-4 py-10 sm:px-8 lg:px-12 xl:px-16">
          <div className="w-full max-w-md mx-auto space-y-6">
            <div className="lg:hidden text-center space-y-3">
              <LiviaLogoLink size="md" className="mx-auto opacity-90" home="marketing" />
              <p className="text-[10px] uppercase tracking-widest font-mono text-primary">
                {GUEST_HUB_COPY.productName}
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-serif">
                {authMethod === "email" ? GUEST_HUB_COPY.signInTitleEmail : GUEST_HUB_COPY.signInTitle}
              </h2>
              <p className="text-sm text-muted-foreground lg:hidden">
                {authMethod === "email" ? GUEST_HUB_COPY.signInBodyEmail : GUEST_HUB_COPY.signInBody}
              </p>
              <p className="text-xs text-muted-foreground">{GUEST_HUB_COPY.signInBodyColdStart}</p>
              <div className="flex gap-2 pt-1" role="tablist" aria-label="Sign-in method">
                {(["phone", "email"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={authMethod === m}
                    disabled={Boolean(otpSession)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors min-h-[36px]",
                      authMethod === m
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground",
                    )}
                    onClick={() => onAuthMethodChange(m)}
                    data-testid={m === "phone" ? "guest-hub-auth-phone" : "guest-hub-auth-email"}
                  >
                    {m === "phone" ? GUEST_HUB_COPY.signInMethodPhone : GUEST_HUB_COPY.signInMethodEmail}
                  </button>
                ))}
              </div>
              <StepIndicator step={step} authMethod={authMethod} />
            </div>

            {stagingRelaxed && stagingHint ? stagingHint : null}

            {!otpSession ? (
              <Card className="border-primary/15 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {authMethod === "email" ? "Your email" : "Your mobile number"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {authMethod === "email" ? (
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => onEmailChange(e.target.value)}
                      data-testid="guest-hub-email"
                      className="min-h-[48px] text-base"
                    />
                  ) : (
                    <Input
                      type="tel"
                      autoComplete="tel"
                      placeholder={phonePlaceholder}
                      value={phone}
                      onChange={(e) => onPhoneChange(e.target.value)}
                      data-testid="guest-hub-phone"
                      className="min-h-[48px] text-base"
                    />
                  )}
                  <Button
                    className="w-full min-h-[48px]"
                    disabled={busy || !identifier.trim() || resendSec > 0}
                    aria-label={
                      busy
                        ? "Sending verification code"
                        : resendSec > 0
                          ? `Resend available in ${resendSec} seconds`
                          : "Send verification code"
                    }
                    onClick={onRequestOtp}
                  >
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : resendSec > 0 ? (
                      `Resend in ${resendSec}s`
                    ) : (
                      "Send verification code"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-primary/15 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Enter the code we sent</CardTitle>
                  <p className="text-xs text-muted-foreground font-mono mt-1 truncate">{identifier}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stagingRelaxed && devOtp ? (
                    <p className="text-xs text-muted-foreground font-mono">Session code: {devOtp}</p>
                  ) : null}
                  {stagingRelaxed && magicOtp ? (
                    <p className="text-xs text-muted-foreground font-mono">Staging code: {magicOtp}</p>
                  ) : null}
                  <Input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="6-digit code"
                    value={code}
                    onChange={(e) => onCodeChange(e.target.value)}
                    data-testid="guest-hub-otp"
                    className="min-h-[48px] text-center text-lg tracking-[0.3em] font-mono"
                  />
                  <Button
                    className="w-full min-h-[48px]"
                    disabled={busy || code.length < 4}
                    aria-label={busy ? "Verifying code" : GUEST_HUB_COPY.signInVerifyCta}
                    onClick={onVerifyOtp}
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : GUEST_HUB_COPY.signInVerifyCta}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1 text-xs text-muted-foreground min-h-[44px]"
                      disabled={busy || resendSec > 0}
                      onClick={onRequestOtp}
                    >
                      {resendSec > 0 ? `Resend in ${resendSec}s` : "Resend code"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1 text-xs text-muted-foreground min-h-[44px]"
                      disabled={busy}
                      onClick={onChangeIdentifier}
                    >
                      {authMethod === "email" ? "Change email" : "Change number"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {err ? (
              <p className="text-sm text-destructive text-center" role="alert">
                {err}
              </p>
            ) : null}
          </div>
        </section>
      </div>

      <div className="border-t border-border/60">
        <PublicSurfaceFooter />
      </div>
    </div>
  );
}
