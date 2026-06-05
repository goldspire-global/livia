import { useEffect, useState } from "react";
import { useBusiness } from "@/lib/business-context";
import { apiFetch } from "@/lib/api-fetch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Moon } from "lucide-react";

type EodClose = {
  lines: string[];
  stats: { noShows: number; pending: number; completed: number; tomorrowCount: number };
};

export function WellnessEodCard() {
  const { business } = useBusiness();
  const bid = business?.id ?? "";
  const [data, setData] = useState<EodClose | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bid) return;
    setLoading(true);
    void apiFetch<EodClose>(`/api/businesses/${bid}/wellness/eod-close`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [bid]);

  if (loading) return <Skeleton className="h-32 w-full" data-testid="wellness-eod-loading" />;
  if (!data) return null;

  return (
    <Card data-testid="wellness-eod-close">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Moon className="h-4 w-4" />
          End-of-day close
        </CardTitle>
        <CardDescription>Liv ritual summary before you leave the desk</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="text-sm space-y-1 text-muted-foreground">
          {data.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
