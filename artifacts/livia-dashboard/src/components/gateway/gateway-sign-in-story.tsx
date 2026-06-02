/**
 * W2 gateway sign-in brand panel — locked Liv colleague story (web + mobile).
 * @see docs/design/assets/w2-gateway/sign-in/gateway-default.target.png
 */
export function GatewaySignInStory({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary/90">
        Your people-business OS
      </p>
      <h1 className="mt-3 font-serif text-[1.75rem] leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem]">
        <span className="text-aurum-champagne/95">Tuesday morning,</span>
        <span className="mt-1 block text-foreground">handled.</span>
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
        Livia is the company you trust. Liv is the colleague who runs the floor — bookings,
        messages, the awkward reschedules. Calm. Present. European.
      </p>
      <div
        className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 backdrop-blur-sm"
        data-testid="gateway-sign-in-liv-briefing"
      >
        <p className="text-[11px] font-medium text-primary">Liv · briefing</p>
        <p className="mt-1.5 text-sm text-foreground/90">Three no-shows avoided this week.</p>
        <p className="mt-1 text-xs text-muted-foreground">Marie&apos;s chair: worth a chat Friday.</p>
      </div>
      <p className="mt-6 hidden text-xs text-muted-foreground/80 lg:block">
        Sign in — Liv meets you inside.
      </p>
    </div>
  );
}
