import { Link } from "wouter";
import { LiviaWordmark } from "@/components/brand/LiviaMark";
import { cn } from "@/lib/utils";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

type Props = {
  href?: string;
  size?: "sm" | "md" | "lg" | "nav";
  className?: string;
};

/** Top-of-page Livia wordmark — links to marketing home (`/` or `/de`). */
export function LiviaLogoLink({ href, size = "nav", className }: Props) {
  const dest = href ?? (base || "/");
  return (
    <Link
      href={dest}
      className={cn(
        "inline-flex shrink-0 opacity-90 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm",
        className,
      )}
      aria-label="Livia home"
    >
      <LiviaWordmark size={size} />
    </Link>
  );
}
