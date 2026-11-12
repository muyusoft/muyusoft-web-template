import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { LOGIN_PATH, PROTECTED_PATH_PREFIXES, SESSION_COOKIE } from "@/config/auth.config";
import { isProtectedPath } from "@/config/route-access";
import { localeFromPath } from "@/i18n/locale-from-path";
import { routing } from "@/i18n/routing";

const handleI18n = createMiddleware(routing);

// Optimistic check (cookie present) to redirect before rendering. The (protected) layout
// re-checks on the server and the backend rejects invalid tokens with 401.
export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const needsSession = isProtectedPath(pathname, PROTECTED_PATH_PREFIXES);
  if (!needsSession || request.cookies.has(SESSION_COOKIE)) return handleI18n(request);

  const loginUrl = new URL(`/${localeFromPath(pathname)}${LOGIN_PATH}`, request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Skips API routes, Next internals and files with an extension (favicon.ico, images…).
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
