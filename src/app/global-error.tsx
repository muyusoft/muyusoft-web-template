"use client";

import { useEffect } from "react";
import { logger } from "@/config/logger";
import { localeFromPath } from "@/i18n/locale-from-path";
import { routing, type Locale } from "@/i18n/routing";
import en from "@/locales/en/translation.json";
import es from "@/locales/es/translation.json";
import { Button } from "@/shared/components/Button";
import "@/design/globals.css";

// Replaces the root layout when it crashes, so there is no intl provider: messages are read directly.
const MESSAGES: Record<Locale, typeof es> = { en, es };

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    logger.error("Unhandled root error", { message: error.message, digest: error.digest });
  }, [error]);

  const locale = typeof window === "undefined" ? routing.defaultLocale : localeFromPath(window.location.pathname);
  const { common } = MESSAGES[locale];

  return (
    <html lang={locale}>
      <body className="antialiased">
        <main role="alert" className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-2xl font-bold">{common.error}</h1>
          <Button onClick={reset}>{common.retry}</Button>
        </main>
      </body>
    </html>
  );
}
