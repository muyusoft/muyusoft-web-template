import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { env } from "@/config/env";
import { routing } from "@/i18n/routing";
import "@/design/globals.css";

interface LocaleParams {
  params: Promise<{ locale: string }>;
}

interface LocaleLayoutProps extends LocaleParams {
  children: ReactNode;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "metadata" });
  const isIndexable = env.ENVIRONMENT === "production";
  // Canonical and hreflang are per page (buildAlternates); set here they would leak to every child.
  return {
    metadataBase: new URL(env.SITE_URL),
    title: { default: t("title"), template: `%s · ${t("title")}` },
    description: t("description"),
    openGraph: { type: "website", siteName: t("title"), locale },
    twitter: { card: "summary_large_image" },
    robots: { index: isIndexable, follow: isIndexable },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
