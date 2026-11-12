import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate, formatNumber } from "@/shared/utils/format.utils";

const UTC_DAY: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "UTC",
};

describe("formatDate", () => {
  it("formats an ISO string for the given locale", () => {
    expect(formatDate("2026-01-15T12:00:00Z", "en-US", UTC_DAY)).toBe("01/15/2026");
  });

  it("formats a Date instance", () => {
    expect(formatDate(new Date("2026-01-15T12:00:00Z"), "es-EC", { year: "numeric", timeZone: "UTC" })).toBe("2026");
  });

  it("returns an empty string for an invalid date", () => {
    expect(formatDate("not-a-date", "es")).toBe("");
  });
});

describe("formatCurrency", () => {
  it("formats USD by default", () => {
    expect(formatCurrency(1234.5, "en-US")).toBe("$1,234.50");
  });

  it("formats zero and negative amounts", () => {
    expect(formatCurrency(0, "en-US")).toBe("$0.00");
    expect(formatCurrency(-5, "en-US")).toBe("-$5.00");
  });

  it("returns an empty string for a non-finite amount", () => {
    expect(formatCurrency(Number.NaN, "en-US")).toBe("");
  });
});

describe("formatNumber", () => {
  it("uses the locale separators", () => {
    expect(formatNumber(1234.5, "en-US")).toBe("1,234.5");
  });

  it("returns an empty string for infinity", () => {
    expect(formatNumber(Number.POSITIVE_INFINITY, "en-US")).toBe("");
  });
});
