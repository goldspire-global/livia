/**
 * Guest retail bag — pure cart logic shared by web /b and mobile public book.
 */
import { BEAUTY_RETAIL_PROGRAM, normalizeRetailCartItems } from "./beauty-retail";

export type GuestRetailCartProduct = {
  id: string;
  name: string;
  description?: string | null;
  priceMinor: number;
  currency: string;
  imageUrl?: string | null;
  stockQuantity?: number | null;
  inStock?: boolean;
};

export type GuestRetailCartLine = {
  productId: string;
  quantity: number;
  name: string;
  priceMinor: number;
  currency: string;
  imageUrl?: string | null;
};

export type GuestRetailCart = {
  slug: string;
  lines: GuestRetailCartLine[];
  updatedAt: string;
};

export const GUEST_RETAIL_CART_LIMITS = {
  maxLines: BEAUTY_RETAIL_PROGRAM.maxCartLines,
  maxQtyPerLine: BEAUTY_RETAIL_PROGRAM.maxQtyPerLine,
} as const;

export function guestRetailCartLineCount(cart: GuestRetailCart | null): number {
  return cart?.lines.reduce((n, l) => n + l.quantity, 0) ?? 0;
}

export function guestRetailCartSubtotalMinor(cart: GuestRetailCart | null): number {
  return cart?.lines.reduce((n, l) => n + l.priceMinor * l.quantity, 0) ?? 0;
}

export function guestRetailCartCurrency(cart: GuestRetailCart | null): string {
  return cart?.lines[0]?.currency ?? "EUR";
}

export function guestRetailCartQty(cart: GuestRetailCart | null, productId: string): number {
  return cart?.lines.find((l) => l.productId === productId)?.quantity ?? 0;
}

export function addGuestRetailCartLine(
  cart: GuestRetailCart | null,
  slug: string,
  product: GuestRetailCartProduct,
  delta = 1,
): GuestRetailCart | null {
  if (!slug || product.inStock === false) return cart;

  const base = cart ?? { slug, lines: [], updatedAt: new Date().toISOString() };
  const lines = [...base.lines];
  const idx = lines.findIndex((l) => l.productId === product.id);
  const maxQty = GUEST_RETAIL_CART_LIMITS.maxQtyPerLine;
  const stockCap =
    product.stockQuantity != null ? Math.min(maxQty, product.stockQuantity) : maxQty;

  if (idx >= 0) {
    const nextQty = Math.min(stockCap, lines[idx]!.quantity + delta);
    if (nextQty <= 0) lines.splice(idx, 1);
    else lines[idx] = { ...lines[idx]!, quantity: nextQty };
  } else if (delta > 0 && lines.length < GUEST_RETAIL_CART_LIMITS.maxLines) {
    lines.push({
      productId: product.id,
      quantity: Math.min(stockCap, delta),
      name: product.name,
      priceMinor: product.priceMinor,
      currency: product.currency,
      imageUrl: product.imageUrl,
    });
  }

  if (lines.length === 0) return null;
  return { slug, lines, updatedAt: new Date().toISOString() };
}

export function setGuestRetailCartLineQty(
  cart: GuestRetailCart | null,
  slug: string,
  productId: string,
  quantity: number,
): GuestRetailCart | null {
  if (!cart) return null;
  const lines = cart.lines
    .map((l) =>
      l.productId === productId
        ? {
            ...l,
            quantity: Math.max(0, Math.min(GUEST_RETAIL_CART_LIMITS.maxQtyPerLine, quantity)),
          }
        : l,
    )
    .filter((l) => l.quantity > 0);
  if (lines.length === 0) return null;
  return { slug, lines, updatedAt: new Date().toISOString() };
}

export function guestRetailCartApiItems(
  cart: GuestRetailCart,
): { productId: string; quantity: number }[] {
  return normalizeRetailCartItems(
    cart.lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
  );
}

/** Verticals that expose take-home retail on guest /b. */
export const PUBLIC_RETAIL_VERTICALS = ["beauty", "wellness"] as const;

export function isPublicRetailVertical(vertical: string | null | undefined): boolean {
  return (PUBLIC_RETAIL_VERTICALS as readonly string[]).includes(vertical ?? "");
}
