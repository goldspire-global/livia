import { BookingWizard } from "@/components/booking/booking-wizard";
import { useBusiness } from "@/lib/business-context";
import { bookingExperienceCopy } from "@workspace/policy";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (bookingId: string) => void;
};

export function BookingGuidedDialog({ open, onOpenChange, onCreated }: Props) {
  const { business } = useBusiness();
  const exp = bookingExperienceCopy(
    (business as { vertical?: string } | null)?.vertical,
    (business as { category?: string } | null)?.category,
  );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{exp.listGuidedBookingTitle}</DialogTitle>
          <DialogDescription>{exp.listGuidedBookingDescription}</DialogDescription>
        </DialogHeader>
        <BookingWizard
          mode="dialog"
          quick={false}
          onCreated={(id) => {
            onCreated?.(id);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
