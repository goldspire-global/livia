import { useEffect, useState } from "react";
import { detectSurfaceClass, type SurfaceClass } from "@/lib/wellness-ambient";

/** SURFACE-AND-BREAKPOINTS — phone / tablet / desktop for wellness ergonomics + split panes */
export function useSurfaceClass(): SurfaceClass {
  const [surface, setSurface] = useState<SurfaceClass>(() =>
    typeof window !== "undefined" ? detectSurfaceClass() : "desktop",
  );

  useEffect(() => {
    const update = () => setSurface(detectSurfaceClass());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return surface;
}
