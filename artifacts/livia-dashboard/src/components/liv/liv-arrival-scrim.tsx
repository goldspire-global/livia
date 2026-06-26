import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export type CeremonyPhase = "enter" | "active" | "exit";

/** Full-viewport dim + blur while Liv conductor is in ceremony. */
export function LivArrivalScrim({
  phase,
  className,
}: {
  phase: CeremonyPhase;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (typeof document === "undefined") return null;

  const visible = phase !== "exit";
  const targetOpacity = phase === "enter" ? 0.62 : phase === "active" ? 0.52 : 0;

  const body = reduce ? (
    visible ? (
      <div
        className={cn("fixed inset-0 z-[55] bg-black/50 pointer-events-auto", className)}
        aria-hidden
        data-testid="liv-arrival-scrim"
      />
    ) : null
  ) : (
    <motion.div
      className={cn(
        "fixed inset-0 z-[55] pointer-events-auto",
        "bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.14)_0%,transparent_50%)]",
        className,
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? targetOpacity : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: phase === "exit" ? 0.38 : 0.55, ease: EASE_OUT }}
      style={{ backdropFilter: visible ? "blur(6px)" : undefined }}
      aria-hidden
      data-testid="liv-arrival-scrim"
    />
  );

  return createPortal(body, document.body);
}
