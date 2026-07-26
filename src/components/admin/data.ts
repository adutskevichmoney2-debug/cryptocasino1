import "server-only";

import type { getSupabaseServerClient } from "@/lib/supabase/server";

export type AdminSupabase = Awaited<ReturnType<typeof getSupabaseServerClient>>;

export interface MiniProfile {
  id: string;
  player_id: number;
  nickname: string;
  email: string;
}

/**
 * Resolves a batch of user ids to display names in one round trip.
 *
 * Embedded PostgREST joins are avoided on purpose: the hand-written Database
 * type declares no relationships, so `select("*, profiles(...)")` would not
 * type-check.
 */
export async function loadProfiles(
  supabase: AdminSupabase,
  ids: readonly (string | null | undefined)[],
): Promise<Map<string, MiniProfile>> {
  const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (unique.length === 0) return new Map();

  const { data } = await supabase
    .from("profiles")
    .select("id, player_id, nickname, email")
    .in("id", unique);

  return new Map((data ?? []).map((p) => [p.id, p]));
}
