/** Locale-aware formatters used by every portal. Keep all en-IN formatting here. */

export const formatINR = (n: number | string, { space = false } = {}) =>
  `₹${space ? " " : ""}${Math.round(Number(n)).toLocaleString("en-IN")}`;

export const formatNumber = (n: number | string) => Number(n).toLocaleString("en-IN");

export const formatDate = (d: Date | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" }) =>
  d ? d.toLocaleDateString("en-IN", opts) : "—";

export const formatDateLong = (d: Date | null | undefined) => formatDate(d, { day: "2-digit", month: "short", year: "numeric" });

export const formatMonthYear = (d: Date | null | undefined) => formatDate(d, { month: "short", year: "numeric" });

export const formatDateTime = (d: Date | null | undefined) =>
  d ? d.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

export function formatImpressions(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M+`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k+`;
  return String(n);
}
