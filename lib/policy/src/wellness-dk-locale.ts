/** DK market copy + quiet hours for copenhagen-havn-wellness */

export const WELLNESS_DK_QUIET_HOURS = {
  startHour: 21,
  endHour: 8,
  timezone: "Europe/Copenhagen",
} as const;

export const WELLNESS_DK_COPY = {
  locale: "da-DK",
  bookCta: "Book behandling",
  giftCta: "Giv en gave",
  confirmPending: "Vi bekræfter dit rum, når intake er besvaret.",
  confirmBooked: "Din tid er booket — vi glæder os til at se dig.",
  arrivalSms: "Kom 10 minutter før — vi guider dig til rummet.",
  receptionTitle: "Reception",
  packagesTitle: "Pakker",
  turnoverNote: (minutes: number) => `${minutes} min. klargøring mellem sessioner`,
} as const;

export function isWellnessQuietHours(now = new Date(), tz = WELLNESS_DK_QUIET_HOURS.timezone): boolean {
  try {
    const hour = Number(
      new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: tz }).format(now),
    );
    return hour >= WELLNESS_DK_QUIET_HOURS.startHour || hour < WELLNESS_DK_QUIET_HOURS.endHour;
  } catch {
    return false;
  }
}
