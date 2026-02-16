import { format } from "date-fns";

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

/**
 * Format an event date based on its precision level.
 *
 * Handles approximate dates with a tilde prefix and adjusts
 * the format based on how precise the date is:
 * - DECADE: "1950s" or "~1950s"
 * - YEAR: "1952" or "~1952"
 * - MONTH: "March 1952" or "~March 1952"
 * - DAY: "March 15, 1952" or "~March 15, 1952"
 */
export function formatEventDate(
  date: Date | null,
  precision: string,
  approximate: boolean
): string {
  if (!date) return "Date unknown";

  const prefix = approximate ? "~" : "";

  switch (precision) {
    case "DECADE":
      return `${prefix}${Math.floor(date.getFullYear() / 10) * 10}s`;
    case "YEAR":
      return `${prefix}${date.getFullYear()}`;
    case "MONTH":
      return `${prefix}${format(date, "MMMM yyyy")}`;
    case "DAY":
    default:
      return `${prefix}${format(date, "MMMM d, yyyy")}`;
  }
}

/**
 * Extract the year from a date for timeline grouping.
 * Returns null for entries without dates.
 */
export function getEventYear(date: Date | null): number | null {
  return date ? date.getFullYear() : null;
}

/**
 * Strip HTML tags from a string for plain-text preview.
 * Returns the input unchanged if it doesn't appear to be HTML.
 */
export function stripHtml(html: string): string {
  if (!html.trimStart().startsWith("<")) return html;
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
