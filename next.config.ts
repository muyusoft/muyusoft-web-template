import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { validateEnv } from "./src/config/env.validation";

// Fails `next dev` / `next build` immediately when the env is missing or invalid.
validateEnv(process.env);

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const IS_DEV = process.env.NODE_ENV !== "production";
const ONE_YEAR_SECONDS = 31_536_000;

// The backend is only called from the server, so the browser needs no external connect-src.
// 'unsafe-inline' scripts are required by Next without nonces; dev also needs eval and the HMR socket.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${IS_DEV ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${IS_DEV ? " ws:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(IS_DEV ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  { key: "Strict-Transport-Security", value: `max-age=${ONE_YEAR_SECONDS}; includeSubDomains` },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default withNextIntl(nextConfig);
