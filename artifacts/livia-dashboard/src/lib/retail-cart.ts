import { BEAUTY_RETAIL_PROGRAM, normalizeRetailCartItems } from "@workspace/policy";
import type { PublicRetailProduct } from "@/components/public-booking/public-beauty-shop";

export type RetailCartLine = {
  productId: string;
  quantity: number;
  name: string;
  priceMinor: number;
  currency: string;
  imageUrl?: string | null;
};

export type RetailCart = {
  slug: string;
  lines: RetailCartLine[];
  updatedAt: string;
};

function storageKey(slug: string): string {
  return `livia:retail-cart:${slug}`;
}

export function readRetailCart(slug: string): RetailCart | null {
  if (typeof window === "undefined" || !slug) return null;
  try {
    const raw = sessionStorage.getItem(storageKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RetailCart;
    if (parsed.slug !== slug || !Array.isArray(parsed.lines)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeRetailCart(cart: RetailCart): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(storageKey(cart.slug), JSON.stringify(cart));
}

export function clearRetailCart(slug: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(storageKey(slug));
}

export function cartLineCount(cart: RetailCart | null): number {
  return cart?.lines.reduce((n, l) => n + l.quantity, 0) ?? 0;
}

export function cartSubtotalMinor(cart: RetailCart | null): number {
  return cart?.lines.reduce((n, l) => n + l.priceMinor * l.quantity, 0) ?? 0;
}

export function cartCurrency(cart: RetailCart | null): string {
  return cart?.lines[0]?.currency ?? "EUR";
}

export function addToRetailCart(
  slug: string,
  product: PublicRetailProduct,
  delta = 1,
): RetailCart | null {
  if (!slug || product.inStock === false) return readRetailCart(slug);

  const existing = readRetailCart(slug) ?? { slug, lines: [], updatedAt: new Date().toISOString() };
  const lines = [...existing.lines];
  const idx = lines.findIndex((l) => l.productId === product.id);
  const maxQty = BEAUTY_RETAIL_PROGRAM.maxQtyPerLine;
  const stockCap =
    product.stockQuantity != null ? Math.min(maxQty, product.stockQuantity) : maxQty;

  if (idx >= 0) {
    const nextQty = Math.min(stockCap, lines[idx]!.quantity + delta);
    if (nextQty <= 0) {
      lines.splice(idx, 1);
    } else {
      lines[idx] = { ...lines[idx]!, quantity: nextQty };
    }
  } else if (delta > 0 && lines.length < BEAUTY_RETAIL_PROGRAM.maxCartLines) {
    lines.push({
      productId: product.id,
      quantity: Math.min(stockCap, delta),
      name: product.name,
      priceMinor: product.priceMinor,
      currency: product.currency,
      imageUrl: product.imageUrl,
    });
  }

  const cart: RetailCart = { slug, lines, updatedAt: new Date().toISOString() };
  writeRetailCart(cart);
  return cart;
}

export function setRetailCartQty(slug: string, productId: string, quantity: number): RetailCart | null {
  const cart = readRetailCart(slug);
  if (!cart) return null;
  const lines = cart.lines
    .map((l) =>
      l.productId === productId
        ? { ...l, quantity: Math.max(0, Math.min(BEAUTY_RETAIL_PROGRAM.maxQtyPerLine, quantity)) }
        : l,
    )
    .filter((l) => l.quantity > 0);
  const next = { slug, lines, updatedAt: new Date().toISOString() };
  if (lines.length === 0) {
    clearRetailCart(slug);
    return null;
  }
  writeRetailCart(next);
  return next;
}

export function retailCartApiItems(cart: RetailCart): { productId: string; quantity: number }[] {
  return normalizeRetailCartItems(
    cart.lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
  );
}
