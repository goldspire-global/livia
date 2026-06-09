import { useEffect, useState } from "react";
import { useBusiness } from "@/lib/business-context";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PersonaRitualHeader } from "@/components/ritual/persona-ritual-header";
import { PageFrame } from "@/components/ui/page-frame";
import { SettingsDisclosure } from "@/components/ui/settings-disclosure";
import { designProofsSubmitDefaultOpen } from "@workspace/policy";
import { ImageIcon, Link2 } from "lucide-react";
import { uploadImageFile } from "@/lib/upload-media";
import { clientGuestTokenHref } from "@/lib/guest-book-url";
import { BodyArtPipelineCard } from "@/components/body-art/body-art-pipeline-card";

type Proof = {
  id: string;
  status: string;
  imageUrl?: string | null;
  note?: string | null;
  customerId?: string | null;
  createdAt: string;
  guestToken?: string | null;
};

export default function DesignProofsPage() {
  const { business } = useBusiness();
  const { toast } = useToast();
  const bid = business?.id ?? "";
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);

  async function load() {
    if (!bid) return;
    try {
      setProofs(await customFetch<Proof[]>(`/api/businesses/${bid}/design-proofs`));
    } catch {
      setProofs([]);
    }
  }

  useEffect(() => {
    void load();
  }, [bid]);

  async function submit() {
    if (!bid) return;
    try {
      const created = await customFetch<{ id: string }>(`/api/businesses/${bid}/design-proofs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: imageUrl || undefined, note }),
      });
      await customFetch(`/api/businesses/${bid}/design-proofs/${created.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pending_review" }),
      });
      toast({ title: "Design submitted for review" });
      setImageUrl("");
      setNote("");
      void load();
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  }

  async function setStatus(id: string, status: string) {
    try {
      await customFetch(`/api/businesses/${bid}/design-proofs/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      void load();
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  }

  async function copyGuestLink(guestToken: string) {
    if (!business?.slug) return;
    const url = clientGuestTokenHref(business.slug, "proof", guestToken);
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Guest link copied" });
    } catch {
      toast({ title: url, description: "Copy this link for your client" });
    }
  }

  return (
    <PageFrame width="md" className="space-y-4" data-testid="design-proofs-page">
      <BodyArtPipelineCard />

      <PersonaRitualHeader
        variant="page"
        title="Design proofs"
        subtitle="Draft, client review, approve — then book the session."
      />

      <section className="space-y-2" data-testid="design-proofs-queue">
        <h2 className="text-sm font-semibold">Queue</h2>
        {proofs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center rounded-lg border border-dashed border-border/70">
            No proofs yet — submit artwork below.
          </p>
        ) : (
          <ul className="divide-y divide-border/70 rounded-lg border border-border/80 overflow-hidden bg-card">
            {proofs.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap gap-3 justify-between items-start px-3 py-3"
              >
                <div className="flex gap-3 min-w-0">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt=""
                      className="h-12 w-12 rounded object-cover shrink-0"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="font-medium text-sm capitalize">{p.status.replace(/_/g, " ")}</p>
                    {p.note ? <p className="text-xs text-muted-foreground line-clamp-2">{p.note}</p> : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 shrink-0">
                  {p.status === "pending_review" && p.guestToken ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8"
                      onClick={() => void copyGuestLink(p.guestToken!)}
                      data-testid={`copy-guest-proof-link-${p.id}`}
                    >
                      <Link2 className="h-3.5 w-3.5 mr-1" />
                      Guest link
                    </Button>
                  ) : null}
                  {p.status === "draft" ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8"
                      onClick={() => void setStatus(p.id, "pending_review")}
                    >
                      Send for review
                    </Button>
                  ) : null}
                  {(p.status === "pending_review" || p.status === "draft") && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => void setStatus(p.id, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8"
                        onClick={() => void setStatus(p.id, "rejected")}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <SettingsDisclosure
        title="Submit new proof"
        description="Upload artwork or paste a URL."
        defaultOpen={designProofsSubmitDefaultOpen(proofs.length)}
      >
        <div className="space-y-3 pt-1">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <ImageIcon className="h-3.5 w-3.5" />
              Artwork
            </Label>
            <Input
              type="file"
              accept="image/*"
              disabled={uploading}
              className="h-9"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file || !bid) return;
                setUploading(true);
                void uploadImageFile(bid, file, { entityType: "design_proof" })
                  .then((r) => setImageUrl(r.url))
                  .catch(() => toast({ title: "Upload failed", variant: "destructive" }))
                  .finally(() => setUploading(false));
              }}
            />
            {imageUrl ? (
              <img src={imageUrl} alt="" className="h-24 w-auto rounded border object-cover" />
            ) : null}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Or image URL</Label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Notes</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          </div>
          <Button size="sm" onClick={() => void submit()}>
            Submit for review
          </Button>
        </div>
      </SettingsDisclosure>
    </PageFrame>
  );
}
