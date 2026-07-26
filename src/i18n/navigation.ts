import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation primitives. ALWAYS import Link / useRouter /
 * usePathname / redirect from here, never from next/link or next/navigation
 * (enforced by ESLint no-restricted-imports).
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
