/**
 * Liv platform awareness — structural cortex (what the platform IS).
 * Compiled from propagation registry + capability graph + tool matrix.
 * Engineers register once in policy; Liv prompts auto-sync — no per-feature opt-in.
 */
import type { BusinessVertical } from "./types";
import { CAPABILITY_REGISTRY, listCapabilitiesForVertical } from "./capability-registry";
import {
  resolveTenantCapabilityGraph,
  type CapabilityReadinessFacts,
  type TenantCapabilityGraph,
} from "./capability-resolution";
import { LIV_TOOL_MATRIX } from "./liv-tool-matrix";
import {
  allRegisteredCapabilityRoutes,
  getCapabilityRoute,
} from "./propagation/capability-routing";
import { compileVerticalManifest } from "./propagation/vertical-manifest";
import { getVerticalAnnouncementPackage } from "./vertical-announcement";

export const LIV_PLATFORM_AWARENESS_MODULE = "liv_platform_awareness";

export type LivAwarenessProfile = "tenant_public" | "tenant_staff" | "livia_internal";

export const LIV_PLATFORM_AWARENESS_POLICY_MODULES = [
  "liv-platform-awareness-program.ts",
  "capability-registry.ts",
  "capability-resolution.ts",
  "liv-tool-matrix.ts",
  "capability-routing.ts",
] as const;

export const LIV_PLATFORM_AWARENESS_SURFACE_IDS = [
  "tenant.owner.dashboard",
  "tenant.staff.my-day",
  "tenant.inbox",
  "guest.public.book",
  "internal.ops.support",
] as const;

export type PlatformRouteDigest = {
  id: string;
  label: string;
  surfaces: string[];
};

export function compilePlatformRouteDigest(): PlatformRouteDigest[] {
  return allRegisteredCapabilityRoutes().map((r) => ({
    id: r.id,
    label: r.label,
    surfaces: r.surfaceIds,
  }));
}

export function compileVerticalCapabilityDigest(vertical: BusinessVertical): Array<{
  id: string;
  name: string;
  maturity?: string;
}> {
  const manifest = compileVerticalManifest(vertical);
  const announcement = getVerticalAnnouncementPackage(vertical);
  const ids = new Set([
    ...manifest.capabilityIds,
    ...announcement.capabilities.map((c) => c.id),
  ]);
  const fromRegistry = listCapabilitiesForVertical([...ids]).map((c) => ({
    id: c.id,
    name: c.name,
  }));
  const fromAnnouncement = announcement.capabilities
    .filter((c) => !fromRegistry.some((r) => r.id === c.id))
    .map((c) => ({ id: c.id, name: c.label, maturity: c.maturity }));
  return [...fromRegistry, ...fromAnnouncement];
}

export function compileLivToolsDigest(profile: LivAwarenessProfile): Array<{
  toolId: string;
  label: string;
  status: string;
}> {
  return LIV_TOOL_MATRIX.filter(
    (t) => t.profiles.includes(profile) && t.status !== "planned",
  ).map((t) => ({
    toolId: t.toolId,
    label: t.label,
    status: t.status,
  }));
}

export function compileGlobalPlatformDigest(): Array<{ id: string; name: string }> {
  return CAPABILITY_REGISTRY.filter((c) => c.v1).map((c) => ({
    id: c.id,
    name: c.name,
  }));
}

export function resolveTenantAwarenessGraph(args: {
  vertical: BusinessVertical;
  facts: CapabilityReadinessFacts;
  activeCapabilityIds?: string[];
}): TenantCapabilityGraph {
  return resolveTenantCapabilityGraph(args);
}

export function buildPlatformAwarenessPromptLines(input: {
  profile: LivAwarenessProfile;
  vertical?: BusinessVertical | null;
  tenantGraph?: TenantCapabilityGraph | null;
}): string[] {
  const lines: string[] = [];

  if (input.profile === "livia_internal") {
    lines.push("Livia internal operator profile — cross-tenant read tools only.");
    for (const cap of compileGlobalPlatformDigest().slice(0, 12)) {
      lines.push(`Platform: ${cap.name} (${cap.id})`);
    }
    for (const route of compilePlatformRouteDigest().slice(0, 10)) {
      lines.push(`Route ${route.id}: ${route.label} → ${route.surfaces.join(", ")}`);
    }
    for (const tool of compileLivToolsDigest("livia_internal").slice(0, 10)) {
      lines.push(`Tool: ${tool.toolId} — ${tool.label}`);
    }
    return lines;
  }

  if (!input.vertical) return lines;

  lines.push(`Vertical: ${input.vertical}`);

  for (const cap of compileVerticalCapabilityDigest(input.vertical).slice(0, 10)) {
    const maturity = "maturity" in cap && cap.maturity ? ` [${cap.maturity}]` : "";
    lines.push(`Capability: ${cap.name} (${cap.id})${maturity}`);
  }

  const graph = input.tenantGraph;
  if (graph) {
    const blocked = graph.platformCapabilities
      .filter((c) => c.readinessBlockers.length > 0)
      .flatMap((c) => c.readinessBlockers.map((b) => `${c.id}: ${b}`))
      .slice(0, 5);
    for (const b of blocked) {
      lines.push(`Setup gap: ${b}`);
    }
    const active = graph.platformCapabilities
      .filter((c) => c.state === "active")
      .map((c) => c.id);
    if (active.length) {
      lines.push(`Active platform capabilities: ${active.join(", ")}`);
    }
  }

  for (const tool of compileLivToolsDigest(input.profile).slice(0, 14)) {
    lines.push(`Tool available: ${tool.toolId} (${tool.label})`);
  }

  const routeIds = compileVerticalManifest(input.vertical).capabilityIds;
  for (const routeId of routeIds.slice(0, 6)) {
    const route = getCapabilityRoute(routeId);
    if (route) {
      lines.push(`Surface route: ${route.label} (${route.id})`);
    }
  }

  return lines;
}

export function buildPlatformAwarenessPromptBlock(input: {
  profile: LivAwarenessProfile;
  vertical?: BusinessVertical | null;
  tenantGraph?: TenantCapabilityGraph | null;
}): string {
  const lines = buildPlatformAwarenessPromptLines(input);
  if (!lines.length) return "";
  return `\n\nPLATFORM AWARENESS (auto-synced from propagation — capabilities and tools that exist; do not invent features):\n${lines.join("\n")}\n`;
}
