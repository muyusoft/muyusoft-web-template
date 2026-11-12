import { describe, expect, it } from "vitest";
import {
  DEFAULT_API_TIMEOUT_MS,
  DEFAULT_SITE_URL,
  parseApiUrl,
  parseEnvironment,
  parseServerEnv,
  parseSiteUrl,
  parseTimeout,
  validateEnv,
} from "@/config/env.validation";

describe("parseApiUrl", () => {
  it("strips trailing slashes", () => {
    expect(parseApiUrl("https://api.dev.muyusoft.com//")).toBe("https://api.dev.muyusoft.com");
  });

  it("returns null when missing or empty, for sites without a backend", () => {
    expect(parseApiUrl(undefined)).toBeNull();
    expect(parseApiUrl("")).toBeNull();
  });

  it("throws when it is not a URL", () => {
    expect(() => parseApiUrl("api.muyusoft")).toThrow(/Invalid API_URL/);
  });
});

describe("parseTimeout", () => {
  it("defaults when not set", () => {
    expect(parseTimeout(undefined)).toBe(DEFAULT_API_TIMEOUT_MS);
  });

  it("parses a positive integer", () => {
    expect(parseTimeout("5000")).toBe(5000);
  });

  it("rejects zero, negatives and non-numbers", () => {
    expect(() => parseTimeout("0")).toThrow();
    expect(() => parseTimeout("-1")).toThrow();
    expect(() => parseTimeout("abc")).toThrow();
  });
});

describe("parseEnvironment", () => {
  it("defaults to development", () => {
    expect(parseEnvironment(undefined)).toBe("development");
  });

  it("accepts a known environment", () => {
    expect(parseEnvironment("production")).toBe("production");
  });

  it("rejects an unknown environment", () => {
    expect(() => parseEnvironment("staging")).toThrow(/NEXT_PUBLIC_ENVIRONMENT/);
  });
});

describe("parseSiteUrl", () => {
  it("strips trailing slashes", () => {
    expect(parseSiteUrl("https://muyusoft.com/", "production")).toBe("https://muyusoft.com");
  });

  it("defaults to localhost outside production", () => {
    expect(parseSiteUrl(undefined, "development")).toBe(DEFAULT_SITE_URL);
    expect(parseSiteUrl(undefined, "preview")).toBe(DEFAULT_SITE_URL);
  });

  it("is required in production", () => {
    expect(() => parseSiteUrl(undefined, "production")).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it("rejects a value that is not a URL", () => {
    expect(() => parseSiteUrl("muyusoft", "development")).toThrow(/Invalid NEXT_PUBLIC_SITE_URL/);
  });
});

describe("validateEnv", () => {
  it("accepts an empty env outside production", () => {
    expect(() => validateEnv({})).not.toThrow();
  });

  it("fails a production env without a site URL", () => {
    expect(() => validateEnv({ NEXT_PUBLIC_ENVIRONMENT: "production" })).toThrow();
  });
});

describe("parseServerEnv", () => {
  it("builds the server env from raw variables", () => {
    expect(parseServerEnv({ API_URL: "http://localhost:8080", API_TIMEOUT: "2000" })).toEqual({
      API_URL: "http://localhost:8080",
      API_TIMEOUT: 2000,
    });
  });
});
