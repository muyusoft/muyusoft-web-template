// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/config/api-client";
import { ApiError } from "@/config/api-error";
import { getSessionToken } from "@/config/session";

vi.mock("@/config/env.server", () => ({
  serverEnv: { API_URL: "https://api.test", API_TIMEOUT: 1000 },
}));
vi.mock("@/config/session", () => ({ getSessionToken: vi.fn() }));
vi.mock("@/config/logger", () => ({ logger: { warn: vi.fn() } }));

const fetchMock = vi.fn<typeof fetch>();

const jsonResponse = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });

function lastCall(): { url: string; init: RequestInit } {
  const [url, init] = fetchMock.mock.calls.at(-1) ?? [];
  return { url: String(url), init: init ?? {} };
}

const sentHeaders = () => new Headers(lastCall().init.headers);

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(jsonResponse(200, { data: { id: 1 } }));
  vi.stubGlobal("fetch", fetchMock);
  vi.mocked(getSessionToken).mockResolvedValue("stored-token");
});

describe("apiClient", () => {
  it("prefixes the path with /api/v1 and unwraps { data }", async () => {
    await expect(apiClient.get("/users/me")).resolves.toEqual({ id: 1 });
    expect(lastCall().url).toBe("https://api.test/api/v1/users/me");
  });

  it("returns the whole body when unwrap is false", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { data: [], total: 0 }));
    await expect(apiClient.get("/jobs", { unwrap: false })).resolves.toEqual({ data: [], total: 0 });
  });

  it("sends the session cookie token as a Bearer header", async () => {
    await apiClient.get("/users/me");
    expect(sentHeaders().get("Authorization")).toBe("Bearer stored-token");
  });

  it("prefers an explicit token over the session", async () => {
    await apiClient.get("/users/me", { token: "explicit" });
    expect(sentHeaders().get("Authorization")).toBe("Bearer explicit");
  });

  it("sends no token on public routes", async () => {
    await apiClient.get("/categories", { auth: false });
    expect(sentHeaders().has("Authorization")).toBe(false);
  });

  it("skips undefined query values", async () => {
    await apiClient.get("/jobs", { query: { page: 2, status: undefined } });
    expect(lastCall().url).toBe("https://api.test/api/v1/jobs?page=2");
  });

  it("serializes the body and reuses a given idempotency key", async () => {
    await apiClient.post("/jobs", { title: "Fix" }, { idempotent: "key-1" });
    expect(lastCall().init.body).toBe(JSON.stringify({ title: "Fix" }));
    expect(sentHeaders().get("Idempotency-Key")).toBe("key-1");
  });

  it("never caches authenticated requests", async () => {
    await apiClient.get("/users/me", { revalidate: 60 });
    expect(lastCall().init.cache).toBe("no-store");
  });

  it("caches public requests when revalidate is set", async () => {
    await apiClient.get("/categories", { auth: false, revalidate: 60 });
    expect(lastCall().init.next).toEqual({ revalidate: 60 });
  });

  it("maps a JSON error body to ApiError", async () => {
    fetchMock.mockResolvedValue(jsonResponse(422, { error_code: "INVALID_PHONE", message: "Bad phone" }));
    await expect(apiClient.post("/otp", {})).rejects.toMatchObject({ status: 422, code: "INVALID_PHONE" });
  });

  it("maps a 401 to an UNAUTHORIZED ApiError", async () => {
    fetchMock.mockResolvedValue(new Response("Unauthorized", { status: 401 }));
    await expect(apiClient.get("/users/me")).rejects.toMatchObject({ status: 401, code: "UNAUTHORIZED" });
  });

  it("maps a network failure to NETWORK_ERROR", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    const error = await apiClient.get("/users/me").catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 0, code: "NETWORK_ERROR" });
  });
});
