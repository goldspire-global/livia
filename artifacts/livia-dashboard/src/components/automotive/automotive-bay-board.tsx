import { WellnessInteractiveRoomBoard } from "@/components/wellness/wellness-room-board";
import type { RoomBoardBooking, RoomBoardResource } from "@/components/wellness/wellness-room-board";

type Props = {
  bookings: RoomBoardBooking[];
  resources: RoomBoardResource[];
  onAssignBookingToResource?: (
    bookingId: string,
    resourceId: string | null,
  ) => Promise<boolean>;
  assigningBookingId?: string | null;
  vertical?: string;
};

/** Bay utilisation board for automotive detailing — reuses room swimlanes. */
export function AutomotiveBayBoard({
  bookings,
  resources,
  onAssignBookingToResource,
  assigningBookingId,
  vertical = "automotive-detailing",
}: Props) {
  if (!resources.length) return null;

  return (
    <section data-testid="automotive-bay-board" className="space-y-2">
      <div>
        <h2 className="text-sm font-medium">Bay board</h2>
        <p className="text-xs text-muted-foreground">
          Drag jobs between bays — today&apos;s detail lane at a glance.
        </p>
      </div>
      <WellnessInteractiveRoomBoard
        bookings={bookings}
        resources={resources}
        onAssignBookingToResource={onAssignBookingToResource}
        assigningBookingId={assigningBookingId}
        vertical={vertical}
        hero
      />
    </section>
  );
}
