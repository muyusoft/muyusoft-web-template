import type { MetadataRoute } from "next";
import { env } from "@/config/env";
import { PUBLIC_PATHS } from "@/config/seo.config";
import { buildSitemap } from "@/config/seo.utils";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap(env.SITE_URL, PUBLIC_PATHS);
}
