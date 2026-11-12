import { useLocale } from "next-intl";
import type { Announcement } from "@/features/announcements/types/announcement.types";
import { formatDate } from "@/shared/utils/format.utils";

interface AnnouncementCardProps {
  announcement: Announcement;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const locale = useLocale();
  return (
    <article className="rounded-lg border border-border bg-surface p-4">
      <h2 className="text-lg font-semibold text-foreground">{announcement.title}</h2>
      <time dateTime={announcement.publishedAt} className="text-sm text-muted">
        {formatDate(announcement.publishedAt, locale)}
      </time>
      <p className="mt-2 text-foreground">{announcement.summary}</p>
    </article>
  );
}
