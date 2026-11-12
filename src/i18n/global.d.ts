import type { routing } from "@/i18n/routing";
import type messages from "@/locales/es/translation.json";

// Makes t("missing.key") a compile error.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
