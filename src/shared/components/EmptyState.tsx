import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Icon, type IconName } from "@/shared/icons";

interface EmptyStateProps {
  /** Already translated. Defaults to the generic empty copy. */
  message?: string;
  icon?: IconName;
  action?: ReactNode;
}

export function EmptyState({ message, icon = "info", action }: EmptyStateProps) {
  const t = useTranslations("common");
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center text-muted">
      <Icon name={icon} size="xl" />
      <p>{message ?? t("empty")}</p>
      {action}
    </div>
  );
}
