/** Shape returned by the backend (snake_case). Never used outside the service. */
export interface AnnouncementDto {
  id: string;
  title: string;
  summary: string;
  published_at: string;
}

/** Shape the app uses. */
export interface Announcement {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
}
