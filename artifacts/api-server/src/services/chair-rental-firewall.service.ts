/**
 * Chair-rental host must not read renter customer PII unless they own the renter business.
 */
import { db, hostRenterLinksTable, businessMembershipsTable } from "@workspace/db";
import { and, eq, isNull, inArray } from "drizzle-orm";

export class ChairRentalCustomerFirewallError extends Error {
  constructor() {
    super("CHAIR_RENTAL_CUSTOMER_FIREWALL");
    this.name = "ChairRentalCustomerFirewallError";
  }
}

export async function assertChairRentalCustomerFirewall(
  userId: string,
  targetBusinessId: string,
): Promise<void> {
  const hostLinks = await db
    .select({ hostBusinessId: hostRenterLinksTable.hostBusinessId })
    .from(hostRenterLinksTable)
    .where(
      and(
        eq(hostRenterLinksTable.renterBusinessId, targetBusinessId),
        isNull(hostRenterLinksTable.endedAt),
      ),
    );

  if (hostLinks.length === 0) return;

  const hostIds = hostLinks.map((l) => l.hostBusinessId);
  const memberships = await db
    .select({
      businessId: businessMembershipsTable.businessId,
      role: businessMembershipsTable.role,
      roleV2: businessMembershipsTable.roleV2,
    })
    .from(businessMembershipsTable)
    .where(
      and(
        eq(businessMembershipsTable.userId, userId),
        inArray(businessMembershipsTable.businessId, [...hostIds, targetBusinessId]),
      ),
    );

  const isOwnerOnHost = memberships.some(
    (m) =>
      hostIds.includes(m.businessId) &&
      (m.role === "OWNER" || m.roleV2 === "OWN" || m.roleV2 === "OWNER_HOST"),
  );
  const isOwnerOnRenter = memberships.some(
    (m) =>
      m.businessId === targetBusinessId &&
      (m.role === "OWNER" || m.roleV2 === "OWN" || m.roleV2 === "OWNER_HOST"),
  );

  if (isOwnerOnHost && !isOwnerOnRenter) {
    throw new ChairRentalCustomerFirewallError();
  }
}
