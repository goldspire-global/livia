/**
 * Mobile demo · G2 wedge story + G3 role enter (parity with dashboard WedgeStory.tsx).
 */

import { useSignIn } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DemoFlowAmbient } from "@/components/gateway/DemoFlowAmbient";
import { GatewaySlideDots } from "@/components/gateway/GatewaySlideDots";
import { MobileGatewayEnterStage } from "@/components/gateway/MobileGatewayEnterStage";
import { MobileWedgeBeautyThread } from "@/components/gateway/MobileWedgeBeautyThread";
import { MobileWedgeStudioBrief } from "@/components/gateway/MobileWedgeStudioBrief";
import { fonts } from "@/constants/typography";
import { useHaptics } from "@/hooks/useHaptics";
import { useDemoWorldStatus } from "@/hooks/useDemoWorldStatus";
import { setDevPersonaOverride } from "@/hooks/usePersona";
import { completeMobileDemoSignIn } from "@/lib/demo-enter";
import { requestDemoQuickSignIn } from "@/lib/demo-portal";
import { resolveG1WedgeWorld } from "@/lib/g1-wedge-worlds";
import { gatewayTheme } from "@/lib/gateway-theme";
import { isPresetWedgeThread } from "@/lib/wedge-beat-visuals";
import type { BusinessVertical } from "@workspace/policy";
import { getWedgeDemoStory } from "@workspace/policy";

type Slide = "story" | "enter";

export default function MobileDemoWedgeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const haptics = useHaptics();
  const { signIn, setActive, isLoaded: signInLoaded } = useSignIn();
  const params = useLocalSearchParams<{ vertical: string; world?: string }>();
  const vertical = (params.vertical ?? "").toLowerCase() as BusinessVertical;
  const worldKey = typeof params.world === "string" ? params.world : null;
  const story = getWedgeDemoStory(vertical);
  const world = story ? resolveG1WedgeWorld(story.vertical, worldKey) : null;
  const demoSlug = world?.demoSlug ?? story?.demoSlug ?? null;
  const { provisioned, tenants, loading, error, refresh } = useDemoWorldStatus();
  const [slide, setSlide] = useState<Slide>("story");
  const [entering, setEntering] = useState<string | null>(null);
  const [enterError, setEnterError] = useState<string | null>(null);

  const tenant = useMemo(() => {
    if (demoSlug) {
      const bySlug = tenants.find((t) => t.slug === demoSlug);
      if (bySlug) return bySlug;
    }
    return tenants.find((t) => (t.vertical ?? "").toLowerCase() === vertical) ?? null;
  }, [demoSlug, tenants, vertical]);

  const roster = useMemo(() => {
    if (tenant?.roster?.length) return tenant.roster;
    if (!tenant?.ownerEmail) return [];
    return [
      {
        email: tenant.ownerEmail,
        label: "Owner",
        role: "owner",
        personaId: "owner",
        landingPath: "/dashboard",
      },
    ];
  }, [tenant]);

  if (!story) {
    return (
      <View style={[styles.centered, { backgroundColor: gatewayTheme.g2NavyDeep }]}>
        <Text style={{ color: "rgba(255,255,255,0.55)" }}>Unknown world.</Text>
        <Pressable onPress={() => router.replace("/demo" as never)} style={{ marginTop: 12 }}>
          <Text style={{ color: gatewayTheme.goldMid }}>← Back to worlds</Text>
        </Pressable>
      </View>
    );
  }

  const businessName = tenant?.name ?? world?.businessLabel ?? story.label;
  const tradeLabel = world?.businessLabel ?? story.label;
  const continueLabel = provisioned ? "Walk into the live demo" : "Set up demo world first";

  async function enterAs(email: string, busyKey: string) {
    if (!provisioned) {
      setEnterError("Set up demo world on the previous screen first.");
      return;
    }
    if (!signInLoaded || !signIn) {
      setEnterError("Clerk is still loading — try again.");
      return;
    }
    haptics.tap();
    setEntering(busyKey);
    setEnterError(null);
    try {
      await setDevPersonaOverride(null);
      const result = await requestDemoQuickSignIn(email);
      const home = await completeMobileDemoSignIn(signIn, setActive, result, vertical);
      haptics.success();
      router.replace(home as never);
    } catch (e: unknown) {
      setEnterError(e instanceof Error ? e.message : "Could not sign in");
      haptics.warning();
    } finally {
      setEntering(null);
    }
  }

  function handleContinue() {
    if (!provisioned) {
      router.replace("/demo" as never);
      return;
    }
    setSlide("enter");
  }

  return (
    <View style={styles.root} testID={`mobile-demo-wedge-${vertical}`}>
      <DemoFlowAmbient />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {slide === "enter" ? (
          <Text style={styles.enterHeadline}>Walk in as your role</Text>
        ) : null}

        {!provisioned && !loading ? (
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>Demo world not ready yet</Text>
            <Text style={styles.bannerBody}>
              Open /demo and run Set up demo world once (30s–3 min). Then return here.
            </Text>
            {error ? (
              <Pressable onPress={() => void refresh()}>
                <Text style={styles.bannerRetry}>Status: {error} · Tap to retry</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {slide === "enter" ? (
          <>
            {enterError ? <Text style={styles.error}>{enterError}</Text> : null}
            <MobileGatewayEnterStage
              tradeLabel={story.label}
              businessName={businessName}
              roster={roster}
              disabled={!provisioned}
              enteringKey={entering}
              onBack={() => setSlide("story")}
              onEnter={(email, key) => void enterAs(email, key)}
            />
          </>
        ) : isPresetWedgeThread(story.vertical) ? (
          <MobileWedgeBeautyThread
            vertical={story.vertical}
            world={world}
            beats={story.beats}
            tradeLabel={tradeLabel}
            disabled={!provisioned}
            continueLabel={continueLabel}
            onBack={() => router.back()}
            onContinue={handleContinue}
          />
        ) : (
          <MobileWedgeStudioBrief
            beats={story.beats}
            tradeLabel={tradeLabel}
            vertical={story.vertical}
            world={world}
            disabled={!provisioned}
            continueLabel={continueLabel}
            onBack={() => router.back()}
            onContinue={handleContinue}
          />
        )}

        <GatewaySlideDots activeIndex={slide === "enter" ? 1 : 0} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: gatewayTheme.g2NavyDeep },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  enterHeadline: {
    textAlign: "center",
    fontFamily: fonts.serif,
    fontSize: 22,
    color: `${gatewayTheme.goldLight}e6`,
    marginBottom: 16,
  },
  banner: {
    borderWidth: 1,
    borderColor: "#f59e0b55",
    backgroundColor: "#f59e0b18",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  bannerTitle: { fontFamily: fonts.bodySemi, fontSize: 14, color: "#fff" },
  bannerBody: { fontSize: 12, lineHeight: 17, color: "rgba(255,255,255,0.65)", marginTop: 4 },
  bannerRetry: { fontSize: 11, color: "#fbbf24", marginTop: 8, fontFamily: fonts.mono },
  error: { color: "#f87171", fontSize: 12, marginBottom: 10 },
});
