import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * Runs the locale middleware first, then refreshes the Supabase session on the
 * response it produced. Order matters: next-intl may rewrite or redirect, and
 * the refreshed auth cookies have to travel on whatever response ships.
 */
export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Touching the user is what triggers the token refresh + cookie rotation.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Match all paths except api routes, Next internals and files with extensions
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};

export const runtime = "nodejs";

export type { NextResponse };
