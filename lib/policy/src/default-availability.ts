/** Default Mon–Fri shop hours — seeded at business create so public book has slots. */

export type WeekdayAvailabilityRule = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export const DEFAULT_WEEKDAY_AVAILABILITY: WeekdayAvailabilityRule[] = [1, 2, 3, 4, 5].map(
  (dayOfWeek) => ({
    dayOfWeek,
    startTime: "09:00",
    endTime: "17:00",
  }),
);
