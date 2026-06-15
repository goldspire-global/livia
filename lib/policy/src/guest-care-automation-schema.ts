import { z } from "zod/v4";

export const aftercareModeSchema = z.enum(["auto", "liv_draft", "manual_only"]);
export type AftercareMode = z.infer<typeof aftercareModeSchema>;

export const aftercareDelaySchema = z.enum(["2h", "same_evening", "next_morning"]);
export type AftercareDelay = z.infer<typeof aftercareDelaySchema>;

export const aftercareChannelPreferenceSchema = z.enum([
  "thread_first",
  "sms_fallback",
  "sms_only",
]);
export type AftercareChannelPreference = z.infer<typeof aftercareChannelPreferenceSchema>;

export const guestPreferredModalitySchema = z.enum([
  "VOICE",
  "WHATSAPP",
  "SMS",
  "EMAIL",
  "INSTAGRAM",
  "WEB",
  "ANY",
]);
export type GuestPreferredModality = z.infer<typeof guestPreferredModalitySchema>;

export const guestCareAutomationSchema = z.object({
  aftercareEnabled: z.boolean().default(true),
  aftercareMode: aftercareModeSchema.default("auto"),
  aftercareDelay: aftercareDelaySchema.default("2h"),
  aftercareChannel: aftercareChannelPreferenceSchema.default("thread_first"),
  retailAftercareEnabled: z.boolean().default(true),
  /** Body-art / medspa multi-touch sequences (day offsets from complete). */
  aftercareSequenceDays: z.array(z.number().int().min(0).max(90)).optional(),
});

export type GuestCareAutomation = z.infer<typeof guestCareAutomationSchema>;

export const DEFAULT_GUEST_CARE: GuestCareAutomation = guestCareAutomationSchema.parse({});
