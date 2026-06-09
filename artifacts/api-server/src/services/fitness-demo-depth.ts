import { db, businessesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { listClassSessions, createClassSession } from "./class-sessions.service";
import { listServices } from "./services.service";

/** Idempotent showcase class schedule for fitness demo slugs. */
export async function ensureFitnessShowcaseClasses(businessId: string): Promise<void> {
  const [biz] = await db
    .select({ vertical: businessesTable.vertical })
    .from(businessesTable)
    .where(eq(businessesTable.id, businessId))
    .limit(1);
  if (biz?.vertical !== "fitness") return;

  const existing = await listClassSessions(businessId, {
    from: new Date().toISOString(),
  });
  if (existing.length > 0) return;

  const services = await listServices(businessId, true);
  const pt = services.find((s) => /pt|personal|training/i.test(s.name)) ?? services[0];
  const yoga = services.find((s) => /yoga|pilates|class/i.test(s.name)) ?? services[1] ?? pt;

  const base = new Date();
  base.setHours(18, 0, 0, 0);
  if (base.getTime() < Date.now()) base.setDate(base.getDate() + 1);

  const slots = [
    { title: "HIIT — evening", hours: 0, serviceId: pt?.id },
    { title: "Yoga flow", hours: 24, serviceId: yoga?.id },
    { title: "Strength fundamentals", hours: 48, serviceId: pt?.id },
  ];

  for (const slot of slots) {
    const start = new Date(base.getTime() + slot.hours * 3_600_000);
    const end = new Date(start.getTime() + 60 * 60_000);
    await createClassSession(businessId, {
      title: slot.title,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      capacity: 12,
      waitlistCapacity: 6,
      serviceId: slot.serviceId,
    });
  }
}
