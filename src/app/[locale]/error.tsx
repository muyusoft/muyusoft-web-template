"use client";

import { useEffect } from "react";
import { logger } from "@/config/logger";
import { ErrorState } from "@/shared/components";
import { PageLayout } from "@/shared/layouts";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    logger.error("Unhandled route error", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <PageLayout>
      <ErrorState onRetry={reset} />
    </PageLayout>
  );
}
