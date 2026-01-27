/**
 * Parse a date string (YYYY-MM-DD) without timezone shift.
 *
 * HTML date inputs return strings like "1979-01-15". When parsed with
 * `new Date("1979-01-15")`, JavaScript interprets this as midnight UTC.
 * In US timezones (UTC-5 to UTC-8), this displays as the previous day.
 *
 * This function creates the date at noon UTC, ensuring it displays
 * correctly in any timezone within ±12 hours of UTC.
 *
 * @example
 * parseDateString("1979-01-15") // Always displays as January 15, 1979
 */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}
