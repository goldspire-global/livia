import { useState } from "react";
import { cn } from "@/lib/utils";

function productInitial(name: string): string {
  const t = name.trim();
  return t ? t.charAt(0).toUpperCase() : "?";
}

/** Retail product image with letter placeholder when missing or broken. */
export function PublicRetailProductThumb({
  name,
  imageUrl,
  className,
}: {
  name: string;
  imageUrl?: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = imageUrl?.trim();

  if (!src || failed) {
    return (
      <div
        className={cn(
          "public-shop-card-thumb public-shop-card-thumb--placeholder flex items-center justify-center bg-muted/80 text-muted-foreground",
          className,
        )}
        aria-hidden
      >
        <span
          className="text-lg font-medium select-none text-primary/70"
          style={{ fontFamily: "var(--app-font-serif)" }}
        >
          {productInitial(name)}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className={cn("public-shop-card-thumb object-cover", className)}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
