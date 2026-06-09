type NavigateFn = (to: string, options?: { replace?: boolean }) => void;

/** Scroll to a toolkit anchor and open any parent disclosure. */
export function scrollToToolkitAnchor(href: string): void {
  if (typeof window === "undefined") return;
  const url = new URL(href, window.location.origin);
  const hash = url.hash.replace("#", "");
  if (!hash) return;
  const el = document.getElementById(hash);
  if (!el) return;

  let node: HTMLElement | null = el;
  while (node) {
    if (node instanceof HTMLDetailsElement && !node.open) {
      node.open = true;
    }
    node = node.parentElement;
  }

  el.scrollIntoView({ behavior: "smooth", block: "start" });
  el.classList.add("ring-2", "ring-violet-500/50", "ring-offset-2", "ring-offset-background");
  window.setTimeout(() => {
    el.classList.remove("ring-2", "ring-violet-500/50", "ring-offset-2", "ring-offset-background");
  }, 2200);
}

/** Navigate to toolkit (or scroll in place) and focus an anchor section. */
export function navigateToolkitHref(href: string, navigate: NavigateFn): void {
  if (typeof window === "undefined") return;
  const onToolkit = window.location.pathname.endsWith("/toolkit");
  if (onToolkit && href.startsWith("/toolkit#")) {
    scrollToToolkitAnchor(href);
    return;
  }
  navigate(href);
  window.setTimeout(() => scrollToToolkitAnchor(href), 220);
}
