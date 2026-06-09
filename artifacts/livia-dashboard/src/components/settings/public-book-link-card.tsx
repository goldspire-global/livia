import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, ExternalLink, Globe } from "lucide-react";
import { publicBookingUrl } from "@/lib/surface-urls";
import { clientGuestBookHref } from "@/lib/guest-book-url";

type Props = {
  slug: string;
  businessName?: string;
  onCopy?: () => void;
  compact?: boolean;
  showPreviewLink?: boolean;
};

export function PublicBookLinkCard({
  slug,
  businessName,
  onCopy,
  compact,
  showPreviewLink = true,
}: Props) {
  const absolute = publicBookingUrl(slug);
  const previewPath = clientGuestBookHref(slug);
  const displayLabel = import.meta.env.DEV
    ? previewPath
    : `${slug}.livia-hq.com`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(absolute);
      onCopy?.();
    } catch {
      /* caller may toast */
    }
  }

  if (compact) {
    return (
      <div
        className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-2.5"
        data-testid="public-book-link-card"
      >
        <Globe className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        <span
          className="flex-1 text-xs font-mono truncate text-muted-foreground"
          title={absolute}
          data-testid="text-booking-url"
        >
          {displayLabel}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          aria-label="Copy booking link"
          onClick={() => void copyLink()}
          data-testid="button-copy-link"
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
        {showPreviewLink ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
            <a href={previewPath} target="_blank" rel="noopener noreferrer" aria-label="Open booking page">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-border/50 bg-background/50 p-4" data-testid="public-book-link-card">
      <p className="text-xs text-muted-foreground">Guest book page</p>
      <div className="flex gap-2">
        <Input readOnly value={absolute} className="text-xs font-mono" data-testid="text-booking-url" />
        <Button type="button" variant="outline" size="icon" onClick={() => void copyLink()} aria-label="Copy link">
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {showPreviewLink ? (
          <Button type="button" variant="secondary" size="sm" asChild>
            <a href={previewPath} target="_blank" rel="noopener noreferrer">
              Open book page
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
        ) : null}
      </div>
      {businessName ? (
        <p className="text-xs text-muted-foreground">
          Returning guests manage visits at{" "}
          <code className="text-primary">/my</code> — book at{" "}
          <code className="text-primary">{displayLabel}</code>
        </p>
      ) : null}
    </div>
  );
}
