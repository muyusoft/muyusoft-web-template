/**
 * Public, indexable paths without locale. Every public page goes here so it lands in the sitemap.
 * Protected paths never do: robots.ts blocks them through PROTECTED_PATH_PREFIXES.
 */
export const PUBLIC_PATHS: readonly string[] = ["/", "/announcements"];
