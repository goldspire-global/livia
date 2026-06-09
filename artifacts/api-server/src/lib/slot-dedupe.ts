export type SlotLike = {
  startAt: string;
  available: boolean;
};

/** Guest-facing lists: one row per clock time when multiple staff share availability. */
export function dedupeSlotsByStartAt<T extends SlotLike>(slots: T[]): T[] {
  const byStart = new Map<string, T>();
  for (const slot of slots) {
    const prev = byStart.get(slot.startAt);
    if (!prev) {
      byStart.set(slot.startAt, slot);
      continue;
    }
    if (slot.available && !prev.available) {
      byStart.set(slot.startAt, slot);
    }
  }
  return [...byStart.values()].sort((a, b) => a.startAt.localeCompare(b.startAt));
}
