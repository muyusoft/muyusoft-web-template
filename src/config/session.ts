import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/config/auth.config";

// TODO: match the backend access-token lifetime once it is confirmed.
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/** The backend Bearer token lives only in this httpOnly cookie; client JS can never read it. */
export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

// Next only allows writing cookies from Server Actions and Route Handlers, never during render.
export async function setSessionToken(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionToken(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
