import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { fonts, type } from "@/constants/typography";
import {
  cartCurrency,
  cartLineCount,
  cartSubtotalMinor,
  type RetailCart,
} from "@/lib/retail-cart";

function formatMoney(minor: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(minor / 100);
}

export function PublicRetailCartBar({
  cart,
  checkoutBusy,
  onCheckout,
  surface,
}: {
  cart: RetailCart;
  checkoutBusy?: boolean;
  onCheckout: () => void;
  surface: { background: string; foreground: string; mutedForeground: string; border: string; primary: string };
}) {
  const count = cartLineCount(cart);
  if (count === 0) return null;

  return (
    <View
      style={[styles.bar, { backgroundColor: surface.background, borderTopColor: surface.border }]}
      testID="public-retail-cart-bar"
    >
      <View style={styles.inner}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[type.label, { color: surface.foreground }]}>Bag · {count} items</Text>
          <Text style={[type.caption, { color: surface.mutedForeground }]}>
            {formatMoney(cartSubtotalMinor(cart), cartCurrency(cart))} subtotal
          </Text>
        </View>
        <Pressable
          onPress={onCheckout}
          disabled={checkoutBusy}
          style={[styles.btn, { backgroundColor: surface.primary }]}
          testID="public-retail-cart-checkout"
        >
          {checkoutBusy ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={{ color: "#fff", fontFamily: fonts.bodyMed, fontSize: 14 }}>Checkout</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
  },
  inner: { flexDirection: "row", alignItems: "center", gap: 12 },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 96,
    alignItems: "center",
  },
});
