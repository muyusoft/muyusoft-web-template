import type { Metadata } from "next";
import { use } from "react";
import { notFound } from "next/navigation";
import { hasLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/config/seo.utils";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/shared/components";
import { PageLayout } from "@/shared/layouts";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  return { alternates: buildAlternates("/", locale) };
}

export default function HomePage({ params }: HomePageProps) {
  const { locale } = use(params);
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = useTranslations("home");

  return (
    <PageLayout header={<SiteHeader />}>
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="mt-2 text-muted">{t("description")}</p>
      <Link href="/announcements" className="mt-6 inline-flex min-h-11 items-center text-primary-600 underline hover:text-primary-700">
        {t("exampleLink")}
      </Link>
    </PageLayout>
  );
}
