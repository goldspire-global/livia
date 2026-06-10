import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { VisitFeedbackCard } from "@/components/VisitFeedbackCard";
import { OwnerIntelligenceHub } from "@/components/OwnerIntelligenceHub";
type Props = {
  businessId: string;
  atRiskGuests?: Array<{
    customerId: string;
    displayName: string;
    headline: string;
    stage?: string;
  }>;
  recentVisitFeedback?: Array<{
    id: string;
    bookingId: string;
    score: number;
    comment?: string | null;
    createdAt: string;
  }>;
  lowFeedbackCount?: number;
  loading?: boolean;
  atRiskBlock?: React.ReactNode;
};

/** Relationship + trust blocks shared by beauty/wellness morph Today — web parity. */
export function MorphOwnerSignalsFooter({
  businessId,
  atRiskGuests,
  recentVisitFeedback,
  lowFeedbackCount,
  loading,
  atRiskBlock,
}: Props) {
  const hasSignals =
    (atRiskGuests?.length ?? 0) > 0 ||
    (recentVisitFeedback?.length ?? 0) > 0 ||
    (lowFeedbackCount ?? 0) > 0;

  if (!hasSignals && !loading) return null;

  return (
    <Animated.View
      entering={FadeInDown.delay(160).duration(380).springify()}
      style={styles.wrap}
      testID="morph-owner-signals-footer"
    >
      {atRiskBlock}
      {(recentVisitFeedback?.length ?? 0) > 0 || (lowFeedbackCount ?? 0) > 0 ? (
        <VisitFeedbackCard businessId={businessId} items={recentVisitFeedback} />
      ) : null}
      <OwnerIntelligenceHub businessId={businessId} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12, marginTop: 8 },
});
