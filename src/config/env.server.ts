import "server-only";
import { parseServerEnv } from "@/config/env.validation";

// Without the NEXT_PUBLIC_ prefix these never reach the browser bundle.
export const serverEnv = parseServerEnv(process.env);
