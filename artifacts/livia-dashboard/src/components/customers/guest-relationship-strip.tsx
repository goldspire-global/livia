import { Link } from "wouter";
import { useGetCustomerRelationship } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";

const STAGE_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  trusted: "default",
  active: "default",
  new: "secondary",
  prospect: "outline",
  at_risk: "destructive",
  lapsed: "destructive",
};

/** One-line relationship context on the contact card — not a separate panel. */
export function GuestRelationshipStrip({
  businessId,
  customerId,
}: {
  businessId: string;
  customerId: string;
}) {
  const { data, isLoading } = useGetCustomerRelationship(businessId, customerId, {
    query: { enabled: !!businessId && !!customerId } as never,
  });

  if (isLoading) {
    return <p className="text-xs text-muted-foreground mt-2">Loading relationship…</p>;
  }
  if (!data) return null;

  const rel = data as {
    stage?: string;
    stageLabel?: string;
    headline?: string;
    conversationCount?: number;
  };

  return (
    <div
      className="mt-3 pt-3 border-t border-border/60 space-y-2"
      data-testid="guest-relationship-strip"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {rel.stageLabel ? (
          <Badge variant={STAGE_VARIANT[rel.stage ?? ""] ?? "outline"} className="text-[10px]">
            {rel.stageLabel}
          </Badge>
        ) : null}
        {(rel.conversationCount ?? 0) > 0 ? (
          <Link
            href="/inbox"
            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
          >
            <MessageCircle className="h-3 w-3" />
            {rel.conversationCount} thread{rel.conversationCount === 1 ? "" : "s"}
          </Link>
        ) : null}
      </div>
      {rel.headline ? (
        <p className="text-xs text-muted-foreground leading-snug">{rel.headline}</p>
      ) : null}
    </div>
  );
}
