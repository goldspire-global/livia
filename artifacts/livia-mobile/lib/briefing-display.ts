/** Strip leading business name from Liv lines (parity with dashboard). */
export function stripBusinessPrefix(line: string, businessName?: string | null): string {
  if (!businessName?.trim()) return line;
  const prefix = `${businessName.trim()}:`;
  if (line.startsWith(prefix)) return line.slice(prefix.length).trim();
  return line;
}
