import { useTranslations } from "next-intl";
import { Icon } from "@/shared/icons";

export function LoadingState() {
  const t = useTranslations("common");
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-12 text-muted">
      <Icon name="loader" size="lg" className="animate-spin" />
      <span>{t("loading")}</span>
    </div>
  );
}
