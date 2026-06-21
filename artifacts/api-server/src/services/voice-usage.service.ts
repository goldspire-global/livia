import { eq, desc } from "drizzle-orm";
import { db, voiceCallSessionsTable } from "@workspace/db";
import { businessVoiceMinutesThisMonth } from "./voice-call.service";

function voiceMonthlyMinuteCap(): number {
  const raw = process.env.VOICE_MONTHLY_MINUTE_CAP;
  const n = raw ? parseInt(raw, 10) : 500;
  return Number.isFinite(n) && n > 0 ? n : 500;
}

export async function listRecentVoiceCalls(businessId: string, limit = 10) {
  return db
    .select({
      callSid: voiceCallSessionsTable.callSid,
      customerPhone: voiceCallSessionsTable.customerPhone,
      conversationId: voiceCallSessionsTable.conversationId,
      turnCount: voiceCallSessionsTable.turnCount,
      createdAt: voiceCallSessionsTable.createdAt,
    })
    .from(voiceCallSessionsTable)
    .where(eq(voiceCallSessionsTable.businessId, businessId))
    .orderBy(desc(voiceCallSessionsTable.createdAt))
    .limit(limit);
}

export async function voiceUsageSummary(businessId: string) {
  const usedMinutes = await businessVoiceMinutesThisMonth(businessId);
  const capMinutes = voiceMonthlyMinuteCap();
  return {
    usedMinutes,
    capMinutes,
    remainingMinutes: Math.max(0, capMinutes - usedMinutes),
    atCap: usedMinutes >= capMinutes,
  };
}
