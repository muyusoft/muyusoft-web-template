import { describe, expect, it } from "vitest";
import { localeFromPath } from "@/i18n/locale-from-path";
import { routing } from "@/i18n/routing";

describe("localeFromPath", () => {
  it("reads the locale from the first segment", () => {
    expect(localeFromPath("/en/orders/1")).toBe("en");
  });

  it("falls back to the default locale for an unknown segment", () => {
    expect(localeFromPath("/fr/orders")).toBe(routing.defaultLocale);
  });

  it("falls back to the default locale for the root path or an empty string", () => {
    expect(localeFromPath("/")).toBe(routing.defaultLocale);
    expect(localeFromPath("")).toBe(routing.defaultLocale);
  });
});
