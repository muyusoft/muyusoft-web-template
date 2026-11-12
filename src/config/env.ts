import { parseEnvironment, parseSiteUrl, type Environment } from "@/config/env.validation";

interface PublicEnv {
  ENVIRONMENT: Environment;
  SITE_URL: string;
}

// NEXT_PUBLIC_* must be referenced literally so Next can inline them in the client bundle.
const ENVIRONMENT = parseEnvironment(process.env.NEXT_PUBLIC_ENVIRONMENT);

export const env: PublicEnv = {
  ENVIRONMENT,
  SITE_URL: parseSiteUrl(process.env.NEXT_PUBLIC_SITE_URL, ENVIRONMENT),
};
