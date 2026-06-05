import { useEffect, useRef } from "react";
import { resolveWellnessExperience, type WellnessCssPreset } from "@workspace/policy";
import { readWellnessAmbientTier } from "@/lib/wellness-ambient";

/**
 * Canvas-driven ambient field — policy tokens, not preset CSS alone.
 * Dual drifting orbs + breath opacity; disabled when prefers-reduced-motion.
 */
export function WellnessAtmosphere({ cssPreset }: { cssPreset: WellnessCssPreset | string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const profile = resolveWellnessExperience(cssPreset ?? undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !profile) return;

    const tier = readWellnessAmbientTier();
    if (tier === "reduced" || profile.ambience.driftTier === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let raf = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const period = profile.ambience.breathPeriodMs;
    const drift = profile.ambience.driftTier;

    const draw = (t: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w <= 0 || h <= 0) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const breath = 0.88 + 0.12 * Math.sin((t / period) * Math.PI * 2);
      ctx.clearRect(0, 0, w, h);

      const orbs =
        drift >= 2
          ? [
              {
                x: w * (0.25 + 0.08 * Math.sin(t / 12000)),
                y: h * (0.2 + 0.06 * Math.cos(t / 9000)),
                r: Math.min(w, h) * 0.45,
                color: profile.ambience.glowSecondary,
              },
              {
                x: w * (0.78 + 0.05 * Math.cos(t / 14000)),
                y: h * (0.65 + 0.07 * Math.sin(t / 11000)),
                r: Math.min(w, h) * 0.38,
                color: profile.ambience.glowPrimary,
              },
            ]
          : [
              {
                x: w * 0.5,
                y: h * 0.35,
                r: Math.min(w, h) * 0.5,
                color: profile.ambience.glowPrimary,
              },
            ];

      for (const orb of orbs) {
        const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        const baseAlpha = breath * 0.35;
        const midAlpha = breath * 0.12;
        // Colors are hsla(..., A) — scale alpha via layered stops
        g.addColorStop(0, orb.color);
        g.addColorStop(0.55, orb.color);
        g.addColorStop(1, "transparent");
        ctx.globalAlpha = baseAlpha;
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = midAlpha;
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
      }

      if (profile.ambience.candleFlicker) {
        const flicker = 0.04 * Math.sin(t / 180) * Math.sin(t / 430);
        ctx.fillStyle = `hsla(38, 55%, 58%, ${0.03 + flicker})`;
        ctx.fillRect(0, h * 0.7, w, h * 0.3);
      }

      frame += 1;
      if (frame % 120 === 0) resize();
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [profile, cssPreset]);

  if (!profile) return null;

  return (
    <canvas
      ref={canvasRef}
      className="wellness-atmosphere-canvas"
      aria-hidden
      data-testid="wellness-atmosphere"
    />
  );
}
