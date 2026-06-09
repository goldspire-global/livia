/**
 * Allied health service typing — assessment vs follow-up (Innovation P0).
 */

export const ALLIED_SERVICE_KINDS = [
  "initial_assessment",
  "follow_up",
  "sports_screen",
  "other",
] as const;

export type AlliedServiceKind = (typeof ALLIED_SERVICE_KINDS)[number];

export function inferAlliedServiceKind(name: string, category?: string | null): AlliedServiceKind {
  const n = name.toLowerCase();
  const c = (category ?? "").toLowerCase();
  if (n.includes("assessment") || n.includes("initial") || c.includes("assessment")) {
    return "initial_assessment";
  }
  if (n.includes("follow") || n.includes("review") || c.includes("follow")) {
    return "follow_up";
  }
  if (n.includes("screen") || n.includes("sports")) return "sports_screen";
  return "other";
}

export function alliedServiceKindLabel(kind: AlliedServiceKind): string {
  switch (kind) {
    case "initial_assessment":
      return "Initial assessment";
    case "follow_up":
      return "Follow-up";
    case "sports_screen":
      return "Sports screening";
    default:
      return "Session";
  }
}

export function groupAlliedServicesByKind<
  T extends { name: string; category?: string | null; serviceKind?: string | null },
>(services: T[]): Array<{ kind: AlliedServiceKind; label: string; services: T[] }> {
  const map = new Map<AlliedServiceKind, T[]>();
  for (const svc of services) {
    const kind = (svc.serviceKind as AlliedServiceKind | null) ?? inferAlliedServiceKind(svc.name, svc.category);
    const list = map.get(kind) ?? [];
    list.push(svc);
    map.set(kind, list);
  }
  const order: AlliedServiceKind[] = [
    "initial_assessment",
    "follow_up",
    "sports_screen",
    "other",
  ];
  return order
    .filter((k) => map.has(k))
    .map((kind) => ({
      kind,
      label: alliedServiceKindLabel(kind),
      services: map.get(kind)!,
    }));
}
