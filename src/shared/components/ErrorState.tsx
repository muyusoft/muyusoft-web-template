import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/Button";
import { Icon } from "@/shared/icons";

interface ErrorStateProps {
  /** Already translated. Defaults to the generic error copy. */
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const t = useTranslations("common");
  return (
    <div role="alert" className="flex flex-col items-center gap-4 py-12 text-center">
      <Icon name="warning" size="xl" className="text-error-500" />
      <p className="text-foreground">{message ?? t("error")}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          <Icon name="refresh" size="sm" />
          {t("retry")}
        </Button>
      )}
    </div>
  );
}
