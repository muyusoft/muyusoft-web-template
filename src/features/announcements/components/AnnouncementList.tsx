import { useTranslations } from "next-intl";
import { AnnouncementCard } from "@/features/announcements/components/AnnouncementCard";
import type { Announcement } from "@/features/announcements/types/announcement.types";
import { EmptyState } from "@/shared/components/EmptyState";

interface AnnouncementListProps {
  announcements: Announcement[];
}

export function AnnouncementList({ announcements }: AnnouncementListProps) {
  const t = useTranslations("announcements");
  if (announcements.length === 0) return <EmptyState message={t("empty")} />;

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {announcements.map((announcement) => (
        <li key={announcement.id}>
          <AnnouncementCard announcement={announcement} />
        </li>
      ))}
    </ul>
  );
}
