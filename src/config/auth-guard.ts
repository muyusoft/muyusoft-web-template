import "server-only";
import { redirect as redirectToPath } from "next/navigation";
import { ApiError } from "@/config/api-error";
import { LOGIN_PATH, SESSION_EXPIRED_PATH } from "@/config/auth.config";
import { getSessionToken } from "@/config/session";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

const HTTP_UNAUTHORIZED = 401;

/** Backstop for proxy.ts, which only checks that the cookie exists. Returns the token. */
export async function requireSession(locale: Locale): Promise<string> {
  const token = await getSessionToken();
  if (token) return token;
  return redirect({ href: LOGIN_PATH, locale });
}

/**
 * Call from a catch around apiClient in protected pages. An expired token cannot be
 * cleared during render, so a Route Handler clears the cookie and sends the user to login.
 */
export function redirectIfUnauthorized(error: unknown, locale: Locale): void {
  if (!(error instanceof ApiError) || error.status !== HTTP_UNAUTHORIZED) return;
  redirectToPath(`${SESSION_EXPIRED_PATH}?locale=${locale}`);
}
