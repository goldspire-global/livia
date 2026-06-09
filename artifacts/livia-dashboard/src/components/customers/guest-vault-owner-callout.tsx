import { Link } from "wouter";
import { Heart, Smartphone } from "lucide-react";
import { PublicBookLinkCard } from "@/components/settings/public-book-link-card";

/** Reminds owners that guests manage the relationship in My Livia — not only the book page. */
export function GuestVaultOwnerCallout({
  slug,
  businessName,
  compact,
}: {
  slug: string;
  businessName?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div
        className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs text-muted-foreground flex gap-2"
        data-testid="guest-vault-owner-callout"
      >
        <Smartphone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p>
          Returning guests with your studio in{" "}
          <Link href="/my" className="text-primary hover:underline font-medium">
            My Livia
          </Link>{" "}
          can manage visits, message you, and see packs — when they sign in with the same phone they book with.
        </p>
      </div>
    );
  }

  return (
    <section
      className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/8 via-card to-card p-4 space-y-3"
      data-testid="guest-vault-owner-callout"
    >
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
          <Heart className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-1 min-w-0">
          <h3 className="text-sm font-medium">My Livia for your guests</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your book page brings new guests in.{" "}
            <Link href="/my" className="text-primary hover:underline">
              My Livia
            </Link>{" "}
            is where they manage visits, message you, and see session packs — on the phone they already use.
          </p>
        </div>
      </div>
      <PublicBookLinkCard slug={slug} businessName={businessName} showPreviewLink />
    </section>
  );
}
