import { apiClient } from "@/config/api-client";
import type { Announcement, AnnouncementDto } from "@/features/announcements/types/announcement.types";

const ANNOUNCEMENTS_PATH = "/announcements";
const REVALIDATE_SECONDS = 300;
export const ANNOUNCEMENTS_CACHE_TAG = "announcements";

export function toAnnouncement(dto: AnnouncementDto): Announcement {
  return { id: dto.id, title: dto.title, summary: dto.summary, publishedAt: dto.published_at };
}

// Public data: cached and revalidated every 5 minutes, so the page stays fast without hitting the API.
export async function getAnnouncements(): Promise<Announcement[]> {
  const dtos = await apiClient.get<AnnouncementDto[]>(ANNOUNCEMENTS_PATH, {
    auth: false,
    revalidate: REVALIDATE_SECONDS,
    tags: [ANNOUNCEMENTS_CACHE_TAG],
  });
  return dtos.map(toAnnouncement);
}
