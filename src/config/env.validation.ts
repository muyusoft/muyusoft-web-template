// Plain module (no "server-only", no @/ imports) so next.config.ts can run it and fail the build early.
const ENVIRONMENTS = ["development", "preview", "production"] as const;
export type Environment = (typeof ENVIRONMENTS)[number];

// The MuyuSoft backend cuts requests at 15 s.
export const DEFAULT_API_TIMEOUT_MS = 15_000;
export const DEFAULT_SITE_URL = "http://localhost:3000";

export interface ServerEnv {
  /** null for sites without a backend (landing pages); apiClient throws if it is used. */
  API_URL: string | null;
  API_TIMEOUT: number;
}

type RawEnv = Record<string, string | undefined>;

function normalizeUrl(name: string, value: string): string {
  if (!URL.canParse(value)) throw new Error(`Invalid ${name}: "${value}" is not a URL.`);
  return value.replace(/\/+$/, "");
}

export function parseApiUrl(value: string | undefined): string | null {
  if (!value) return null;
  return normalizeUrl("API_URL", value);
}

/** Canonical public URL, used by the sitemap, robots and metadata. Required in production. */
export function parseSiteUrl(value: string | undefined, environment: Environment): string {
  if (value) return normalizeUrl("NEXT_PUBLIC_SITE_URL", value);
  if (environment === "production") throw new Error("Missing NEXT_PUBLIC_SITE_URL in production.");
  return DEFAULT_SITE_URL;
}

export function parseTimeout(value: string | undefined): number {
  if (!value) return DEFAULT_API_TIMEOUT_MS;
  const timeout = Number(value);
  if (!Number.isInteger(timeout) || timeout <= 0) {
    throw new Error(`Invalid API_TIMEOUT: "${value}" must be a positive integer (ms).`);
  }
  return timeout;
}

export function parseEnvironment(value: string | undefined): Environment {
  if (!value) return "development";
  const environment = ENVIRONMENTS.find((item) => item === value);
  if (!environment) throw new Error(`Invalid NEXT_PUBLIC_ENVIRONMENT: "${value}".`);
  return environment;
}

export function parseServerEnv(raw: RawEnv): ServerEnv {
  return { API_URL: parseApiUrl(raw.API_URL), API_TIMEOUT: parseTimeout(raw.API_TIMEOUT) };
}

/** Validates the public variables too, so next.config.ts fails the build on any bad value. */
export function validateEnv(raw: RawEnv): void {
  parseServerEnv(raw);
  parseSiteUrl(raw.NEXT_PUBLIC_SITE_URL, parseEnvironment(raw.NEXT_PUBLIC_ENVIRONMENT));
}
