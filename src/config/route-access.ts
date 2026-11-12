import { routing } from "@/i18n/routing";

const ROOT_PATH = "/";

function stripLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split("/");
  const hasLocalePrefix = routing.locales.some((locale) => locale === first);
  if (!hasLocalePrefix) return pathname;
  return `/${rest.join("/")}`;
}

/** True when the path (with or without locale prefix) falls under one of the prefixes. */
export function isProtectedPath(pathname: string, prefixes: readonly string[]): boolean {
  const path = stripLocale(pathname);
  return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

/**
 * Sanitizes a ?next= value before redirecting to it after login.
 * Only same-site relative paths pass; anything else could send the user to another domain.
 */
export function toSafeRedirectPath(value: string | null | undefined): string {
  if (!value?.startsWith("/")) return ROOT_PATH;
  if (value.startsWith("//") || value.startsWith("/\\")) return ROOT_PATH;
  return value;
}
