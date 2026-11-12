import { vi } from "vitest";

// "server-only" throws outside the React Server bundle; tests import server modules directly.
vi.mock("server-only", () => ({}));

// Components are tested without an intl provider: t() returns the key, so assertions do not
// depend on copy. Override per test with vi.mocked(...) when a test needs other values.
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));
