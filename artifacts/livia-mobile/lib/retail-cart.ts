import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addGuestRetailCartLine,
  guestRetailCartApiItems,
  guestRetailCartCurrency,
  guestRetailCartLineCount,
  guestRetailCartQty,
  guestRetailCartSubtotalMinor,
  setGuestRetailCartLineQty,
  type GuestRetailCart,
  type GuestRetailCartProduct,
} from "@workspace/policy";

export type RetailCart = GuestRetailCart;
export type RetailCartProduct = GuestRetailCartProduct;

const storageKey = (slug: string) => `livia:retail-cart:${slug}`;

export async function readRetailCart(slug: string): Promise<RetailCart | null> {
  if (!slug) return null;
  try {
    const raw = await AsyncStorage.getItem(storageKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RetailCart;
    if (parsed.slug !== slug || !Array.isArray(parsed.lines)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function writeRetailCart(cart: RetailCart): Promise<void> {
  await AsyncStorage.setItem(storageKey(cart.slug), JSON.stringify(cart));
}

export async function clearRetailCart(slug: string): Promise<void> {
  await AsyncStorage.removeItem(storageKey(slug));
}

export const cartLineCount = guestRetailCartLineCount;
export const cartSubtotalMinor = guestRetailCartSubtotalMinor;
export const cartCurrency = guestRetailCartCurrency;
export const retailCartQty = guestRetailCartQty;
export const retailCartApiItems = guestRetailCartApiItems;

export async function addToRetailCart(
  slug: string,
  product: RetailCartProduct,
  cart: RetailCart | null,
  delta = 1,
): Promise<RetailCart | null> {
  const next = addGuestRetailCartLine(cart, slug, product, delta);
  if (!next) {
    await clearRetailCart(slug);
    return null;
  }
  await writeRetailCart(next);
  return next;
}

export async function setRetailCartQty(
  slug: string,
  cart: RetailCart | null,
  productId: string,
  quantity: number,
): Promise<RetailCart | null> {
  const next = setGuestRetailCartLineQty(cart, slug, productId, quantity);
  if (!next) {
    await clearRetailCart(slug);
    return null;
  }
  await writeRetailCart(next);
  return next;
}
