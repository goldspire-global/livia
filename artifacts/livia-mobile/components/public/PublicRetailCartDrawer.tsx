import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { fonts, type } from "@/constants/typography";
import {
  cartCurrency,
  cartLineCount,
  cartSubtotalMinor,
  type RetailCart,
} from "@/lib/retail-cart";
import {
  guestRetailFulfillmentDetailHint,
  type GuestRetailFulfillmentMode,
  type GuestRetailFulfillmentOption,
} from "@workspace/policy";

function formatMoney(minor: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(minor / 100);
}

export function PublicRetailCartDrawer({
  visible,
  onClose,
  cart,
  fulfillmentOptions,
  fulfillmentMode,
  onFulfillmentModeChange,
  fulfillmentDetail,
  onFulfillmentDetailChange,
  onChangeQty,
  checkoutBusy,
  onCheckoutRetailOnly,
  surface,
}: {
  visible: boolean;
  onClose: () => void;
  cart: RetailCart;
  fulfillmentOptions: readonly GuestRetailFulfillmentOption[];
  fulfillmentMode: GuestRetailFulfillmentMode;
  onFulfillmentModeChange: (mode: GuestRetailFulfillmentMode) => void;
  fulfillmentDetail: string;
  onFulfillmentDetailChange: (value: string) => void;
  onChangeQty: (productId: string, quantity: number) => void;
  checkoutBusy?: boolean;
  onCheckoutRetailOnly: () => void;
  surface: {
    background: string;
    foreground: string;
    mutedForeground: string;
    border: string;
    primary: string;
    card: string;
  };
}) {
  const selected = fulfillmentOptions.find((o) => o.mode === fulfillmentMode);
  const needsAddress = selected?.requiresAddress && !fulfillmentDetail.trim();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: surface.background, borderColor: surface.border }]}>
        <View style={styles.handle} />
        <Text style={[type.title, { color: surface.foreground, fontSize: 18 }]}>Your bag</Text>
        <Text style={[type.caption, { color: surface.mutedForeground, marginTop: 4 }]}>
          {cartLineCount(cart)} items · {formatMoney(cartSubtotalMinor(cart), cartCurrency(cart))}
        </Text>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {cart.lines.map((line) => (
            <View
              key={line.productId}
              style={[styles.line, { borderColor: surface.border, backgroundColor: surface.card }]}
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[type.label, { color: surface.foreground }]} numberOfLines={2}>
                  {line.name}
                </Text>
                <Text style={[type.caption, { color: surface.primary, marginTop: 2 }]}>
                  {formatMoney(line.priceMinor, line.currency)}
                </Text>
              </View>
              <View style={styles.qtyRow}>
                <Pressable
                  onPress={() => onChangeQty(line.productId, line.quantity - 1)}
                  style={[styles.qtyBtn, { borderColor: surface.border }]}
                >
                  <Feather name="minus" size={14} color={surface.foreground} />
                </Pressable>
                <Text style={[type.label, { color: surface.foreground, minWidth: 20, textAlign: "center" }]}>
                  {line.quantity}
                </Text>
                <Pressable
                  onPress={() => onChangeQty(line.productId, line.quantity + 1)}
                  style={[styles.qtyBtn, { borderColor: surface.border }]}
                >
                  <Feather name="plus" size={14} color={surface.foreground} />
                </Pressable>
              </View>
            </View>
          ))}

          <Text style={[type.label, { color: surface.foreground, marginTop: 16, marginBottom: 8 }]}>
            How should we get this to you?
          </Text>
          {fulfillmentOptions.map((opt) => (
            <Pressable
              key={opt.mode}
              onPress={() => onFulfillmentModeChange(opt.mode)}
              style={[
                styles.fulfillmentOpt,
                {
                  borderColor: fulfillmentMode === opt.mode ? surface.primary : surface.border,
                  backgroundColor: fulfillmentMode === opt.mode ? `${surface.primary}14` : surface.card,
                },
              ]}
            >
              <Text style={[type.label, { color: surface.foreground }]}>{opt.label}</Text>
              <Text style={[type.caption, { color: surface.mutedForeground, marginTop: 2 }]}>
                {opt.description}
              </Text>
            </Pressable>
          ))}
          {selected ? (
            <TextInput
              value={fulfillmentDetail}
              onChangeText={onFulfillmentDetailChange}
              placeholder={guestRetailFulfillmentDetailHint(fulfillmentMode)}
              placeholderTextColor={surface.mutedForeground}
              multiline
              style={[
                styles.detailInput,
                { borderColor: surface.border, color: surface.foreground, backgroundColor: surface.card },
              ]}
            />
          ) : null}
        </ScrollView>

        <Pressable
          disabled={checkoutBusy || needsAddress}
          onPress={onCheckoutRetailOnly}
          style={[
            styles.checkoutBtn,
            { backgroundColor: surface.primary, opacity: checkoutBusy || needsAddress ? 0.5 : 1 },
          ]}
          testID="public-cart-retail-checkout"
        >
          {checkoutBusy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontFamily: fonts.bodyMed, fontSize: 15 }}>Checkout bag</Text>
          )}
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    maxHeight: "88%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(128,128,128,0.45)",
    marginBottom: 12,
  },
  scroll: { maxHeight: 420, marginTop: 12 },
  line: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  fulfillmentOpt: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  detailInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 10,
    minHeight: 64,
    marginTop: 4,
    textAlignVertical: "top",
    fontFamily: fonts.body,
    fontSize: 14,
  },
  checkoutBtn: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
});
