import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { useSignIn, useClerk } from "@clerk/clerk-react";
import {
  GatewayBeatDots,
  GatewayBusyOverlay,
  GatewayDemoCardStage,
} from "@/components/gateway/gateway-demo-card-stage";
import { GatewayShell } from "@/components/gateway/gateway-shell";
import {
  getWedgeDemoStory,
  type WedgeDemoStory,
} from "@workspace/policy";
import {
  applyDemoSessionContext,
  fetchDemoCatalog,
  fetchDemoStatus,
  requestDemoQuickSignIn,
  type DemoBusinessTenant,
  type DemoRosterEntry,
  type DemoSignInResult,
} from "@/lib/demo-portal";
import { completeDemoClerkSignIn } from "@/lib/demo-clerk-sign-in";
import { useToast } from "@/hooks/use-toast";

export default function DemoWedgeStoryPage() {
  const { vertical = "" } = useParams<{ vertical: string }>();
  const story = getWedgeDemoStory(vertical as WedgeDemoStory["vertical"]);
  const { toast } = useToast();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signOut, session, setActive } = useClerk();
  const [busy, setBusy] = useState<string | null>(null);
  const [devPassword, setDevPassword] = useState<string | undefined>();
  const [provisioned, setProvisioned] = useState(false);
  const [tenant, setTenant] = useState<DemoBusinessTenant | null>(null);
  const [beatIndex, setBeatIndex] = useState(0);

  useEffect(() => {
    void fetchDemoCatalog()
      .then((c) => {
        if (c.sharedPassword ?? c.devPassword) {
          setDevPassword(c.sharedPassword ?? c.devPassword);
        }
      })
      .catch(() => undefined);
    void fetchDemoStatus()
      .then((st) => {
        setProvisioned(st.provisioned);
        const slug = story?.demoSlug;
        const match =
          (slug ? st.businesses?.find((b) => b.slug === slug) : null) ??
          st.businesses?.find((b) => (b.vertical ?? "").toLowerCase() === vertical.toLowerCase());
        setTenant(match ?? null);
      })
      .catch(() => undefined);
  }, [story?.demoSlug, vertical]);

  const completeTicketSignIn = useCallback(
    async (result: DemoSignInResult) => {
      if (!signInLoaded || !signIn) {
        toast({ title: "Clerk not ready", variant: "destructive" });
        return;
      }
      await completeDemoClerkSignIn(
        signIn,
        { signOut, setActive, sessionId: session?.id },
        result,
        devPassword,
      );
      applyDemoSessionContext(result);
      window.location.href = result.landingPath;
    },
    [devPassword, session?.id, signIn, signInLoaded, setActive, signOut, toast],
  );

  const roster = useMemo((): DemoRosterEntry[] => {
    if (tenant?.roster?.length) return tenant.roster;
    const ownerEmail = tenant?.roster?.find((r) => r.role === "owner")?.email ?? tenant?.ownerEmail;
    if (!ownerEmail) return [];
    return [
      {
        email: ownerEmail,
        label: "Owner",
        role: "owner",
        personaId: "owner",
        landingPath: "/dashboard",
      },
    ];
  }, [tenant]);

  async function enterAsRole(email: string) {
    if (!provisioned) {
      toast({
        title: "Set up demo world first",
        description: "Open /demo and run Quick sync, then return here.",
        variant: "destructive",
      });
      return;
    }
    setBusy(email);
    try {
      const result = await requestDemoQuickSignIn(email);
      await completeTicketSignIn(result);
    } catch (e: unknown) {
      toast({
        title: "Could not enter demo",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  }

  if (!story) {
    return (
      <GatewayShell breadcrumb="Worlds" backHref="/demo">
        <p className="text-muted-foreground">Unknown vertical wedge.</p>
        <Link href="/demo" className="mt-4 text-primary underline-offset-4 hover:underline">
          Back to demo gateway
        </Link>
      </GatewayShell>
    );
  }

  const beatCount = story.beats.length;
  const enterBeatIndex = beatCount - 1;
  const enterMode = beatIndex >= enterBeatIndex;
  const beat = story.beats[Math.min(beatIndex, enterBeatIndex)]!;
  const businessName = tenant?.name ?? "Belle Vue Beauty";

  return (
    <GatewayShell
      breadcrumb={`Worlds › ${story.label}`}
      step={enterMode ? "G3 · Enter" : "G2 · Story"}
      backHref="/demo"
      backLabel="← Worlds"
    >
      {busy ? <GatewayBusyOverlay label="Signing in…" /> : null}

      <div className="mb-6 text-center sm:text-left">
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          {enterMode ? "Ready to walk in" : "See your week in four beats"}
        </h1>
        <p className="mt-2 text-sm text-aurum-champagne/80 font-serif">
          {enterMode
            ? "Same card — story done — tap a role to walk in."
            : "The world you picked — now Liv walks you through it."}
        </p>
      </div>

      {!provisioned ? (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <p className="font-medium text-amber-100">Demo not seeded yet</p>
          <p className="mt-1 text-amber-200/80">
            <Link href="/demo" className="underline underline-offset-2">
              Open /demo
            </Link>{" "}
            and run <strong>Quick sync</strong> first.
          </p>
        </div>
      ) : null}

      <GatewayDemoCardStage
        tradeLabel={story.label}
        businessName={businessName}
        beat={beat}
        beatIndex={beatIndex}
        beatCount={beatCount}
        enterMode={enterMode}
        roster={roster}
        busy={busy}
        disabled={!provisioned}
        onNextBeat={() => setBeatIndex((i) => Math.min(i + 1, enterBeatIndex))}
        onSelectRole={(email) => void enterAsRole(email)}
      />

      <GatewayBeatDots beatIndex={beatIndex} beatCount={beatCount} className="mt-6" />

      {beatIndex > 0 && !enterMode ? (
        <button
          type="button"
          className="mx-auto mt-4 block text-sm text-muted-foreground hover:text-foreground"
          onClick={() => setBeatIndex((i) => Math.max(0, i - 1))}
        >
          ← Previous beat
        </button>
      ) : null}

      <p className="mt-8 text-center text-[11px] text-muted-foreground/70">
        Then W4 tenant skin — intentional handoff from gateway aurora
      </p>
    </GatewayShell>
  );
}
