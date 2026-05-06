import { useEffect, useState } from "react";

const MIN = 60_000;

function format(targetMs: number, nowMs: number): string {
  const delta = targetMs - nowMs;
  const past = delta < 0;
  const abs = Math.abs(delta);
  const mins = Math.round(abs / MIN);
  if (mins < 1) return past ? "just now" : "in moments";
  if (mins < 60) return past ? `${mins} min ago` : `in ${mins} min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return past ? `${hrs}h ago` : `in ${hrs}h`;
  const days = Math.round(hrs / 24);
  return past ? `${days}d ago` : `in ${days}d`;
}

export function useRelativeTime(iso: string | null | undefined): string {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), MIN);
    return () => clearInterval(id);
  }, []);
  if (!iso) return "";
  return format(new Date(iso).getTime(), now);
}
