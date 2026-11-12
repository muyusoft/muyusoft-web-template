import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

interface PageLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}

export function PageLayout({ children, header, footer }: PageLayoutProps) {
  const t = useTranslations("common");
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only rounded-md bg-surface px-4 py-2 focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
      >
        {t("skipToContent")}
      </a>
      {header && <header className="border-b border-border bg-surface">{header}</header>}
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      {footer && <footer className="border-t border-border">{footer}</footer>}
    </div>
  );
}
