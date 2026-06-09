import { useMemo, useState } from "react";
import {
  BEAUTY_LASH_CURL_OPTIONS,
  BEAUTY_NAIL_SHAPE_OPTIONS,
  beautyClientPatchTestLabel,
  parseBeautyPreferences,
} from "@workspace/policy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BeautyFormulaCanvas } from "@/components/beauty/beauty-formula-canvas";
import { AlertTriangle, Sparkles } from "lucide-react";

type CustomerBeautyFields = {
  patchTestCompletedAt?: string | null;
  beautyPreferences?: unknown;
};

export function BeautyClientPanel({
  customer,
  canEdit,
  onSavePatchTest,
  onSavePreferences,
  saving,
}: {
  customer: CustomerBeautyFields;
  canEdit: boolean;
  saving?: boolean;
  onSavePatchTest: (isoDate: string | null) => void;
  onSavePreferences: (prefs: Record<string, unknown>) => void;
}) {
  const prefs = useMemo(
    () => parseBeautyPreferences(customer.beautyPreferences) ?? {},
    [customer.beautyPreferences],
  );
  const [patchDate, setPatchDate] = useState(() => {
    if (!customer.patchTestCompletedAt) return "";
    const d = new Date(customer.patchTestCompletedAt);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
  });
  const [lashCurl, setLashCurl] = useState(prefs.lashCurl ?? "");
  const [lashLength, setLashLength] = useState(prefs.lashLength ?? "");
  const [nailShape, setNailShape] = useState(prefs.nailShape ?? "");
  const [adhesiveSensitivity, setAdhesiveSensitivity] = useState(prefs.adhesiveSensitivity ?? false);

  const patchLabel = beautyClientPatchTestLabel(customer.patchTestCompletedAt);
  const patchMissing = !customer.patchTestCompletedAt;

  return (
    <div className="space-y-4" data-testid="beauty-client-panel">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
            Beauty profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={patchMissing ? "destructive" : "secondary"}>{patchLabel}</Badge>
            {patchMissing ? (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" aria-hidden />
                Required before lash or tint services
              </span>
            ) : null}
          </div>
          {canEdit ? (
            <div className="flex flex-wrap items-end gap-2">
              <div className="space-y-1">
                <Label htmlFor="patch-test-date">Patch test date</Label>
                <Input
                  id="patch-test-date"
                  type="date"
                  value={patchDate}
                  onChange={(e) => setPatchDate(e.target.value)}
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={saving}
                onClick={() => onSavePatchTest(patchDate ? new Date(patchDate).toISOString() : null)}
              >
                Save patch test
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={saving}
                onClick={() => {
                  const today = new Date().toISOString().slice(0, 10);
                  setPatchDate(today);
                  onSavePatchTest(new Date().toISOString());
                }}
              >
                Mark done today
              </Button>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Lash curl</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={lashCurl}
                disabled={!canEdit}
                onChange={(e) => setLashCurl(e.target.value)}
              >
                <option value="">—</option>
                {BEAUTY_LASH_CURL_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Lash length</Label>
              <Input
                value={lashLength}
                disabled={!canEdit}
                onChange={(e) => setLashLength(e.target.value)}
                placeholder="e.g. 10–12mm mix"
              />
            </div>
            <div className="space-y-1">
              <Label>Nail shape</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={nailShape}
                disabled={!canEdit}
                onChange={(e) => setNailShape(e.target.value)}
              >
                <option value="">—</option>
                {BEAUTY_NAIL_SHAPE_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm pt-6">
              <input
                type="checkbox"
                checked={adhesiveSensitivity}
                disabled={!canEdit}
                onChange={(e) => setAdhesiveSensitivity(e.target.checked)}
              />
              Adhesive sensitivity
            </label>
          </div>
          {canEdit ? (
            <Button
              type="button"
              size="sm"
              disabled={saving}
              onClick={() =>
                onSavePreferences({
                  lashCurl: lashCurl || null,
                  lashLength: lashLength || null,
                  nailShape: nailShape || null,
                  adhesiveSensitivity,
                  formulaNotes: prefs.formulaNotes ?? null,
                  formulaSketchUrl: prefs.formulaSketchUrl ?? null,
                })
              }
            >
              Save preferences
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {canEdit ? (
        <BeautyFormulaCanvas
          initial={{
            formulaNotes: prefs.formulaNotes ?? "",
            formulaSketchUrl: prefs.formulaSketchUrl ?? "",
          }}
          disabled={!canEdit}
          saving={saving}
          onSave={(vals) =>
            onSavePreferences({
              lashCurl: lashCurl || null,
              lashLength: lashLength || null,
              nailShape: nailShape || null,
              adhesiveSensitivity,
              formulaNotes: vals.formulaNotes.trim() || null,
              formulaSketchUrl: vals.formulaSketchUrl.trim() || null,
            })
          }
        />
      ) : null}
    </div>
  );
}
