import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-fetch";
import { Skeleton } from "@/components/ui/skeleton";
import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { beautyPanel } from "@/lib/beauty-operational-ui";

type CompassRow = {
  staffId: string;
  name: string;
  nextSlot: string | null;
  label: string;
};

export function BeautyStationCompass({
  businessId,
  beauty,
  className,
}: {
  businessId: string;
  beauty?: boolean;
  className?: string;
}) {
  const [rows, setRows] = useState<CompassRow[]>([]);
  const [serviceName, setServiceName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    void apiFetch<{ rows: CompassRow[]; serviceName?: string }>(
      `/api/businesses/${businessId}/beauty/station-compass`,
    )
      .then((r) => {
        setRows(r.rows ?? []);
        setServiceName(r.serviceName ?? null);
      })
      .catch(() => {
        setRows([]);
        setServiceName(null);
      })
      .finally(() => setLoading(false));
  }, [businessId]);

  return (
    <div
      className={cn(beautyPanel(beauty, "rounded-xl border border-border/70 p-4"), className)}
      data-testid="beauty-station-compass"
    >
      <div className="flex items-center gap-2 mb-3">
        <Compass className="h-4 w-4 text-primary" aria-hidden />
        <div>
          <p className="text-sm font-medium">Artist routing</p>
          {serviceName ? (
            <p className="text-[11px] text-muted-foreground">Next slot for {serviceName}</p>
          ) : null}
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Add team and services to see availability.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li
              key={row.staffId}
              className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 px-3 py-2 text-sm"
            >
              <span className="font-medium truncate">{row.name}</span>
              <span
                className={cn(
                  "tabular-nums text-xs shrink-0",
                  row.nextSlot ? "text-primary font-medium" : "text-muted-foreground",
                )}
              >
                {row.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
