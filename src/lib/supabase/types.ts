/**
 * Database types mirroring supabase/migrations. Regenerate after schema changes:
 *   npx supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts
 *
 * Declared with `type`, not `interface`: supabase-js requires each row to be
 * assignable to Record<string, unknown>, and interfaces get no implicit index
 * signature. Using `interface` here silently degrades every query to `never`.
 */

export type UserRole = "player" | "support" | "admin";
export type AccountStatus = "active" | "frozen" | "self_excluded" | "banned";
export type KycStatus = "none" | "pending" | "verified" | "rejected";
export type DbCoin = "BTC" | "ETH" | "USDT" | "USDC" | "TRX" | "SOL" | "LTC" | "DOGE";
export type DbNetwork = "BTC" | "ERC20" | "TRC20" | "BEP20" | "SOL" | "LTC" | "DOGE";
export type DbTxType =
  | "deposit"
  | "withdraw"
  | "bet"
  | "win"
  | "bonus"
  | "adjustment"
  | "rollback";
export type DbTxStatus = "pending" | "processing" | "confirmed" | "rejected" | "failed";
export type DbBetStatus = "open" | "won" | "lost" | "void" | "cashed_out";
export type TicketStatus = "open" | "pending" | "resolved" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "urgent";

export type ProfileRow = {
  id: string;
  player_id: number;
  email: string;
  nickname: string;
  avatar_id: number;
  role: UserRole;
  status: AccountStatus;
  kyc_status: KycStatus;
  two_factor_enabled: boolean;
  xp: number;
  wagered_total: string;
  ref_code: string;
  referred_by: string | null;
  internal_note: string | null;
  status_reason: string | null;
  status_changed_at: string | null;
  status_changed_by: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BalanceRow = {
  user_id: string;
  coin: DbCoin;
  amount: string;
  updated_at: string;
};

export type TransactionRow = {
  id: string;
  user_id: string;
  type: DbTxType;
  coin: DbCoin;
  amount: string;
  fee: string;
  status: DbTxStatus;
  network: DbNetwork | null;
  address: string | null;
  tx_hash: string | null;
  balance_after: string | null;
  note: string | null;
  actor_id: string | null;
  reference_id: string | null;
  created_at: string;
  settled_at: string | null;
};

export type DepositAddressRow = {
  id: string;
  user_id: string;
  coin: DbCoin;
  network: DbNetwork;
  address: string;
  memo: string | null;
  created_at: string;
};

export type BetRow = {
  id: string;
  user_id: string;
  bet_type: "single" | "combo";
  selections: unknown;
  stake: string;
  coin: DbCoin;
  total_odds: string;
  potential_win: string;
  payout: string | null;
  status: DbBetStatus;
  created_at: string;
  settled_at: string | null;
};

export type GameRoundRow = {
  id: string;
  user_id: string;
  game_slug: string;
  provider: string | null;
  coin: DbCoin;
  bet_amount: string;
  win_amount: string;
  created_at: string;
};

export type FavoriteRow = {
  user_id: string;
  game_id: string;
  created_at: string;
};

export type RecentGameRow = {
  user_id: string;
  game_id: string;
  played_at: string;
};

export type PromoCodeRow = {
  code: string;
  label_key: string;
  amount: string;
  coin: DbCoin;
  wager_multiplier: string;
  valid_days: number;
  max_claims: number | null;
  claims_count: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
};

export type UserBonusRow = {
  id: string;
  user_id: string;
  code: string;
  label_key: string;
  amount: string;
  coin: DbCoin;
  wager_required: string;
  wager_done: string;
  claimed_at: string;
  expires_at: string;
};

export type SupportTicketRow = {
  id: string;
  user_id: string;
  subject: string;
  topic: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
};

export type SupportMessageRow = {
  id: string;
  ticket_id: string;
  sender_id: string | null;
  is_staff: boolean;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type NotificationRow = {
  id: string;
  user_id: string;
  key: string;
  values: Record<string, string | number> | null;
  href: string | null;
  read: boolean;
  created_at: string;
};

export type UserSessionRow = {
  id: string;
  user_id: string;
  ip: string | null;
  user_agent: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
  is_current: boolean;
  created_at: string;
  last_seen_at: string;
  revoked_at: string | null;
};

export type AdminActionRow = {
  id: string;
  actor_id: string;
  target_user: string | null;
  action: string;
  details: Record<string, unknown> | null;
  ip: string | null;
  created_at: string;
};

/**
 * Reference prices refreshed by /api/rates with the service role. Read-only for
 * everyone else — the table has a select policy and no write policy.
 */
export type ExchangeRateRow = {
  coin: DbCoin;
  usd_price: string;
  updated_at: string;
};

/** usd_price goes over the wire as a JSON number; it comes back as a string. */
export type ExchangeRateInsert = {
  coin: DbCoin;
  usd_price: number;
  updated_at?: string;
};

/** One row of public.leaderboard(p_period). `wagered` is a numeric — a string. */
export type LeaderboardRow = {
  rank: number;
  nickname: string;
  wagered: string;
  is_current_user: boolean;
};

/** public.referral_stats() returns a single row for the calling user. */
export type ReferralStatsRow = {
  code: string;
  signups: number;
  active_signups: number;
};

export type AdminDashboardStats = {
  players: number;
  playersToday: number;
  online: number;
  pendingTx: number;
  openTickets: number;
  betsToday: number;
  wageredToday: number;
  depositsToday: number;
  withdrawalsToday: number;
};

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow>;
      balances: Table<BalanceRow>;
      transactions: Table<TransactionRow>;
      deposit_addresses: Table<DepositAddressRow>;
      bets: Table<BetRow>;
      game_rounds: Table<GameRoundRow>;
      favorites: Table<FavoriteRow>;
      recent_games: Table<RecentGameRow>;
      promo_codes: Table<PromoCodeRow>;
      user_bonuses: Table<UserBonusRow>;
      support_tickets: Table<SupportTicketRow>;
      support_messages: Table<SupportMessageRow>;
      notifications: Table<NotificationRow>;
      user_sessions: Table<UserSessionRow>;
      admin_actions: Table<AdminActionRow>;
      exchange_rates: Table<ExchangeRateRow, ExchangeRateInsert, Partial<ExchangeRateInsert>>;
    };
    Views: Record<string, never>;
    Functions: {
      get_deposit_address: {
        Args: { p_coin: DbCoin; p_network: DbNetwork };
        Returns: DepositAddressRow;
      };
      request_withdrawal: {
        Args: {
          p_coin: DbCoin;
          p_network: DbNetwork;
          p_address: string;
          p_amount: number;
          p_fee: number;
        };
        Returns: TransactionRow;
      };
      credit_demo_funds: {
        Args: { p_coin: DbCoin; p_amount: number };
        Returns: TransactionRow;
      };
      place_bet: {
        Args: { p_selections: unknown; p_stake: number; p_coin: DbCoin; p_type: string };
        Returns: BetRow;
      };
      settle_bet: { Args: { p_bet_id: string; p_won: boolean }; Returns: BetRow };
      /** Settles the caller's own due bets; the outcome is decided in SQL. */
      settle_due_bets: { Args: Record<string, never>; Returns: number };
      record_game_round: {
        Args: {
          p_game_slug: string;
          p_provider: string | null;
          p_coin: DbCoin;
          p_bet: number;
          p_win: number;
        };
        Returns: GameRoundRow;
      };
      claim_promo_code: { Args: { p_code: string }; Returns: UserBonusRow };
      /** Wager race, ranked across every player. Set-returning: capped at 20 rows. */
      leaderboard: { Args: { p_period: string }; Returns: LeaderboardRow[] };
      /** Referral counters for the caller. Set-returning: exactly one row. */
      referral_stats: { Args: Record<string, never>; Returns: ReferralStatsRow[] };
      record_session: {
        Args: {
          p_ip: string;
          p_user_agent: string;
          p_device_type: string;
          p_browser: string;
          p_os: string;
          p_country: string | null;
          p_city: string | null;
        };
        Returns: string;
      };
      admin_adjust_balance: {
        Args: { p_user_id: string; p_coin: DbCoin; p_amount: number; p_note: string | null };
        Returns: TransactionRow;
      };
      admin_review_transaction: {
        Args: { p_tx_id: string; p_approve: boolean; p_note: string | null };
        Returns: TransactionRow;
      };
      admin_set_account_status: {
        Args: { p_user_id: string; p_status: AccountStatus; p_reason: string | null };
        Returns: ProfileRow;
      };
      admin_set_kyc_status: {
        Args: { p_user_id: string; p_status: KycStatus; p_reason: string | null };
        Returns: ProfileRow;
      };
      admin_set_role: { Args: { p_user_id: string; p_role: UserRole }; Returns: ProfileRow };
      admin_set_player_id: {
        Args: { p_user_id: string; p_player_id: number };
        Returns: ProfileRow;
      };
      admin_add_note: { Args: { p_user_id: string; p_note: string }; Returns: ProfileRow };
      admin_dashboard_stats: { Args: Record<string, never>; Returns: AdminDashboardStats };
      is_staff: { Args: Record<string, never>; Returns: boolean };
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      user_role: UserRole;
      account_status: AccountStatus;
      kyc_status: KycStatus;
      coin: DbCoin;
      network: DbNetwork;
      tx_type: DbTxType;
      tx_status: DbTxStatus;
      bet_status: DbBetStatus;
      ticket_status: TicketStatus;
      ticket_priority: TicketPriority;
    };
    CompositeTypes: Record<string, never>;
  };
};
