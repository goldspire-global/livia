import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Compass, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PresentationLayoutMorph } from "@workspace/policy";
import {
  filterWellnessBrowseCatalog,
  wellnessBrowseCatalog,
  wellnessGuestBrowseEntries,
  type WellnessBrowseEntry,
} from "@workspace/policy";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  morph: PresentationLayoutMorph;
  teamNoun: string;
  serviceNoun: string;
  businessSlug?: string;
  activeId: string | null;
};

function groupEntries(entries: WellnessBrowseEntry[]): Map<string, WellnessBrowseEntry[]> {
  const map = new Map<string, WellnessBrowseEntry[]>();
  for (const entry of entries) {
    const list = map.get(entry.group) ?? [];
    list.push(entry);
    map.set(entry.group, list);
  }
  return map;
}

export function WellnessCompassDialog({
  open,
  onOpenChange,
  morph,
  teamNoun,
  serviceNoun,
  businessSlug,
  activeId,
}: Props) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const catalog = useMemo(
    () => wellnessBrowseCatalog(morph, teamNoun, serviceNoun),
    [morph, teamNoun, serviceNoun],
  );
  const filtered = useMemo(() => filterWellnessBrowseCatalog(catalog, query), [catalog, query]);
  const grouped = useMemo(() => groupEntries(filtered), [filtered]);
  const guestEntries = businessSlug ? wellnessGuestBrowseEntries(businessSlug) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="wellness-compass-dialog sm:max-w-md p-0 gap-0 overflow-hidden" data-testid="wellness-compass-dialog">
        <DialogHeader className="px-4 pt-4 pb-2 space-y-2">
          <DialogTitle className="flex items-center gap-2 text-base font-serif">
            <Compass className="h-4 w-4 text-primary" aria-hidden />
            Go anywhere
          </DialogTitle>
          <DialogDescription className="text-left text-xs">
            Jump to any wellness surface — floor ops, guests, insight, studio, or guest-facing preview.
          </DialogDescription>
          <Input
            autoFocus
            placeholder="Search — reception, retail, vault…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9"
            data-testid="wellness-compass-search"
          />
        </DialogHeader>

        <div className="max-h-[min(22rem,55vh)] overflow-y-auto px-2 pb-3">
          {[...grouped.entries()].map(([group, items]) => (
            <div key={group} className="mb-2 last:mb-0">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </p>
              <ul className="space-y-0.5">
                {items.map((item) => (
                  <li key={item.id + item.href}>
                    <Link
                      href={item.href}
                      onClick={() => onOpenChange(false)}
                      data-testid={`wellness-compass-${item.id}`}
                      className={cn(
                        "flex flex-col rounded-lg px-2.5 py-2 transition-colors hover:bg-muted/80",
                        activeId === item.id && "bg-primary/10",
                      )}
                    >
                      <span className={cn("text-sm font-medium", activeId === item.id && "text-primary")}>
                        {item.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {guestEntries.length > 0 && !query.trim() ? (
            <div className="mt-2 border-t border-border/60 pt-2">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Guest-facing
              </p>
              <ul className="space-y-0.5">
                {guestEntries.map((item) =>
                  item.external ? (
                    <li key={item.id}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-lg px-2.5 py-2 hover:bg-muted/80"
                      >
                        <span className="text-sm">{item.label}</span>
                        <ExternalLink className="h-3.5 w-3.5 opacity-50" />
                      </a>
                    </li>
                  ) : (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={() => onOpenChange(false)}
                        className="block rounded-lg px-2.5 py-2 text-sm hover:bg-muted/80"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ) : null}

          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-sm text-center text-muted-foreground">No matches — try inbox, reports, retail…</p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useWellnessCompassShortcut(onOpen: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpen();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, onOpen]);
}
