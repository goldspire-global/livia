/** Strip leading business name from Liv lines (parity with dashboard). */
export function stripBusinessPrefix(line: string, businessName?: string | null): string {
  if (!businessName?.trim()) return line;
  const prefix = `${businessName.trim()}:`;
  if (line.startsWith(prefix)) return line.slice(prefix.length).trim();
  return line;
}

const PLACEHOLDER_GREETING_NAMES = /^(demo|test|owner|user|there|admin)$/i;

/** Clerk/demo accounts often use placeholder first names — don't greet owners with them. */
export function resolveBriefingFirstName(firstName: string | null | undefined): string | null {
  const n = firstName?.trim();
  if (!n || PLACEHOLDER_GREETING_NAMES.test(n)) return null;
  return n;
}

/** Short owner home greeting for morph / constellation Today. */
export function morphOwnerGreeting(firstName: string | null | undefined): string {
  const hour = new Date().getHours();
  const t = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const name = resolveBriefingFirstName(firstName);
  return name ? `Good ${t}, ${name}` : `Good ${t}`;
}
