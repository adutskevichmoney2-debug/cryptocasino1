import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Locale-aware navigation must come from @/i18n/navigation
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next/link",
              message: "Import { Link } from '@/i18n/navigation' instead (locale-aware).",
            },
            {
              name: "next/navigation",
              importNames: ["useRouter", "usePathname", "redirect", "permanentRedirect"],
              message: "Import from '@/i18n/navigation' instead (locale-aware).",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/i18n/**"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
];

export default eslintConfig;
