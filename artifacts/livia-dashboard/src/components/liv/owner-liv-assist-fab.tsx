import { useState } from "react";
import { useLocation } from "wouter";
import { useGetOwnerIntelligence } from "@workspace/api-client-react";
import { ownerIntelligenceActSignalCount } from "@workspace/policy";
import { useBusiness } from "@/lib/business-context";
import { useMembership } from "@/lib/membership-context";
import { usePersona } from "@/lib/persona";
import { OwnerLivOpsPanel } from "@/components/liv/owner-liv-ops-panel";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/** Global owner Liv ops entry — commerce, twin, capability facts. */
export function OwnerLivAssistFab() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { business } = useBusiness();
  const { effectiveRole } = useMembership();
  const { kind: persona } = usePersona();
  const bid = business?.id ?? "";

  const isOwnerSurface =
    ["OWNER", "ADMIN"].includes(effectiveRole ?? "") ||
    persona === "owner" ||
    persona === "manager";

  const { data } = useGetOwnerIntelligence(bid, {
    query: { enabled: !!bid && isOwnerSurface } as never,
  });

  if (!bid || !isOwnerSurface) return null;
  if (location.startsWith("/inbox")) return null;

  const actCount = ownerIntelligenceActSignalCount(data ?? undefined);

  return (
    <>
      <Button
        type="button"
        size="icon"
        data-testid="owner-liv-assist-fab"
        aria-label={actCount > 0 ? `Owner ops with Liv (${actCount})` : "Owner ops with Liv"}
        title="Owner ops with Liv"
        className={cn(
          "fixed z-40 rounded-full shadow-lg h-12 w-12 relative",
          "bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-6 right-4 md:right-6",
          "bg-gradient-to-r from-primary to-[hsl(var(--chart-1))] text-primary-foreground",
        )}
        onClick={() => setOpen(true)}
      >
        <Sparkles className="h-5 w-5" />
        {actCount > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-background text-foreground text-[10px] font-bold px-1 flex items-center justify-center tabular-nums border border-border shadow-sm">
            {actCount > 9 ? "9+" : actCount}
          </span>
        ) : null}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Owner ops with Liv</SheetTitle>
            <SheetDescription>
              {data?.twinHeadline ??
                "Commerce, setup health, and Twin — grounded in your shop facts."}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <OwnerLivOpsPanel compact />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
