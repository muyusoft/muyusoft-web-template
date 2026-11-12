import { NextResponse, type NextRequest } from "next/server";
import { hasLocale } from "next-intl";
import { LOGIN_PATH } from "@/config/auth.config";
import { clearSessionToken } from "@/config/session";
import { routing } from "@/i18n/routing";

// Reached via redirectIfUnauthorized when the backend rejects the stored token.
export async function GET(request: NextRequest) {
  await clearSessionToken();
  const requested = request.nextUrl.searchParams.get("locale");
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return NextResponse.redirect(new URL(`/${locale}${LOGIN_PATH}`, request.url));
}
