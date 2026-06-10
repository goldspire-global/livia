/** Mobile tenant shell spacing — parity with web app-shell / operational pages. */
export const TENANT_SHELL_LAYOUT = {
  contentPadX: 16,
  contentGap: 12,
  tabBarClearance: 88,
} as const;

export function tenantScreenBackground(
  isConstellation: boolean,
  background: string,
): string {
  return isConstellation ? "transparent" : background;
}
