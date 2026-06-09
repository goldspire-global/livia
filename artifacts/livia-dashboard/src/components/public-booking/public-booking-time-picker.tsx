import { formatTime } from "@/lib/format";
import {
  groupPublicSlotsByDayPart,
  type PublicSlotRow,
} from "@/lib/public-booking-helpers";
import { cn } from "@/lib/utils";

type Props = {
  slots: PublicSlotRow[];
  selectedStartAt: string;
  timeZone?: string;
  locale?: string;
  onSelect: (startAt: string) => void;
};

export function PublicBookingTimePicker({
  slots,
  selectedStartAt,
  timeZone,
  locale,
  onSelect,
}: Props) {
  const groups = groupPublicSlotsByDayPart(slots, timeZone);
  const showGroupLabels = groups.length > 1;

  return (
    <div
      className="max-h-[min(18rem,42vh)] overflow-y-auto overscroll-contain pr-0.5 -mr-0.5"
      data-testid="public-booking-time-picker"
    >
      {groups.map((group) => (
        <div key={group.part} className={cn(showGroupLabels && "mb-4 last:mb-0")}>
          {showGroupLabels ? (
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {group.label}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {group.slots.map((slot) => {
              const selected = selectedStartAt === slot.startAt;
              return (
                <button
                  key={slot.startAt}
                  type="button"
                  data-testid={`button-slot-${slot.startAt}`}
                  onClick={() => onSelect(slot.startAt)}
                  className={cn(
                    "min-w-[5.5rem] rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:bg-muted",
                  )}
                >
                  {formatTime(slot.startAt, { timeZone, locale })}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
