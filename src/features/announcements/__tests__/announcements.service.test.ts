import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/config/api-client";
import { ApiError } from "@/config/api-error";
import { ANNOUNCEMENTS_CACHE_TAG, getAnnouncements } from "@/features/announcements/services/announcements.service";

vi.mock("@/config/api-client", () => ({ apiClient: { get: vi.fn() } }));

const DTO = { id: "a1", title: "Launch", summary: "We are live", published_at: "2026-01-15T12:00:00Z" };

beforeEach(() => {
  vi.mocked(apiClient.get).mockReset();
});

describe("getAnnouncements", () => {
  it("maps backend snake_case fields to the app shape", async () => {
    vi.mocked(apiClient.get).mockResolvedValue([DTO]);
    await expect(getAnnouncements()).resolves.toEqual([
      { id: "a1", title: "Launch", summary: "We are live", publishedAt: "2026-01-15T12:00:00Z" },
    ]);
  });

  it("requests public, cached data", async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    await getAnnouncements();
    expect(apiClient.get).toHaveBeenCalledWith(
      "/announcements",
      expect.objectContaining({ auth: false, tags: [ANNOUNCEMENTS_CACHE_TAG] }),
    );
  });

  it("returns an empty list when there are no announcements", async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    await expect(getAnnouncements()).resolves.toEqual([]);
  });

  it("lets the API error propagate", async () => {
    const error = new ApiError({ status: 500, code: "SERVER_ERROR", message: "Boom" });
    vi.mocked(apiClient.get).mockRejectedValue(error);
    await expect(getAnnouncements()).rejects.toBe(error);
  });
});
