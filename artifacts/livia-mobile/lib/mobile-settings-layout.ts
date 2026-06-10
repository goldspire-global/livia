import type { PersonaKind } from "@/hooks/usePersona";
import {
  canEditLiv,
  canEditShop,
  canViewBilling,
  canViewComms,
  canViewPolicy,
  canViewTeam,
} from "@/lib/settings-persona";

export type MobileSettingsSectionId =
  | "shop"
  | "look"
  | "team"
  | "channels"
  | "policy"
  | "liv"
  | "billing"
  | "support";

export type MobileSettingsSectionMeta = {
  id: MobileSettingsSectionId;
  label: string;
  icon: "home" | "droplet" | "users" | "message-circle" | "shield" | "zap" | "credit-card" | "life-buoy";
  subtitle: string;
};

const SECTION_META: Record<MobileSettingsSectionId, MobileSettingsSectionMeta> = {
  shop: {
    id: "shop",
    label: "Shop",
    icon: "home",
    subtitle: "Timezone, public booking link, and logo",
  },
  look: {
    id: "look",
    label: "Look",
    icon: "droplet",
    subtitle: "Preset and guest-facing colours",
  },
  team: {
    id: "team",
    label: "Team",
    icon: "users",
    subtitle: "Roster, services, and hours",
  },
  channels: {
    id: "channels",
    label: "Channels",
    icon: "message-circle",
    subtitle: "SMS, WhatsApp, and social lines",
  },
  policy: {
    id: "policy",
    label: "Rules",
    icon: "shield",
    subtitle: "Deposits, buffers, and booking policy",
  },
  liv: {
    id: "liv",
    label: "Liv",
    icon: "zap",
    subtitle: "AI booking and inbox tools",
  },
  billing: {
    id: "billing",
    label: "Plan",
    icon: "credit-card",
    subtitle: "Subscription and invoices",
  },
  support: {
    id: "support",
    label: "Help",
    icon: "life-buoy",
    subtitle: "Support, legal, and platform links",
  },
};

/** Persona-visible sections in display order — hidden blocks never mount. */
export function mobileSettingsSections(persona: PersonaKind): MobileSettingsSectionMeta[] {
  const ids: MobileSettingsSectionId[] = ["shop", "look"];
  if (canViewTeam(persona)) ids.push("team");
  if (canViewComms(persona)) ids.push("channels");
  if (canViewPolicy(persona)) ids.push("policy");
  if (canEditLiv(persona) || persona === "staff") ids.push("liv");
  if (canViewBilling(persona)) ids.push("billing");
  ids.push("support");
  return ids.map((id) => SECTION_META[id]);
}

/** First section expanded on load — keeps the page short by default. */
export function defaultMobileSettingsSection(persona: PersonaKind): MobileSettingsSectionId {
  if (canEditLiv(persona)) return "liv";
  if (canEditShop(persona)) return "shop";
  if (canViewComms(persona)) return "channels";
  return "shop";
}
