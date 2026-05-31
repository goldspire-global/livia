import { getGuestHubView } from "./guest-hub.service";
import { handlePublicChat } from "./ai-chat.service";

export type GuestHubChatAction = {
  label: string;
  href: string;
};

export type GuestHubChatResult = {
  reply: string;
  actions: GuestHubChatAction[];
  shopSlug?: string;
  conversationId?: string;
  mode: "rules" | "liv";
};

type HubShopRow = NonNullable<Awaited<ReturnType<typeof getGuestHubView>>>["shops"][number];

function matchShop(message: string, shops: HubShopRow[]) {
  const lower = message.toLowerCase();
  for (const shop of shops) {
    const name = shop.businessName.toLowerCase();
    const slugWords = shop.slug.replace(/-/g, " ");
    if (lower.includes(name) || lower.includes(slugWords)) return shop;
  }
  const fav = shops.find((s) => s.isFavorite);
  return fav ?? shops[0];
}

export async function handleGuestHubChat(
  hubToken: string,
  message: string,
): Promise<GuestHubChatResult | null> {
  const view = await getGuestHubView(hubToken);
  if (!view) return null;

  const trimmed = message.trim().slice(0, 2000);
  if (!trimmed) {
    return {
      reply: "Tell me which shop — or say “book again” for your usual.",
      actions: [],
      mode: "rules",
    };
  }

  if (view.shops.length === 0) {
    return {
      reply:
        "Your vault is empty. Book at any Livia shop and opt in to My Livia — then I can help you rebook here.",
      actions: [],
      mode: "rules",
    };
  }

  const shop = matchShop(trimmed, view.shops);
  if (!shop) {
    return {
      reply: "Book at a Livia shop first, then ask me to book again from your vault.",
      actions: [],
      mode: "rules",
    };
  }

  const upcoming = view.upcomingBookings[0];
  if (/\b(upcoming|next visit|when am i|my appointment)\b/i.test(trimmed) && upcoming) {
    return {
      reply: `Your next visit is ${upcoming.serviceName} at ${upcoming.businessName}.`,
      actions: [{ label: "Manage visit", href: upcoming.visitUrl }],
      shopSlug: upcoming.slug,
      mode: "rules",
    };
  }

  if (/\b(book|again|usual|repeat|slot|class|session|pt|hair|nails)\b/i.test(trimmed)) {
    const serviceHint = shop.lastServiceName ? ` (${shop.lastServiceName})` : "";
    return {
      reply: `Open ${shop.businessName} to book again${serviceHint}. I'll keep your vault in sync.`,
      actions: [{ label: "Book again", href: shop.bookUrl }],
      shopSlug: shop.slug,
      mode: "rules",
    };
  }

  try {
    const ai = await handlePublicChat({
      slug: shop.slug,
      message: trimmed,
      customerPhone: view.phoneE164,
      channelType: "WEB",
    });
    return {
      reply: ai.reply,
      actions: [{ label: `Book at ${shop.businessName}`, href: shop.bookUrl }],
      shopSlug: shop.slug,
      conversationId: ai.conversationId,
      mode: "liv",
    };
  } catch {
    return {
      reply: `I can help you book again at ${shop.businessName} or check upcoming visits. Try “book my usual at ${shop.businessName}”.`,
      actions: [{ label: "Book again", href: shop.bookUrl }],
      shopSlug: shop.slug,
      mode: "rules",
    };
  }
}
