import { db, bookingsTable, customersTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { generateId } from "../lib/id";

type CouplesMeta = {
  wellnessCouples?: {
    partnerBookingId?: string;
    partnerName?: string;
    partnerCustomerId?: string;
  };
};

function parseMeta(internalNotes: string | null): CouplesMeta {
  if (!internalNotes?.trim()) return {};
  try {
    return JSON.parse(internalNotes) as CouplesMeta;
  } catch {
    return {};
  }
}

export async function createCouplesBookingPair(
  businessId: string,
  input: {
    primary: {
      customerId: string;
      serviceId: string;
      staffId?: string;
      resourceId?: string;
      startAt: Date;
      endAt: Date;
    };
    partner: { customerId: string; displayName?: string };
  },
) {
  const primaryId = generateId();
  const partnerId = generateId();
  let partnerLabel = input.partner.displayName?.trim() || "Partner guest";
  if (!input.partner.displayName?.trim()) {
    const [row] = await db
      .select({ firstName: customersTable.firstName, lastName: customersTable.lastName })
      .from(customersTable)
      .where(eq(customersTable.id, input.partner.customerId))
      .limit(1);
    if (row) {
      partnerLabel =
        [row.firstName, row.lastName].filter(Boolean).join(" ").trim() || partnerLabel;
    }
  }

  await db.insert(bookingsTable).values([
    {
      id: primaryId,
      businessId,
      customerId: input.primary.customerId,
      serviceId: input.primary.serviceId,
      staffId: input.primary.staffId ?? null,
      resourceId: input.primary.resourceId ?? null,
      startAt: input.primary.startAt,
      endAt: input.primary.endAt,
      status: "PENDING",
      source: "web",
      internalNotes: JSON.stringify({
        wellnessCouples: {
          partnerBookingId: partnerId,
          partnerName: partnerLabel,
          partnerCustomerId: input.partner.customerId,
        },
      }),
    },
    {
      id: partnerId,
      businessId,
      customerId: input.partner.customerId,
      serviceId: input.primary.serviceId,
      staffId: input.primary.staffId ?? null,
      resourceId: input.primary.resourceId ?? null,
      startAt: input.primary.startAt,
      endAt: input.primary.endAt,
      status: "PENDING",
      source: "web",
      internalNotes: JSON.stringify({
        wellnessCouples: {
          partnerBookingId: primaryId,
          partnerName: "Primary guest",
          partnerCustomerId: input.primary.customerId,
        },
      }),
    },
  ]);

  return { primaryBookingId: primaryId, partnerBookingId: partnerId, partnerName: partnerLabel };
}

export async function getCouplesLinkForBooking(businessId: string, bookingId: string) {
  const [row] = await db
    .select({ internalNotes: bookingsTable.internalNotes })
    .from(bookingsTable)
    .where(and(eq(bookingsTable.businessId, businessId), eq(bookingsTable.id, bookingId)))
    .limit(1);
  if (!row) return null;
  const meta = parseMeta(row.internalNotes);
  return meta.wellnessCouples ?? null;
}
