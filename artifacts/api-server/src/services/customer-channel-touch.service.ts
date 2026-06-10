import { db, customersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export type CustomerTouchChannel =
  | "WEB"
  | "SMS"
  | "WHATSAPP"
  | "INSTAGRAM"
  | "MESSENGER"
  | "EMAIL"
  | "VOICE";

function normalizeTouchChannel(channel: string | null | undefined): CustomerTouchChannel | null {
  switch (channel) {
    case "WEB":
    case "SMS":
    case "WHATSAPP":
    case "INSTAGRAM":
    case "MESSENGER":
    case "EMAIL":
    case "VOICE":
      return channel;
    default:
      return null;
  }
}

export async function recordCustomerInboundTouch(args: {
  customerId: string;
  channel: string | null | undefined;
  at?: Date;
}): Promise<void> {
  const touchChannel = normalizeTouchChannel(args.channel);
  if (!touchChannel) return;
  const at = args.at ?? new Date();
  await db
    .update(customersTable)
    .set({
      lastInboundChannel: touchChannel,
      lastInboundAt: at,
      updatedAt: new Date(),
    })
    .where(eq(customersTable.id, args.customerId));
}

export async function recordCustomerOutboundTouch(args: {
  customerId: string;
  channel: string | null | undefined;
  at?: Date;
}): Promise<void> {
  const touchChannel = normalizeTouchChannel(args.channel);
  if (!touchChannel) return;
  const at = args.at ?? new Date();
  await db
    .update(customersTable)
    .set({
      lastOutboundChannel: touchChannel,
      lastOutboundAt: at,
      updatedAt: new Date(),
    })
    .where(eq(customersTable.id, args.customerId));
}
