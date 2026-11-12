import type { MetadataRoute } from "next";
import { routing, type Locale } from "@/i18n/routing";

const ROOT_PATH = "/";
const X_DEFAULT = "x-default";

export function toLocalizedPath(locale: Locale, path: string): string {
  return path === ROOT_PATH ? `/${locale}` : `/${locale}${path}`;
}

/** hreflang map for a path: one entry per locale plus x-default. Prefix with siteUrl for absolute URLs. */
export function buildLanguageAlternates(path: string, siteUrl = ""): Record<string, string> {
  const entries = routing.locales.map((locale) => [locale, `${siteUrl}${toLocalizedPath(locale, path)}`]);
  const fallback = `${siteUrl}${toLocalizedPath(routing.defaultLocale, path)}`;
  return { ...Object.fromEntries(entries), [X_DEFAULT]: fallback };
}

/** For a page's generateMetadata: canonical URL plus hreflang links (relative to metadataBase). */
export function buildAlternates(path: string, locale: Locale) {
  return { canonical: toLocalizedPath(locale, path), languages: buildLanguageAlternates(path) };
}

export function buildSitemap(siteUrl: string, paths: readonly string[]): MetadataRoute.Sitemap {
  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${siteUrl}${toLocalizedPath(locale, path)}`,
      alternates: { languages: buildLanguageAlternates(path, siteUrl) },
    })),
  );
}
