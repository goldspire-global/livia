/**
 * Centralised AI disclosure copy — EU AI Act Article 50.
 *
 * Article 50 of the EU AI Act requires that any natural person interacting
 * with an AI system is informed of that fact, in a clear and distinguishable
 * way, at the time of first interaction. Livia's "Liv" assistant talks to
 * end customers across three channels — public web chat, outbound SMS, and
 * outbound email — and every channel must surface the disclosure.
 *
 * This module is the single source of truth for that copy. It is treated as
 * legal text, not marketing copy: do not paraphrase, do not localise per
 * business, do not allow per-business override.
 *
 * Channel wiring:
 *   - Web chat:  ai-chat.service.ts seeds `chatFirstMessage()` as the first
 *                ASSISTANT message of every new conversation, and the widget
 *                renders `chatFooterLine` persistently below the message
 *                stream.
 *   - SMS:       any outbound SMS authored by Liv (i.e. role=ASSISTANT on a
 *                channel=SMS conversation) MUST be prefixed once per thread
 *                with `smsPrefix(business.name)`. Wired by the SMS sender
 *                service when Twilio lands (Task #28).
 *   - Email:     any transactional email whose body was drafted by Liv MUST
 *                wrap the body with `emailBlock(business.name)` above the
 *                business signature. Wired by the email sender service when
 *                Resend lands (Task #28).
 *
 * Frontend constants in `artifacts/bliq-dashboard/src/components/chat-widget.tsx`
 * MUST stay byte-identical to the strings produced here. Drift checked by
 * code review, not by automated test (acceptable: copy changes are rare and
 * always require a deliberate compliance review).
 */

export const AI_DISCLOSURE = {
  chatFirstMessage(businessName: string): string {
    return `Hi, I'm Liv — an AI assistant booking on behalf of ${businessName}. I keep notes for the team and a human can take over any time.`;
  },

  chatFooterLine: "AI-assisted by Liv · Powered by Anthropic Claude",

  smsPrefix(businessName: string): string {
    return `(Liv, AI assistant for ${businessName}) — `;
  },

  emailBlock(businessName: string): string {
    return `This message was drafted by Liv, an AI assistant for ${businessName}. Reply to this email and a human will respond.`;
  },
} as const;
