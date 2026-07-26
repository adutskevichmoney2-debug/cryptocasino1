import type { AuthService, Result, Session, UserProfile } from "../types";
import { fail, ok } from "../types";
import { dbKeys, dbRead, dbRemove, dbWrite, makeId } from "./db";
import { delay, Emitter } from "./latency";

interface StoredUser extends UserProfile {
  /** Demo only. A real backend never stores or sees a raw password. */
  passwordHash: string;
}

/** Not cryptography — just avoids putting plaintext into localStorage in a demo. */
function hash(password: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < password.length; i++) {
    h ^= password.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

function makeRefCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function nicknameFromEmail(email: string): string {
  const base = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
  return base.slice(0, 16) || "player";
}

const readUsers = () => dbRead<StoredUser[]>(dbKeys.users, []);
const writeUsers = (users: StoredUser[]) => dbWrite(dbKeys.users, users);

function toProfile(user: StoredUser): UserProfile {
  const { passwordHash, ...profile } = user;
  void passwordHash;
  return profile;
}

export function createAuthService(): AuthService {
  const emitter = new Emitter<Session | null>();

  const currentSession = (): Session | null => {
    const stored = dbRead<{ token: string; userId: string } | null>(dbKeys.session, null);
    if (!stored) return null;
    const user = readUsers().find((u) => u.id === stored.userId);
    return user ? { token: stored.token, user: toProfile(user) } : null;
  };

  const startSession = (user: StoredUser): Session => {
    const token = makeId("tok");
    dbWrite(dbKeys.session, { token, userId: user.id });
    const session = { token, user: toProfile(user) };
    emitter.emit(session);
    return session;
  };

  return {
    async getSession() {
      await delay(80, 200);
      return currentSession();
    },

    async register({ email, password, nickname, refCode }): Promise<Result<Session>> {
      await delay(400, 800);
      const normalized = email.trim().toLowerCase();
      const users = readUsers();

      if (users.some((u) => u.email === normalized)) return fail("auth/email-taken");
      if (nickname && users.some((u) => u.nickname.toLowerCase() === nickname.toLowerCase())) {
        return fail("auth/nickname-taken");
      }

      const user: StoredUser = {
        id: makeId("usr"),
        email: normalized,
        nickname: nickname?.trim() || nicknameFromEmail(normalized),
        avatarId: users.length % 12,
        createdAt: new Date().toISOString(),
        refCode: makeRefCode(),
        referredBy: refCode?.trim().toUpperCase() || undefined,
        kycStatus: "none",
        twoFactorEnabled: false,
        xp: 0,
        passwordHash: hash(password),
      };

      writeUsers([...users, user]);
      return ok(startSession(user));
    },

    async login({ email, password }): Promise<Result<Session>> {
      await delay(400, 800);
      const normalized = email.trim().toLowerCase();
      const user = readUsers().find((u) => u.email === normalized);
      if (!user || user.passwordHash !== hash(password)) {
        return fail("auth/invalid-credentials");
      }
      return ok(startSession(user));
    },

    async logout() {
      await delay(120, 260);
      dbRemove(dbKeys.session);
      emitter.emit(null);
    },

    async updateProfile(patch): Promise<Result<UserProfile>> {
      await delay(300, 600);
      const session = currentSession();
      if (!session) return fail("auth/not-authenticated");

      const users = readUsers();
      const index = users.findIndex((u) => u.id === session.user.id);
      if (index === -1) return fail("auth/not-authenticated");

      if (patch.nickname) {
        const taken = users.some(
          (u) => u.id !== session.user.id && u.nickname.toLowerCase() === patch.nickname!.toLowerCase(),
        );
        if (taken) return fail("auth/nickname-taken");
      }

      const updated: StoredUser = { ...users[index], ...patch };
      users[index] = updated;
      writeUsers(users);
      emitter.emit({ token: session.token, user: toProfile(updated) });
      return ok(toProfile(updated));
    },

    async changePassword(current, next): Promise<Result<void>> {
      await delay(400, 800);
      const session = currentSession();
      if (!session) return fail("auth/not-authenticated");

      const users = readUsers();
      const index = users.findIndex((u) => u.id === session.user.id);
      if (index === -1) return fail("auth/not-authenticated");
      if (users[index].passwordHash !== hash(current)) return fail("auth/wrong-password");
      if (current === next) return fail("auth/password-unchanged");

      users[index] = { ...users[index], passwordHash: hash(next) };
      writeUsers(users);
      return ok(undefined);
    },

    onAuthChange(cb) {
      return emitter.subscribe(cb);
    },
  };
}

/** Current user id, for services that key their data per user. */
export function currentUserId(): string | null {
  const stored = dbRead<{ userId: string } | null>(dbKeys.session, null);
  return stored?.userId ?? null;
}
