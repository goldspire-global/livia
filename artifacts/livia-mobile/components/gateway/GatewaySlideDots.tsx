import React from "react";
import { StyleSheet, View } from "react-native";
import { gatewayTheme } from "@/lib/gateway-theme";

type Props = {
  activeIndex: number;
  count?: number;
};

export function GatewaySlideDots({ activeIndex, count = 2 }: Props) {
  return (
    <View style={styles.row} testID="gateway-slide-dots">
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor:
                i === activeIndex ? gatewayTheme.primaryChampagne : `${gatewayTheme.primaryChampagne}40`,
              width: i === activeIndex ? 10 : 7,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
    marginBottom: 8,
  },
  dot: {
    height: 7,
    borderRadius: 999,
  },
});
