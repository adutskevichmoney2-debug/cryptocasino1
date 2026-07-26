import "server-only";

import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/supabase/types";

/**
 * Supabase credentials are inlined at build time; when they are missing the
 * admin layout renders a configuration notice instead of crashing.
 */
export const ADMIN_SUPABASE_READY =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export function isStaffRole(role: string | undefined | null): boolean {
  return role === "admin" || role === "support";
}

/**
 * Every admin route calls this. RLS already restricts staff-only rows, but a
 * non-staff visitor must get a 404 rather than an empty-looking panel.
 *
 * Returns null only when Supabase is unconfigured — callers then render nothing
 * and the layout shows the notice.
 */
export async function requireStaff(): Promise<ProfileRow | null> {
  if (!ADMIN_SUPABASE_READY) return null;

  let profile: ProfileRow | null = null;
  try {
    profile = await getCurrentProfile();
  } catch {
    return null;
  }

  if (!profile || !isStaffRole(profile.role)) notFound();
  return profile;
}

/** Audit log and role changes are admin-only, on top of the RPC's own check. */
export async function requireAdmin(): Promise<ProfileRow | null> {
  const profile = await requireStaff();
  if (profile && profile.role !== "admin") notFound();
  return profile;
}
