import { describe, expect, it } from "vitest";
import { isProtectedPath, toSafeRedirectPath } from "@/config/route-access";

const PREFIXES = ["/account", "/dashboard"];

describe("isProtectedPath", () => {
  it("matches a prefix behind a locale", () => {
    expect(isProtectedPath("/es/account", PREFIXES)).toBe(true);
    expect(isProtectedPath("/en/dashboard/orders/1", PREFIXES)).toBe(true);
  });

  it("matches a prefix without a locale", () => {
    expect(isProtectedPath("/account/settings", PREFIXES)).toBe(true);
  });

  it("does not match a path that only starts with the same letters", () => {
    expect(isProtectedPath("/es/accounting", PREFIXES)).toBe(false);
  });

  it("does not match public paths", () => {
    expect(isProtectedPath("/es", PREFIXES)).toBe(false);
    expect(isProtectedPath("/es/pricing", PREFIXES)).toBe(false);
  });

  it("protects nothing when the list is empty", () => {
    expect(isProtectedPath("/es/account", [])).toBe(false);
  });
});

describe("toSafeRedirectPath", () => {
  it("keeps a relative path with query", () => {
    expect(toSafeRedirectPath("/es/account?tab=1")).toBe("/es/account?tab=1");
  });

  it("falls back to root for empty values", () => {
    expect(toSafeRedirectPath(null)).toBe("/");
    expect(toSafeRedirectPath(undefined)).toBe("/");
    expect(toSafeRedirectPath("")).toBe("/");
  });

  it("rejects absolute and protocol-relative URLs", () => {
    expect(toSafeRedirectPath("https://evil.com")).toBe("/");
    expect(toSafeRedirectPath("//evil.com")).toBe("/");
    expect(toSafeRedirectPath("/\\evil.com")).toBe("/");
  });
});
