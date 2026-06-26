import { useState } from "react";
import { Armchair, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CHAIR_HOSTING_COPY } from "@workspace/policy";
import { customFetch } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";

export type PublicChairHostingPayload = {
  headline: string;
  body: string;
  weeklyRateMinor: number;
  chairsAvailable: number;
  amenities: string[];
  currency: string;
};

export function PublicChairHostingStrip({
  slug,
  listing,
}: {
  slug: string;
  listing: PublicChairHostingPayload;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weekly =
    listing.weeklyRateMinor > 0
      ? formatCurrency(listing.weeklyRateMinor, listing.currency)
      : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSending(true);
    setError(null);
    try {
      await customFetch(`/api/public/b/${slug}/chair-hosting/enquire`, {
        method: "POST",
        body: JSON.stringify({
          contactName: name.trim(),
          contactEmail: email.trim(),
          contactPhone: phone.trim() || undefined,
          specialty: specialty.trim() || undefined,
          message: message.trim() || undefined,
        }),
      });
      setDone(true);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send enquiry");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <section
        className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm"
        data-testid="public-chair-hosting-thanks"
      >
        {CHAIR_HOSTING_COPY.publicThanks}
      </section>
    );
  }

  return (
    <section
      className="rounded-xl border border-border/80 bg-card/80 overflow-hidden motion-hero-fade-in"
      data-testid="public-chair-hosting-strip"
    >
      <div className="p-4 flex flex-col sm:flex-row sm:items-start gap-3 sm:justify-between">
        <div className="space-y-1 min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary flex items-center gap-1.5">
            <Armchair className="h-3.5 w-3.5" />
            {CHAIR_HOSTING_COPY.publicEyebrow}
          </p>
          <h2 className="text-base font-semibold">{listing.headline}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{listing.body}</p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
            {listing.chairsAvailable > 0 ? (
              <span>
                {listing.chairsAvailable} chair{listing.chairsAvailable === 1 ? "" : "s"}
              </span>
            ) : null}
            {weekly ? <span>from {weekly}/week</span> : null}
            {listing.amenities.slice(0, 4).map((a) => (
              <span key={a} className="rounded-full bg-muted px-2 py-0.5">
                {a}
              </span>
            ))}
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          className="shrink-0"
          onClick={() => setOpen((v) => !v)}
          data-testid="public-chair-hosting-cta"
        >
          {CHAIR_HOSTING_COPY.publicCta}
        </Button>
      </div>

      {open ? (
        <form
          onSubmit={(e) => void submit(e)}
          className="border-t border-border/60 p-4 space-y-3 bg-muted/20"
          data-testid="public-chair-hosting-form"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="chair-name">Your name</Label>
              <Input id="chair-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="chair-email">Email</Label>
              <Input
                id="chair-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="chair-phone">Phone (optional)</Label>
              <Input id="chair-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="chair-specialty">Specialty</Label>
              <Input
                id="chair-specialty"
                placeholder="e.g. Colour, barbering, lashes"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="chair-message">Message (optional)</Label>
            <Textarea
              id="chair-message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Days you need, experience, insurance…"
            />
          </div>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          <Button type="submit" disabled={sending} className="gap-1.5">
            <Send className="h-3.5 w-3.5" />
            {sending ? "Sending…" : "Send enquiry"}
          </Button>
        </form>
      ) : null}
    </section>
  );
}
