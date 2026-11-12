import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PageLayout } from "@/shared/layouts";

export default function NotFoundPage() {
  const t = useTranslations();
  return (
    <PageLayout>
      <h1 className="text-2xl font-bold">{t("notFound.title")}</h1>
      <p className="mt-2 text-muted">{t("notFound.description")}</p>
      <Link href="/" className="mt-6 inline-block text-primary-600 underline hover:text-primary-700">
        {t("common.backHome")}
      </Link>
    </PageLayout>
  );
}
