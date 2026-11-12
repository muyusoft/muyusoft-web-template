import { createNavigation } from "next-intl/navigation";
import { routing } from "@/i18n/routing";

// Use these instead of next/link and next/navigation so the locale prefix is kept.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
