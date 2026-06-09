import { formatCurrency } from "@/lib/format";
import {
  cartCurrency,
  cartLineCount,
  cartSubtotalMinor,
  type RetailCart,
} from "@/lib/retail-cart";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PublicRetailCartBar({
  cart,
  checkoutBusy,
  onCheckout,
  className,
}: {
  cart: RetailCart;
  checkoutBusy?: boolean;
  onCheckout: () => void;
  className?: string;
}) {
  const count = cartLineCount(cart);
  if (count === 0) return null;

  const subtotal = cartSubtotalMinor(cart);
  const currency = cartCurrency(cart);

  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 border-t border-border/80 bg-background/95 backdrop-blur-md px-4 py-3",
        className,
      )}
      data-testid="public-retail-cart-bar"
    >
      <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-primary shrink-0" />
            Bag · {count} {count === 1 ? "item" : "items"}
          </p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {formatCurrency(subtotal, currency)} subtotal
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          disabled={checkoutBusy}
          onClick={onCheckout}
          data-testid="public-retail-cart-checkout"
        >
          {checkoutBusy ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
          Checkout
        </Button>
      </div>
    </div>
  );
}
