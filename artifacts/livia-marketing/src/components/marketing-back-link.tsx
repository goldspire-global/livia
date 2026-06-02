import { ChevronLeft } from "lucide-react";
import { Link, useLocation } from "wouter";

const HOME_PATHS = new Set(["/", "/de"]);

function backFallback(path: string): { href: string; label: string } {
  if (path.startsWith("/verticals/")) {
    return { href: "/verticals", label: "All verticals" };
  }
  if (path.startsWith("/legal/")) {
    return { href: "/", label: "Home" };
  }
  return { href: "/", label: "Home" };
}

export function shouldShowMarketingBack(path: string): boolean {
  if (HOME_PATHS.has(path)) return false;
  if (path === "/demo" || path.startsWith("/demo/")) return false;
  return true;
}

export function MarketingBackLink({ className = "" }: { className?: string }) {
  const [path] = useLocation();
  const fallback = backFallback(path);

  const goBack = () => {
    const referrer = typeof document !== "undefined" ? document.referrer : "";
    const sameOrigin =
      referrer.length > 0 &&
      typeof window !== "undefined" &&
      new URL(referrer).origin === window.location.origin;

    if (sameOrigin && window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.assign(fallback.href);
  };

  return (
    <nav aria-label="Back navigation" className={`cst-back-nav ${className}`}>
      <button type="button" className="cst-back-link" onClick={goBack}>
        <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
        Back
      </button>
      <span className="cst-back-nav__sep" aria-hidden>
        ·
      </span>
      <Link href={fallback.href} className="cst-back-link cst-back-link--muted">
        {fallback.label}
      </Link>
    </nav>
  );
}
