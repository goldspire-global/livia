import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const SPRING_RISE = { type: "spring" as const, stiffness: 340, damping: 26, mass: 0.9 };
const SPRING_SETTLE = { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.8 };

type CeremonyPhase = "enter" | "active" | "exit";

type Props = {
  className?: string;
  phase: CeremonyPhase;
  size?: "sm" | "md" | "hero";
};

export function LivArrivalOrb({ className, phase, size = "md" }: Props) {
  const reduce = useReducedMotion();
  const dim =
    size === "hero" ? "h-20 w-20" : size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const icon =
    size === "hero" ? "h-9 w-9" : size === "sm" ? "h-4 w-4" : "h-5 w-5";

  const orbBody = (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full border border-primary/40",
        "bg-gradient-to-br from-primary/35 via-primary/15 to-[hsl(var(--chart-1))]/20 text-primary",
        "shadow-[0_0_48px_hsl(var(--primary)/0.35),0_12px_40px_hsl(var(--primary)/0.2)]",
        dim,
        phase === "active" && "motion-liv-pulse",
      )}
    >
      <span
        className="pointer-events-none absolute -inset-3 rounded-full bg-primary/20 blur-xl motion-glow-success"
        aria-hidden
      />
      <Sparkles className={cn(icon, "relative z-[1]")} />
    </div>
  );

  if (reduce) {
    return (
      <div className={cn("relative shrink-0", className)} aria-hidden>
        {orbBody}
      </div>
    );
  }

  const entering = phase === "enter";
  const exiting = phase === "exit";

  return (
    <motion.div
      className={cn("relative shrink-0", className)}
      initial={
        entering
          ? { scale: 0.15, y: 80, opacity: 0, filter: "blur(8px)" }
          : { scale: 1, y: 0, opacity: 1 }
      }
      animate={
        exiting
          ? { scale: 0.2, y: 48, opacity: 0, filter: "blur(6px)" }
          : entering
            ? { scale: 1.08, y: 0, opacity: 1, filter: "blur(0px)" }
            : { scale: 1, y: 0, opacity: 1, filter: "blur(0px)" }
      }
      transition={entering ? SPRING_RISE : exiting ? { duration: 0.36, ease: [0.4, 0, 1, 1] } : SPRING_SETTLE}
      aria-hidden
    >
      {orbBody}
    </motion.div>
  );
}

export type { CeremonyPhase };
