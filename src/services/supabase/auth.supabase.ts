import type { AuthService, Result, Session, UserProfile } from "../types";
import { fail, ok } from "../types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database, ProfileRow } from "@/lib/supabase/types";
import { errorCode } from "./errors";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

/**
 * `player_id` is a bigint column but the app models the public player number as
 * an opaque string, and `xp` / numeric columns arrive from PostgREST as strings.
 */
export function toUserProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    playerId: String(row.player_id),
    email: row.email,
    nickname: row.nickname,
    avatarId: Number(row.avatar_id),
    createdAt: row.created_at,
    refCode: row.ref_code,
    referredBy: row.referred_by ?? undefined,
    // The UI models three states; a rejected review reads as "not verified".
    kycStatus: row.kyc_status === "rejected" ? "none" : row.kyc_status,
    twoFactorEnabled: row.two_factor_enabled,
    xp: Number(row.xp),
  };
}

export async function loadProfile(id: string): Promise<ProfileRow | null> {
  const { data } = await getSupabaseBrowserClient()
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ?? null;
}

/** Current user id, for services that scope their queries per user. */
export async function currentUserId(): Promise<string | null> {
  const { data } = await getSupabaseBrowserClient().auth.getSession();
  return data.session?.user.id ?? null;
}

/**
 * A Session needs the profile row, which the signup trigger writes just after
 * auth.users. `retries` covers that window; normal reads pass 0.
 */
async function buildSession(token: string, userId: string, retries = 0): Promise<Session | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const profile = await loadProfile(userId);
    if (profile) return { token, user: toUserProfile(profile) };
    if (attempt < retries) await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return null;
}

export function createAuthService(): AuthService {
  const supabase = getSupabaseBrowserClient();

  return {
    async getSession() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return null;
      return buildSession(data.session.access_token, data.session.user.id);
    },

    async register({ email, password, nickname, refCode }): Promise<Result<Session>> {
      try {
        // The DB trigger builds the profile and zeroed balances from this
        // metadata — the client never inserts into `profiles` itself.
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              nickname: nickname?.trim() ?? "",
              ref_code: refCode?.trim().toUpperCase() ?? "",
            },
          },
        });
        if (error) return fail(errorCode(error));
        if (!data.session || !data.user) return fail("auth/email-not-confirmed");

        const session = await buildSession(data.session.access_token, data.user.id, 3);
        return session ? ok(session) : fail("unknown");
      } catch (error) {
        return fail(errorCode(error));
      }
    },

    async login({ email, password }): Promise<Result<Session>> {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) return fail(errorCode(error));
        if (!data.session) return fail("auth/invalid-credentials");

        const session = await buildSession(data.session.access_token, data.session.user.id, 1);
        return session ? ok(session) : fail("auth/not-authenticated");
      } catch (error) {
        return fail(errorCode(error));
      }
    },

    async logout() {
      await supabase.auth.signOut();
    },

    async updateProfile(patch): Promise<Result<UserProfile>> {
      const uid = await currentUserId();
      if (!uid) return fail("auth/not-authenticated");

      const update: ProfileUpdate = {};
      if (patch.nickname !== undefined) update.nickname = patch.nickname.trim();
      if (patch.avatarId !== undefined) update.avatar_id = patch.avatarId;
      if (patch.twoFactorEnabled !== undefined) update.two_factor_enabled = patch.twoFactorEnabled;

      // kyc_status, role, status and player_id are pinned by the profiles RLS
      // WITH CHECK clause: only staff may move them, through admin_set_kyc_status.
      if (Object.keys(update).length === 0) {
        if (patch.kycStatus !== undefined) return fail("kyc/staff-only");
        const profile = await loadProfile(uid);
        return profile ? ok(toUserProfile(profile)) : fail("auth/not-authenticated");
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .update(update)
          .eq("id", uid)
          .select("*")
          .single();
        if (error) return fail(errorCode(error));
        return ok(toUserProfile(data));
      } catch (error) {
        return fail(errorCode(error));
      }
    },

    async changePassword(current, next): Promise<Result<void>> {
      if (current === next) return fail("auth/password-unchanged");
      try {
        const { data: userData } = await supabase.auth.getUser();
        const email = userData.user?.email;
        if (!email) return fail("auth/not-authenticated");

        // GoTrue has no "verify password" endpoint; a sign-in with the current
        // password is the supported way to prove the user knows it.
        const verify = await supabase.auth.signInWithPassword({ email, password: current });
        if (verify.error) return fail("auth/wrong-password");

        const { error } = await supabase.auth.updateUser({ password: next });
        if (error) return fail(errorCode(error));
        return ok(undefined);
      } catch (error) {
        return fail(errorCode(error));
      }
    },

    onAuthChange(cb) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        // Supabase holds an internal lock while this callback runs, so calling
        // the client from inside it deadlocks. Defer, then load the profile
        // before emitting so subscribers never see a session without a user.
        setTimeout(() => {
          if (!session) {
            cb(null);
            return;
          }
          void buildSession(session.access_token, session.user.id).then(cb);
        }, 0);
      });
      return () => data.subscription.unsubscribe();
    },
  };
}
