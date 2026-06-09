import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useInAppNotifications } from "@/hooks/use-in-app-notifications";
import { useBusiness } from "@/lib/business-context";
import { useMembership } from "@/lib/membership-context";
import { Button } from "@/components/ui/button";

const TOAST_KINDS = new Set(["twin.risk", "twin.opportunity", "commerce.signal", "payment.failed"]);

/** Surface act-priority in-app alerts as ephemeral toasts (Twin risks, commerce). */
export function useActNotificationToasts() {
  const { toast } = useToast();
  const { business } = useBusiness();
  const { effectiveRole } = useMembership();
  const { notifications } = useInAppNotifications();
  const seenRef = useRef<Set<string>>(new Set());
  const bid = business?.id ?? "";

  const isOwnerSurface = ["OWNER", "ADMIN"].includes(effectiveRole ?? "");

  useEffect(() => {
    if (!bid || !isOwnerSurface) return;

    for (const n of notifications) {
      if (n.readAt || n.priority !== "act" || !TOAST_KINDS.has(n.kind)) continue;
      if (seenRef.current.has(n.id)) continue;
      seenRef.current.add(n.id);

      toast({
        title: n.title,
        description: n.body,
        variant: n.kind === "twin.risk" ? "destructive" : "default",
        action: n.href ? (
          <Button variant="outline" size="sm" className="h-8" asChild>
            <Link href={n.href}>Open</Link>
          </Button>
        ) : undefined,
      });
    }
  }, [notifications, bid, isOwnerSurface, toast]);
}
