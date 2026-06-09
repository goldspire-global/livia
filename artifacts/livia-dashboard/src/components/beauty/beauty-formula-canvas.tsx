import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PencilLine } from "lucide-react";
import { beautyPanel } from "@/lib/beauty-operational-ui";

export type BeautyFormulaValues = {
  formulaNotes: string;
  formulaSketchUrl: string;
};

export function BeautyFormulaCanvas({
  initial,
  disabled,
  onSave,
  saving,
}: {
  initial: BeautyFormulaValues;
  disabled?: boolean;
  saving?: boolean;
  onSave: (values: BeautyFormulaValues) => void;
}) {
  const [formulaNotes, setFormulaNotes] = useState(initial.formulaNotes);
  const [formulaSketchUrl, setFormulaSketchUrl] = useState(initial.formulaSketchUrl);

  return (
    <div className={beautyPanel(true, "rounded-xl border border-border/70 p-4 space-y-4")} data-testid="beauty-formula-canvas">
      <div className="flex items-center gap-2">
        <PencilLine className="h-4 w-4 text-primary" aria-hidden />
        <div>
          <p className="text-sm font-medium">Formula & mapping</p>
          <p className="text-[11px] text-muted-foreground">
            Colour notes and Apple Pencil sketch URL — travels with the guest profile.
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="formula-notes">Formula notes</Label>
        <Textarea
          id="formula-notes"
          value={formulaNotes}
          onChange={(e) => setFormulaNotes(e.target.value)}
          placeholder="e.g. 6/71 + 20vol, mapped C curl 11mm outer…"
          rows={4}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="formula-sketch">Sketch URL</Label>
        <Input
          id="formula-sketch"
          value={formulaSketchUrl}
          onChange={(e) => setFormulaSketchUrl(e.target.value)}
          placeholder="https://… (Pencil export or photo)"
          disabled={disabled}
        />
        {formulaSketchUrl.trim() ? (
          <a
            href={formulaSketchUrl.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            Open sketch
          </a>
        ) : null}
      </div>
      <Button
        type="button"
        size="sm"
        disabled={disabled || saving}
        onClick={() => onSave({ formulaNotes, formulaSketchUrl })}
      >
        {saving ? "Saving…" : "Save formula"}
      </Button>
    </div>
  );
}
