import type { MetadataRoute } from "next";
import { PROTECTED_PATH_PREFIXES } from "@/config/auth.config";
import { env } from "@/config/env";
import { routing } from "@/i18n/routing";

export default function robots(): MetadataRoute.Robots {
  // Dev and preview deployments must never be indexed.
  if (env.ENVIRONMENT !== "production") return { rules: { userAgent: "*", disallow: "/" } };

  const privatePaths = routing.locales.flatMap((locale) =>
    PROTECTED_PATH_PREFIXES.map((prefix) => `/${locale}${prefix}`),
  );
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", ...privatePaths] },
    sitemap: `${env.SITE_URL}/sitemap.xml`,
  };
}
