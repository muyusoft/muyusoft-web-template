import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { requireSession } from "@/config/auth-guard";
import { routing } from "@/i18n/routing";

interface ProtectedLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

// Every route in (protected) requires a session and renders dynamically; public routes stay static.
// Add each top-level folder here to PROTECTED_PATH_PREFIXES so proxy.ts redirects before rendering.
export default async function ProtectedLayout({ children, params }: ProtectedLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  await requireSession(locale);
  return children;
}
