import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { fonts, type } from "@/constants/typography";
import type { RetailCartProduct } from "@/lib/retail-cart";

function formatMoney(minor: number, currency: string) {
  if (minor === 0) return "Free";
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(minor / 100);
}

export function PublicRetailShop({
  title,
  products,
  cartQtyForProduct,
  onAddToBag,
  onChangeQty,
  surface,
}: {
  title: string;
  products: RetailCartProduct[];
  cartQtyForProduct: (productId: string) => number;
  onAddToBag: (product: RetailCartProduct) => void;
  onChangeQty: (productId: string, quantity: number) => void;
  surface: {
    foreground: string;
    mutedForeground: string;
    border: string;
    card: string;
    primary: string;
  };
}) {
  if (products.length === 0) return null;

  return (
    <View style={styles.wrap} testID="public-retail-shop">
      <Text style={[type.label, { color: surface.foreground, marginBottom: 10 }]}>{title}</Text>
      {products.map((p) => {
        const qty = cartQtyForProduct(p.id);
        const soldOut = p.inStock === false;
        return (
          <View
            key={p.id}
            style={[styles.card, { borderColor: surface.border, backgroundColor: surface.card }]}
          >
            {p.imageUrl ? (
              <Image source={{ uri: p.imageUrl }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, { backgroundColor: surface.border }]} />
            )}
            <View style={styles.body}>
              <Text style={[type.label, { color: surface.foreground, fontSize: 14 }]}>{p.name}</Text>
              {p.description ? (
                <Text style={[type.caption, { color: surface.mutedForeground, marginTop: 2 }]} numberOfLines={2}>
                  {p.description}
                </Text>
              ) : null}
              <Text style={[type.caption, { color: surface.primary, marginTop: 6 }]}>
                {formatMoney(p.priceMinor, p.currency)}
                {soldOut ? " · Sold out" : ""}
              </Text>
            </View>
            <View style={styles.controls}>
              {qty > 0 ? (
                <>
                  <Pressable
                    onPress={() => onChangeQty(p.id, qty - 1)}
                    style={[styles.iconBtn, { borderColor: surface.border }]}
                    accessibilityLabel={`Remove one ${p.name}`}
                  >
                    <Feather name="minus" size={14} color={surface.foreground} />
                  </Pressable>
                  <Text style={[type.caption, { color: surface.foreground, minWidth: 16, textAlign: "center" }]}>
                    {qty}
                  </Text>
                  <Pressable
                    onPress={() => onChangeQty(p.id, qty + 1)}
                    disabled={soldOut || (p.stockQuantity != null && qty >= p.stockQuantity)}
                    style={[styles.iconBtn, { borderColor: surface.border }]}
                    accessibilityLabel={`Add one ${p.name}`}
                  >
                    <Feather name="plus" size={14} color={surface.foreground} />
                  </Pressable>
                </>
              ) : (
                <Pressable
                  onPress={() => onAddToBag(p)}
                  disabled={soldOut}
                  style={[styles.addBtn, { backgroundColor: surface.primary }]}
                >
                  <Text style={{ color: "#fff", fontSize: 12, fontFamily: fonts.bodyMed }}>Add</Text>
                </Pressable>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 24 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  thumb: { width: 52, height: 52, borderRadius: 8 },
  body: { flex: 1, minWidth: 0 },
  controls: { flexDirection: "row", alignItems: "center", gap: 6 },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
});
