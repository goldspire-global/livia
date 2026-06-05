/** WhatsApp template keys for wellness studios (channels send when configured). */
export const WELLNESS_WHATSAPP_TEMPLATES = [
  {
    id: "arrival_window",
    label: "Arrival reminder",
    body: "Hi {{firstName}} — your session at {{studio}} is at {{time}}. Please arrive 10 minutes early{{roomLine}}.",
  },
  {
    id: "intake_pending",
    label: "Intake reminder",
    body: "A few quick health notes help us assign your room — reply here or open your visit link.",
  },
  {
    id: "voucher_balance",
    label: "Pack balance",
    body: "You have {{remaining}} sessions left on your {{packageName}} at {{studio}}. Book: {{bookUrl}}",
  },
  {
    id: "post_session",
    label: "Post-session calm",
    body: "Thank you for visiting {{studio}}. Hydrate and rest — rebook anytime from your visit link.",
  },
] as const;
