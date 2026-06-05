import { pendingApprovalGuidance, pendingReasonLabel } from "@/lib/booking-pending";
import { cn } from "@/lib/utils";

type Props = {
  reason?: string | null;
  vertical?: string | null;
  category?: string | null;
  /** Show owner next-step guidance (Today / room board). */
  showGuidance?: boolean;
  className?: string;
};

/** Why a session is PENDING — label + optional Liv/policy guidance. */
export function PendingWhyLine({
  reason,
  vertical,
  category,
  showGuidance = true,
  className,
}: Props) {
  const label = pendingReasonLabel(reason, vertical, category);
  const guidance = showGuidance
    ? pendingApprovalGuidance(reason, vertical, category)
    : null;

  return (
    <div className={cn("space-y-0.5 min-w-0", className)} data-testid="pending-why-line">
      <p className="text-[10px] font-medium leading-snug text-[hsl(var(--wellness-pending-fg,38_92%_35%))] dark:text-amber-300">
        {label}
      </p>
      {guidance ? (
        <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">{guidance}</p>
      ) : null}
    </div>
  );
}
