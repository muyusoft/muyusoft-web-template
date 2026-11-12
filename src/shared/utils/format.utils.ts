// The locale is always passed in (from useLocale / getLocale), never read globally, so these stay pure.
const DEFAULT_CURRENCY = "USD";

function toDate(value: Date | string): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(
  value: Date | string,
  locale: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  const date = toDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatCurrency(amount: number, locale: string, currency = DEFAULT_CURRENCY): string {
  if (!Number.isFinite(amount)) return "";
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}

export function formatNumber(value: number, locale: string, options?: Intl.NumberFormatOptions): string {
  if (!Number.isFinite(value)) return "";
  return new Intl.NumberFormat(locale, options).format(value);
}
