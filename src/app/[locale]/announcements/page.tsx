import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { logger } from "@/config/logger";
import { buildAlternates } from "@/config/seo.utils";
import { AnnouncementList, getAnnouncements, type Announcement } from "@/features/announcements";
import { routing } from "@/i18n/routing";
import { ErrorState, SiteHeader } from "@/shared/components";
import { PageLayout } from "@/shared/layouts";

const PATH = "/announcements";

interface AnnouncementsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AnnouncementsPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "announcements" });
  return { title: t("title"), description: t("description"), alternates: buildAlternates(PATH, locale) };
}

async function loadAnnouncements(): Promise<Announcement[] | null> {
  try {
    return await getAnnouncements();
  } catch (error) {
    logger.error("Failed to load announcements", { error });
    return null;
  }
}

export default async function AnnouncementsPage({ params }: AnnouncementsPageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [t, announcements] = await Promise.all([getTranslations("announcements"), loadAnnouncements()]);

  return (
    <PageLayout header={<SiteHeader />}>
      <h1 className="mb-6 text-3xl font-bold">{t("title")}</h1>
      {announcements ? <AnnouncementList announcements={announcements} /> : <ErrorState message={t("loadError")} />}
    </PageLayout>
  );
}
