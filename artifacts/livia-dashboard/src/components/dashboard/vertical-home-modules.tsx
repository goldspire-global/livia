import { useState } from "react";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { useBusiness } from "@/lib/business-context";
import { verticalHomeModules } from "@/lib/vertical-features";
import { verticalPackUi } from "@/lib/vertical-pack-ui";
import { getVerticalPlaybook, resolveVerticalFromCategory, VERTICAL_HOME_SHORTCUTS_VISIBLE, type BusinessVertical } from "@workspace/policy";
import { MOTION } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function VerticalHomeModules() {
  const { business } = useBusiness();
  const vertical = (business as { vertical?: string; category?: string } | undefined)?.vertical;
  const category = business?.category;
  const modules = verticalHomeModules(vertical, category);
  const vocab = verticalPackUi(vertical, category);
  const vKey = (vertical ?? resolveVerticalFromCategory(category)) as BusinessVertical;
  const playbook = getVerticalPlaybook(vKey);
  const [showAll, setShowAll] = useState(false);

  if (modules.length === 0) return null;

  const visible = showAll ? modules : modules.slice(0, VERTICAL_HOME_SHORTCUTS_VISIBLE);
  const hiddenCount = modules.length - VERTICAL_HOME_SHORTCUTS_VISIBLE;

  return (
    <section className="space-y-2" data-testid="vertical-home-modules">
      <p className="text-[11px] text-muted-foreground leading-snug">
        <span className="font-mono uppercase tracking-wider">{vocab.label}</span>
        <span className="mx-1.5">·</span>
        {playbook.wedge}
      </p>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {visible.map((m, i) => {
          const Icon = m.icon;
          return (
            <Link key={m.id} href={m.href}>
              <div
                data-testid={m.testId}
                className={cn(
                  "group flex items-center gap-2.5 rounded-lg border border-border/70 bg-card/50 px-2.5 py-2",
                  "hover:border-primary/40 hover:bg-primary/5 transition-colors",
                  MOTION.listItem,
                )}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{m.title}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{m.description}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-50 group-hover:opacity-100" />
              </div>
            </Link>
          );
        })}
      </div>
      {!showAll && hiddenCount > 0 ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-xs w-full"
          onClick={() => setShowAll(true)}
        >
          Show {hiddenCount} more shortcut{hiddenCount === 1 ? "" : "s"}
        </Button>
      ) : null}
    </section>
  );
}
