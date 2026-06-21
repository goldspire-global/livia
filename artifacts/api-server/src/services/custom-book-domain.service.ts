import dns from "node:dns/promises";
import { db, businessesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { guestBookHostForSlug, normalizeBookHost } from "@workspace/policy";
import { getBusinessById } from "./businesses.service";
import { attachDomainToVercelProject } from "./vercel-domain.service";

export function expectedBookCnameTarget(slug: string): string {
  const suffix = process.env.GUEST_BOOK_HOST_SUFFIX ?? process.env.LIVIA_BOOK_HOST_SUFFIX ?? "livia-hq.com";
  return guestBookHostForSlug(slug, suffix);
}

export async function verifyCustomBookDomain(
  businessId: string,
): Promise<{ verified: boolean; message: string; target?: string; sslStatus?: string | null }> {
  const biz = await getBusinessById(businessId);
  if (!biz?.slug) return { verified: false, message: "Business not found" };
  const raw = biz.customBookDomain?.trim();
  if (!raw) return { verified: false, message: "Set a custom domain first" };

  const domain = normalizeBookHost(raw);
  const target = expectedBookCnameTarget(biz.slug);

  try {
    const cnames = await dns.resolveCname(domain);
    const ok = cnames.some((c) => {
      const host = normalizeBookHost(c);
      return host === target || host.endsWith(`.${target.split(".").slice(1).join(".")}`);
    });
    if (!ok) {
      return {
        verified: false,
        message: `CNAME must point to ${target}. Found: ${cnames.join(", ") || "none"}`,
        target,
      };
    }

    const vercel = await attachDomainToVercelProject(domain);

    await db
      .update(businessesTable)
      .set({
        customBookDomainVerified: true,
        customBookDomain: domain,
        customBookDomainSslStatus: vercel.sslStatus,
        updatedAt: new Date(),
      })
      .where(eq(businessesTable.id, businessId));

    return {
      verified: true,
      message: vercel.message,
      target,
      sslStatus: vercel.sslStatus,
    };
  } catch {
    return {
      verified: false,
      message: `Add a CNAME record: ${domain} → ${target}`,
      target,
    };
  }
}
