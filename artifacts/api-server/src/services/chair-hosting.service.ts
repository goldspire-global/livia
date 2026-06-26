import {
  db,
  businessesTable,
  chairHostingEnquiriesTable,
  type Business,
} from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import {
  parseChairHostingListing,
  chairHostingPublicVisible,
  type ChairHostingListing,
} from "@workspace/policy";
import { generateId } from "../lib/id";
import { getBusinessById, getBusinessBySlug } from "./businesses.service";
import { deliverInAppNotification } from "./in-app-notifications.service";

export function readChairHostingListing(biz: Pick<Business, "chairHosting">): ChairHostingListing {
  return parseChairHostingListing(biz.chairHosting);
}

export async function getChairHostingListing(businessId: string): Promise<ChairHostingListing | null> {
  const biz = await getBusinessById(businessId);
  if (!biz) return null;
  return readChairHostingListing(biz);
}

export async function updateChairHostingListing(
  businessId: string,
  patch: Partial<ChairHostingListing>,
): Promise<ChairHostingListing | null> {
  const biz = await getBusinessById(businessId);
  if (!biz) return null;
  const current = readChairHostingListing(biz);
  const next: ChairHostingListing = {
    ...current,
    ...patch,
    amenities: patch.amenities ?? current.amenities,
  };
  await db
    .update(businessesTable)
    .set({ chairHosting: next, updatedAt: new Date() })
    .where(eq(businessesTable.id, businessId));
  return next;
}

export function publicChairHostingPayload(biz: Business) {
  const listing = readChairHostingListing(biz);
  if (!chairHostingPublicVisible(biz.vertical, listing, biz.tier)) return undefined;
  return {
    headline: listing.headline,
    body: listing.body,
    weeklyRateMinor: listing.weeklyRateMinor,
    chairsAvailable: listing.chairsAvailable,
    amenities: listing.amenities,
    currency: biz.currency ?? "EUR",
  };
}

export type ChairHostingEnquiryRow = {
  id: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  specialty: string | null;
  message: string | null;
  status: string;
  createdAt: string;
};

export async function listChairHostingEnquiries(businessId: string): Promise<ChairHostingEnquiryRow[]> {
  const rows = await db
    .select()
    .from(chairHostingEnquiriesTable)
    .where(eq(chairHostingEnquiriesTable.businessId, businessId))
    .orderBy(desc(chairHostingEnquiriesTable.createdAt))
    .limit(50);
  return rows.map((r) => ({
    id: r.id,
    contactName: r.contactName,
    contactEmail: r.contactEmail,
    contactPhone: r.contactPhone,
    specialty: r.specialty,
    message: r.message,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function submitChairHostingEnquiry(
  slug: string,
  input: {
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    specialty?: string;
    message?: string;
  },
): Promise<{ id: string } | null> {
  const biz = await getBusinessBySlug(slug);
  if (!biz) return null;
  const listing = readChairHostingListing(biz);
  if (!chairHostingPublicVisible(biz.vertical, listing, biz.tier)) return null;

  const id = generateId();
  await db.insert(chairHostingEnquiriesTable).values({
    id,
    businessId: biz.id,
    contactName: input.contactName.trim(),
    contactEmail: input.contactEmail.trim(),
    contactPhone: input.contactPhone?.trim() || null,
    specialty: input.specialty?.trim() || null,
    message: input.message?.trim() || null,
    status: "new",
  });

  await deliverInAppNotification({
    businessId: biz.id,
    kind: "host.enquiry",
    title: "Chair rental enquiry",
    body: `${input.contactName.trim()} asked about renting a chair.`,
    dedupeKey: `host.enquiry:${id}`,
    priority: "act",
    audience: "operators",
  }).catch(() => undefined);

  return { id };
}

export async function updateChairHostingEnquiryStatus(
  businessId: string,
  enquiryId: string,
  status: "new" | "contacted" | "linked" | "declined",
) {
  const [row] = await db
    .update(chairHostingEnquiriesTable)
    .set({ status, updatedAt: new Date() })
    .where(
      and(
        eq(chairHostingEnquiriesTable.id, enquiryId),
        eq(chairHostingEnquiriesTable.businessId, businessId),
      ),
    )
    .returning();
  return row ?? null;
}
