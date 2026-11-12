import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/shared/components/LocaleSwitcher";

export function SiteHeader() {
  const t = useTranslations("metadata");
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex min-h-11 items-center text-lg font-bold text-foreground">
        {t("title")}
      </Link>
      <LocaleSwitcher />
    </div>
  );
}
