// Plain module: read by proxy.ts (edge) and by server code.
export const SESSION_COOKIE = "session";

/** Not provided by the template: each project builds its own login (OTP, password, SSO…). */
export const LOGIN_PATH = "/login";

export const SESSION_EXPIRED_PATH = "/api/session/expired";

/**
 * Path prefixes, without locale, that require a session — e.g. ["/account", "/dashboard"].
 * Empty means a fully public site (landing pages). Keep in sync with the (protected) route group.
 */
export const PROTECTED_PATH_PREFIXES: readonly string[] = [];
