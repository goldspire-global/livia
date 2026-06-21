import type { BusinessVertical } from "./types";
import { resolveVerticalKey } from "./vocabulary";

export type LivMemoryKindOption = {
  value: string;
  label: string;
};

const DEFAULT_PLACEHOLDER =
  "e.g. Prefers morning slots · patch test due every 6 months";

const WELLNESS_PLACEHOLDER =
  "e.g. Medium pressure · female therapist only · light oil allergy";

const WELLNESS_KINDS: LivMemoryKindOption[] = [
  { value: "note", label: "General note" },
  { value: "preference", label: "Session preference" },
  { value: "pressure", label: "Pressure / technique" },
  { value: "therapist_pref", label: "Therapist preference" },
  { value: "health_light", label: "Health note (light)" },
];

const DEFAULT_KINDS: LivMemoryKindOption[] = [
  { value: "note", label: "Note" },
  { value: "preference", label: "Preference" },
  { value: "ritual", label: "Ritual" },
];

const AUTOMOTIVE_KINDS: LivMemoryKindOption[] = [
  { value: "note", label: "Note" },
  { value: "vehicle", label: "Vehicle detail" },
  { value: "preference", label: "Service preference" },
];

const AUTOMOTIVE_PLACEHOLDER =
  "e.g. Ceramic coat 2021 · prefers hand wash · reg ABC123";

export function livMemoryPlaceholder(
  vertical?: string | null,
  category?: string | null,
): string {
  const key = resolveVerticalKey(vertical, category);
  if (key === "wellness") return WELLNESS_PLACEHOLDER;
  if (vertical === "automotive-detailing") return AUTOMOTIVE_PLACEHOLDER;
  return DEFAULT_PLACEHOLDER;
}

export function livMemoryKindOptions(
  vertical?: string | null,
  category?: string | null,
): LivMemoryKindOption[] {
  const key = resolveVerticalKey(vertical, category);
  if (key === "wellness") return WELLNESS_KINDS;
  if (vertical === "automotive-detailing") return AUTOMOTIVE_KINDS;
  return DEFAULT_KINDS;
}

export function isAllowedLivMemoryKind(
  kind: string,
  vertical?: string | null,
  category?: string | null,
): boolean {
  const allowed = livMemoryKindOptions(vertical, category).map((k) => k.value);
  return allowed.includes(kind);
}
