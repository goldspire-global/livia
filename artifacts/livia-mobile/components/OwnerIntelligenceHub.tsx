import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { TWIN_TRAJECTORY_COPY } from "@workspace/policy";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { fonts, type } from "@/constants/typography";
import { getDashboardBaseUrl } from "@/lib/dashboard-url";
import * as Linking from "expo-linking";

type Bundle = {
  commerce?: {
    signals?: Array<{ id: string; title: string; body: string; href: string; severity: string }>;
    topSignal?: { id: string; title: string; body: string; href: string; severity: string } | null;
    snapshot?: { capturedLabel?: string; captureRatePercent?: number | null; paymentCount30d?: number };
  };
  capabilityHealth?: { score: number; grade: string };
  twinTopRecommendation?: { title: string; reason: string; href?: string } | null;
  twinHeadline?: string | null;
  twinSubline?: string | null;
  livPrompts?: string[];
  remediationTasks?: Array<{ signalId: string; title: string; body: string; href: string; severity: string }>;
  commerceCapabilityBlockers?: Array<{
    capabilityId: string;
    capabilityName: string;
    blocker: string;
    href: string;
  }>;
  twinObservations?: Array<{
    id: string;
    domain: string;
    title: string;
    body: string;
    href?: string | null;
  }>;
  twinRisks?: Array<{ id: string; title: string; body: string; href?: string }>;
  twinOpportunities?: Array<{ id: string; title: string; body: string; href?: string }>;
  twinHealth?: {
    domains?: Array<{
      domain: string;
      trajectory?: "strengthening" | "stable" | "weakening" | "unknown";
    }>;
  } | null;
};

/** Mobile owner home — single owner-intelligence fetch (replaces 3 cards). */
export function OwnerIntelligenceHub({ businessId }: { businessId: string }) {
  const colors = useColors();
  const { data } = useQuery({
    queryKey: ["owner-intelligence", businessId],
    queryFn: () => customFetch<Bundle>(`/api/businesses/${businessId}/owner-intelligence`),
    enabled: !!businessId,
    staleTime: 90_000,
  });

  const top = data?.commerce?.topSignal;
  const signals = (data?.commerce?.signals ?? []).filter((s) => s.severity !== "info");
  const tasks = data?.remediationTasks ?? [];
  const commerceBlockers = data?.commerceCapabilityBlockers ?? [];
  const health = data?.capabilityHealth;
  const prompts = data?.livPrompts ?? [];
  const observations = data?.twinObservations ?? [];
  const risks = data?.twinRisks ?? [];
  const opportunities = data?.twinOpportunities ?? [];
  const twin = data?.twinTopRecommendation;
  const snapshot = data?.commerce?.snapshot;

  const show =
    top ||
    signals.length > 0 ||
    tasks.length > 0 ||
    commerceBlockers.length > 0 ||
    twin ||
    prompts.length > 0 ||
    observations.length > 0 ||
    risks.length > 0 ||
    opportunities.length > 0 ||
    data?.twinHeadline ||
    (health && health.score < 85);

  if (!show) return null;

  const openBilling = (href: string) => void Linking.openURL(`${getDashboardBaseUrl()}${href}`);

  return (
    <View
      style={[styles.card, { borderColor: colors.primary + "33", backgroundColor: colors.card }]}
      testID="owner-intelligence-hub-mobile"
    >
      <View style={styles.head}>
        <Feather name="cpu" size={14} color={colors.primary} />
        <Text style={[styles.title, { color: colors.foreground }]}>Owner intelligence</Text>
        {health && health.score < 85 ? (
          <Text style={[styles.score, { color: colors.mutedForeground }]}>
            {health.score}% · {health.grade}
          </Text>
        ) : null}
      </View>

      {data?.twinHeadline ? (
        <Text style={[styles.headline, { color: colors.foreground }]} numberOfLines={2}>
          {data.twinHeadline}
          {data.twinSubline ? ` — ${data.twinSubline}` : ""}
        </Text>
      ) : null}

      {snapshot && (snapshot.paymentCount30d ?? 0) > 0 && snapshot.capturedLabel ? (
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {snapshot.capturedLabel} (30d)
          {snapshot.captureRatePercent != null ? ` · ${snapshot.captureRatePercent}% capture` : ""}
        </Text>
      ) : null}

      {data?.twinHealth?.domains?.some((d) => d.trajectory === "weakening") ? (
        <View style={styles.trajectoryRow} testID="twin-domain-trajectory-strip">
          {data.twinHealth.domains
            .filter((d) => d.trajectory && d.trajectory !== "unknown")
            .slice(0, 3)
            .map((d) => (
              <Text
                key={d.domain}
                style={[
                  styles.trajectoryChip,
                  {
                    color: d.trajectory === "weakening" ? "#b91c1c" : colors.mutedForeground,
                    borderColor: colors.border,
                  },
                ]}
              >
                {d.domain} · {TWIN_TRAJECTORY_COPY[d.trajectory ?? "unknown"]}
              </Text>
            ))}
        </View>
      ) : null}

      {top ? (
        <Pressable onPress={() => openBilling(top.href)} style={styles.block}>
          <Text style={[styles.blockTitle, { color: colors.foreground }]}>{top.title}</Text>
          <Text style={[styles.blockBody, { color: colors.mutedForeground }]} numberOfLines={2}>
            {top.body}
          </Text>
        </Pressable>
      ) : null}

      {commerceBlockers.slice(0, 2).map((b) => (
        <Pressable
          key={`${b.capabilityId}-${b.blocker}`}
          onPress={() => openBilling(b.href)}
          style={styles.block}
        >
          <Text style={[styles.blockTitle, { color: colors.foreground }]}>{b.capabilityName}</Text>
          <Text style={[styles.blockBody, { color: colors.mutedForeground }]} numberOfLines={2}>
            {b.blocker}
          </Text>
        </Pressable>
      ))}

      {signals
        .filter((s) => s.id !== top?.id)
        .slice(0, 2)
        .map((s) => (
          <Pressable key={s.id} onPress={() => openBilling(s.href)} style={styles.block}>
            <Text style={[styles.blockTitle, { color: colors.foreground }]}>{s.title}</Text>
            <Text style={[styles.blockBody, { color: colors.mutedForeground }]} numberOfLines={2}>
              {s.body}
            </Text>
          </Pressable>
        ))}

      {tasks.slice(0, 2).map((t) => (
        <Pressable key={t.signalId} onPress={() => openBilling(t.href)} style={styles.block}>
          <Text style={[styles.blockTitle, { color: colors.foreground }]}>{t.title}</Text>
          <Text style={[styles.blockBody, { color: colors.mutedForeground }]} numberOfLines={2}>
            {t.body}
          </Text>
        </Pressable>
      ))}

      {twin ? (
        <Pressable
          onPress={twin.href ? () => openBilling(twin.href!) : undefined}
          style={styles.block}
        >
          <Text style={[styles.blockTitle, { color: colors.foreground }]}>{twin.title}</Text>
          <Text style={[styles.blockBody, { color: colors.mutedForeground }]} numberOfLines={2}>
            {twin.reason}
          </Text>
        </Pressable>
      ) : null}

      {risks.slice(0, 1).map((risk) => (
        <Pressable
          key={risk.id}
          onPress={risk.href ? () => openBilling(risk.href!) : undefined}
          style={styles.block}
          testID="twin-risk-mobile"
        >
          <Text style={[styles.meta, { color: "#b91c1c" }]}>Risk</Text>
          <Text style={[styles.blockTitle, { color: colors.foreground }]}>{risk.title}</Text>
          <Text style={[styles.blockBody, { color: colors.mutedForeground }]} numberOfLines={2}>
            {risk.body}
          </Text>
        </Pressable>
      ))}

      {observations.slice(0, 2).map((obs) => (
        <Pressable
          key={obs.id}
          onPress={obs.href ? () => openBilling(obs.href!) : undefined}
          style={styles.block}
          testID="twin-observation-mobile"
        >
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>{obs.domain}</Text>
          <Text style={[styles.blockTitle, { color: colors.foreground }]}>{obs.title}</Text>
          <Text style={[styles.blockBody, { color: colors.mutedForeground }]} numberOfLines={2}>
            {obs.body}
          </Text>
        </Pressable>
      ))}

      {prompts.slice(0, 2).map((p) => (
        <Text key={p} style={[styles.prompt, { color: colors.primary }]} numberOfLines={1}>
          Ask Liv: {p}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 8, marginBottom: 8 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontFamily: fonts.bodySemi, fontSize: 13, flex: 1 },
  score: { ...type.caption, fontSize: 11 },
  headline: { fontFamily: fonts.bodySemi, fontSize: 14, lineHeight: 19 },
  meta: { ...type.caption, fontSize: 11 },
  trajectoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  trajectoryChip: {
    fontFamily: fonts.body,
    fontSize: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  block: { gap: 2, paddingVertical: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(128,128,128,0.2)" },
  blockTitle: { fontFamily: fonts.bodySemi, fontSize: 13 },
  blockBody: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16 },
  prompt: { fontFamily: fonts.body, fontSize: 11 },
});
