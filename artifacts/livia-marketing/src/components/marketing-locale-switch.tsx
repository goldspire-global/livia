import { Globe } from "lucide-react";
import { Link, useLocation } from "wouter";

type MarketingLocaleSwitchProps = {
  className?: string;
};

/** Hand-crafted EN home vs DE home — not auto-translate. */
export function MarketingLocaleSwitch({ className = "" }: MarketingLocaleSwitchProps) {
  const [path] = useLocation();
  const isDeHome = path === "/de" || path.startsWith("/de/");

  const linkClass = (active: boolean) =>
    `mkt-locale__link${active ? " mkt-locale__link--active" : ""}`;

  return (
    <nav aria-label="Language" className={`mkt-locale ${className}`.trim()}>
      <Globe className="mkt-locale__icon" aria-hidden />
      <Link href="/" className={linkClass(!isDeHome)} aria-current={!isDeHome ? "page" : undefined}>
        EN
      </Link>
      <span className="mkt-locale__sep" aria-hidden>
        |
      </span>
      <Link href="/de" className={linkClass(isDeHome)} aria-current={isDeHome ? "page" : undefined}>
        DE
      </Link>
    </nav>
  );
}
