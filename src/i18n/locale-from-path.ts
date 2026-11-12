import { routing, type Locale } from "@/i18n/routing";

/** For code that renders outside the locale layout (e.g. global-error) and has no intl provider. */
export function localeFromPath(pathname: string): Locale {
  const segment = pathname.split("/")[1];
  return routing.locales.find((locale) => locale === segment) ?? routing.defaultLocale;
}
