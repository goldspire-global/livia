import { z } from "zod/v4";

export const whatsappChannelConfigSchema = z.object({
  phoneNumberId: z.string().min(1),
  displayPhone: z.string().optional(),
  wabaId: z.string().optional(),
});

export const instagramChannelConfigSchema = z.object({
  pageId: z.string().min(1),
  igAccountId: z.string().optional(),
});

export const messengerChannelConfigSchema = z.object({
  pageId: z.string().min(1),
});

export const messagingChannelsSchema = z.object({
  whatsapp: whatsappChannelConfigSchema.optional(),
  instagram: instagramChannelConfigSchema.optional(),
  messenger: messengerChannelConfigSchema.optional(),
});

export type MessagingChannels = z.infer<typeof messagingChannelsSchema>;

export function parseMessagingChannels(raw: unknown): MessagingChannels {
  const r = messagingChannelsSchema.safeParse(raw ?? {});
  return r.success ? r.data : {};
}

/** Demo/dev seeded IDs — not owner-entered Meta credentials. */
export function isPlaceholderMessagingChannelId(id: string | undefined | null): boolean {
  if (!id?.trim()) return true;
  const v = id.trim().toLowerCase();
  return v.startsWith("demo_") || v.startsWith("dev_");
}

/** True when the tenant saved a real channel ID (not demo seed placeholders). */
export function isOwnerConfiguredChannelId(id: string | undefined | null): boolean {
  return Boolean(id?.trim()) && !isPlaceholderMessagingChannelId(id);
}

/** Value for setup forms — blank unless owner saved a real ID. */
export function ownerChannelIdForForm(id: string | undefined | null): string {
  return isOwnerConfiguredChannelId(id) ? id!.trim() : "";
}
