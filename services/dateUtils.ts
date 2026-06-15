/**
 * Deterministic date formatting to prevent Next.js hydration mismatches.
 * Uses 'en-GB' to ensure DD/MM/YYYY format on both server and client.
 */
export function formatDateSafe(
  value?: Date | string | number | null
  , includeTime: boolean = false
): string {
  if (!value) return "-";

  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";

  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  if (includeTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
    options.second = "2-digit";
  }

  return new Intl.DateTimeFormat("en-GB", options).format(date);
}