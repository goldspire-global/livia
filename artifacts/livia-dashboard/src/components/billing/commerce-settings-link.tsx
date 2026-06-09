import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  isSameSettingsTabHref,
  navigateSettingsHref,
  scrollToSettingsAnchor,
} from "@/lib/commerce-fix-navigation";

/** Settings deep link that scrolls when already on the target tab (plain Link is a no-op). */
export function CommerceSettingsLink({
  href,
  label = "Fix",
  variant = "outline",
  size = "sm",
  className,
}: {
  href: string;
  label?: string;
  variant?: "outline" | "ghost" | "default" | "secondary";
  size?: "sm" | "default";
  className?: string;
}) {
  const [, navigate] = useLocation();

  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      type="button"
      onClick={() => {
        if (isSameSettingsTabHref(href)) {
          scrollToSettingsAnchor(href);
          return;
        }
        navigateSettingsHref(href, navigate);
      }}
    >
      {label}
    </Button>
  );
}
