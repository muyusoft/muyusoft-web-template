import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "no-console": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": "error",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "axios", message: "Use @/config/api-client (server-side)." },
            { name: "next/link", message: "Use Link from @/i18n/navigation." },
          ],
          patterns: [
            { group: ["../*"], message: "Use the @/ alias." },
            { group: ["lucide-react"], message: "Import icons from @/shared/icons." },
          ],
        },
      ],
    },
  },
  {
    files: ["src/shared/icons/**"],
    rules: { "no-restricted-imports": "off" },
  },
  {
    files: ["src/config/logger.ts"],
    rules: { "no-console": "off" },
  },
  { ignores: [".next/", "node_modules/", "coverage/", "next-env.d.ts"] },
];
