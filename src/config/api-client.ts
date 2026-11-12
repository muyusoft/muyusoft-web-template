import "server-only";
import { ApiError, abortedError, fromHttpResponse, networkError } from "@/config/api-error";
import { serverEnv } from "@/config/env.server";
import { logger } from "@/config/logger";
import { getSessionToken } from "@/config/session";

const API_PREFIX = "/api/v1";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type QueryValue = string | number | boolean | undefined;

export interface RequestOptions {
  body?: unknown;
  query?: Record<string, QueryValue>;
  /** false for public routes: no token is sent. */
  auth?: boolean;
  /** Explicit token for this call (e.g. a pre-registration token). */
  token?: string;
  /** true generates an Idempotency-Key; a string reuses it across retries. */
  idempotent?: boolean | string;
  /** false returns the whole body (e.g. paginated { data, total }). */
  unwrap?: boolean;
  signal?: AbortSignal;
  /** Seconds to cache. Only honored with auth: false — user data is never cached. */
  revalidate?: number;
  tags?: string[];
}

type OptionsWithoutBody = Omit<RequestOptions, "body">;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

// The backend mixes JSON and plain-text bodies.
function parseBody(raw: string): unknown {
  if (raw === "") return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

// Most endpoints wrap the resource in { data }, some return it directly.
const unwrap = (body: unknown): unknown => (isRecord(body) && "data" in body ? body.data : body);

function buildUrl(path: string, query: RequestOptions["query"]): URL {
  if (!serverEnv.API_URL) {
    throw new Error("API_URL is not set. Copy .env.example to .env.local and set the backend URL.");
  }
  const url = new URL(`${serverEnv.API_URL}${API_PREFIX}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url;
}

async function resolveToken(options: RequestOptions): Promise<string | null> {
  if (options.auth === false) return null;
  return options.token ?? getSessionToken();
}

function resolveIdempotencyKey(idempotent: RequestOptions["idempotent"]): string | undefined {
  if (typeof idempotent === "string") return idempotent;
  return idempotent ? crypto.randomUUID() : undefined;
}

async function buildHeaders(options: RequestOptions): Promise<Headers> {
  const headers = new Headers({ Accept: "application/json" });
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  const token = await resolveToken(options);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const idempotencyKey = resolveIdempotencyKey(options.idempotent);
  if (idempotencyKey) headers.set("Idempotency-Key", idempotencyKey);
  return headers;
}

function buildSignal(signal: AbortSignal | undefined): AbortSignal {
  const timeout = AbortSignal.timeout(serverEnv.API_TIMEOUT);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

function cacheOptions(options: RequestOptions): Pick<RequestInit, "cache" | "next"> {
  if (options.auth !== false || options.revalidate === undefined) return { cache: "no-store" };
  return { next: { revalidate: options.revalidate, ...(options.tags && { tags: options.tags }) } };
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof DOMException && error.name === "AbortError") return abortedError();
  if (error instanceof DOMException && error.name === "TimeoutError") return networkError("Request timed out");
  return networkError(error instanceof Error ? error.message : "Network request failed");
}

// Never log bodies or headers: tokens and OTP codes must not reach the logs.
function logFailure(error: ApiError, method: HttpMethod, path: string): ApiError {
  logger.warn("API request failed", { method, path, status: error.status, code: error.code });
  return error;
}

/**
 * Single channel to the backend, server-side only. Paths are relative to /api/v1.
 * A 401 propagates as ApiError("UNAUTHORIZED"); cookies can only be cleared in a
 * Server Action or Route Handler, so the caller decides how to end the session.
 */
export async function request<T>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<T> {
  // Built outside the try: a missing API_URL is a config error, not a network error.
  const url = buildUrl(path, options.query);
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: await buildHeaders(options),
      signal: buildSignal(options.signal),
      ...cacheOptions(options),
      ...(options.body !== undefined && { body: JSON.stringify(options.body) }),
    });
  } catch (error) {
    throw logFailure(toApiError(error), method, path);
  }
  const body = parseBody(await response.text());
  if (!response.ok) throw logFailure(fromHttpResponse(response.status, body), method, path);
  return (options.unwrap === false ? body : unwrap(body)) as T;
}

export const apiClient = {
  get: <T>(path: string, options?: OptionsWithoutBody) => request<T>("GET", path, options),
  delete: <T>(path: string, options?: OptionsWithoutBody) => request<T>("DELETE", path, options),
  post: <T>(path: string, body?: unknown, options?: OptionsWithoutBody) =>
    request<T>("POST", path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: OptionsWithoutBody) =>
    request<T>("PUT", path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: OptionsWithoutBody) =>
    request<T>("PATCH", path, { ...options, body }),
};
