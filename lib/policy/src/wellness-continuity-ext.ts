/** Wellness continuity variants — gift, couples, post-session ritual */

export type WellnessContinuityVariant = "default" | "gift" | "couples" | "post_session" | "arrival";

export const WELLNESS_CONTINUITY_VARIANTS: Record<
  WellnessContinuityVariant,
  { smsBody: string; emailSubject: string; publicNextSteps: string[] }
> = {
  default: {
    smsBody: "Reply with health or arrival notes — we will confirm your room slot.",
    emailSubject: "Your session",
    publicNextSteps: ["Watch for a calm message from the studio.", "Add the session to your calendar."],
  },
  gift: {
    smsBody: "Your gift session is ready — share the redemption code when they book or arrive.",
    emailSubject: "Gift session purchased",
    publicNextSteps: [
      "The recipient gets a redemption code in their confirmation email.",
      "They can book on the studio page or redeem at reception.",
    ],
  },
  couples: {
    smsBody: "Couples session — both guests share one room. Reply if either guest has health notes.",
    emailSubject: "Couples session booked",
    publicNextSteps: [
      "Both guests are linked to this room booking.",
      "Arrive together — reception will check you in once.",
    ],
  },
  post_session: {
    smsBody:
      "Thank you for visiting — hydrate, rest, and ask reception about take-home oils if you'd like.",
    emailSubject: "After your session",
    publicNextSteps: [
      "Hydrate and take a moment before driving.",
      "Harbour Calm oil and recovery balm are available at reception — no pressure.",
      "Rebook from My Livia when you are ready for your next visit.",
    ],
  },
  arrival: {
    smsBody: "Come 10 minutes early — we will guide you to your room when you arrive.",
    emailSubject: "Arrival reminder",
    publicNextSteps: ["Arrive unhurried.", "Your room name will be in this thread when confirmed."],
  },
};

export function wellnessContinuityForVariant(variant: WellnessContinuityVariant) {
  return WELLNESS_CONTINUITY_VARIANTS[variant];
}
