import { describe, expect, it } from "vitest";
import { buildAlternates, buildLanguageAlternates, buildSitemap, toLocalizedPath } from "@/config/seo.utils";

const SITE_URL = "https://muyusoft.com";

describe("toLocalizedPath", () => {
  it("maps the root to the bare locale", () => {
    expect(toLocalizedPath("es", "/")).toBe("/es");
  });

  it("prefixes a nested path", () => {
    expect(toLocalizedPath("en", "/announcements")).toBe("/en/announcements");
  });
});

describe("buildLanguageAlternates", () => {
  it("lists every locale plus x-default pointing to the default locale", () => {
    expect(buildLanguageAlternates("/announcements")).toEqual({
      es: "/es/announcements",
      en: "/en/announcements",
      "x-default": "/es/announcements",
    });
  });

  it("builds absolute URLs when a site URL is given", () => {
    expect(buildLanguageAlternates("/", SITE_URL).en).toBe("https://muyusoft.com/en");
  });
});

describe("buildAlternates", () => {
  it("uses the current locale as canonical", () => {
    expect(buildAlternates("/", "en").canonical).toBe("/en");
  });
});

describe("buildSitemap", () => {
  it("creates one entry per path and locale", () => {
    const sitemap = buildSitemap(SITE_URL, ["/", "/pricing"]);
    expect(sitemap.map((entry) => entry.url)).toEqual([
      "https://muyusoft.com/es",
      "https://muyusoft.com/en",
      "https://muyusoft.com/es/pricing",
      "https://muyusoft.com/en/pricing",
    ]);
  });

  it("returns an empty sitemap when there are no public paths", () => {
    expect(buildSitemap(SITE_URL, [])).toEqual([]);
  });
});
