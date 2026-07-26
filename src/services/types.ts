/**
 * Service layer contract. Every piece of "backend" data the UI consumes is
 * described here. The mock implementation in ./mock is swappable for a
 * Supabase one without touching components or stores — see ./README.md.
 */

/* ── Result & shared shapes ───────────────────────────────────────────── */

export interface ServiceError {
  /** Stable machine code; rendered through i18n as t(`errors.${code}`). */
  code: string;
  /** Optional interpolation values for the translated message. */
  values?: Record<string, string | number>;
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: ServiceError };

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const fail = <T = never>(code: string, values?: Record<string, string | number>): Result<T> => ({
  ok: false,
  error: { code, values },
});

export type Unsubscribe = () => void;

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/* ── Auth ─────────────────────────────────────────────────────────────── */

export interface UserProfile {
  id: string;
  /** Public numeric player id, e.g. "48291736". */
  playerId: string;
  email: string;
  nickname: string;
  avatarId: number;
  createdAt: string;
  refCode: string;
  referredBy?: string;
  kycStatus: "none" | "pending" | "verified";
  twoFactorEnabled: boolean;
  xp: number;
}

export interface Session {
  token: string;
  user: UserProfile;
}

export interface AuthService {
  getSession(): Promise<Session | null>;
  register(input: {
    email: string;
    password: string;
    nickname?: string;
    refCode?: string;
  }): Promise<Result<Session>>;
  login(input: { email: string; password: string }): Promise<Result<Session>>;
  logout(): Promise<void>;
  updateProfile(patch: Partial<Pick<UserProfile, "nickname" | "avatarId" | "kycStatus" | "twoFactorEnabled">>): Promise<Result<UserProfile>>;
  changePassword(current: string, next: string): Promise<Result<void>>;
  onAuthChange(cb: (session: Session | null) => void): Unsubscribe;
}

/* ── Wallet ───────────────────────────────────────────────────────────── */

export type Coin = "BTC" | "ETH" | "USDT" | "USDC" | "TRX" | "SOL" | "LTC" | "DOGE";
export type Network = "BTC" | "ERC20" | "TRC20" | "BEP20" | "SOL" | "LTC" | "DOGE";

export interface CoinMeta {
  coin: Coin;
  name: string;
  networks: Network[];
  decimals: number;
  minDeposit: number;
  minWithdraw: number;
}

export interface Balance {
  coin: Coin;
  amount: number;
}

export type TxType = "deposit" | "withdraw" | "bet" | "win" | "bonus";
export type TxStatus = "pending" | "confirmed" | "failed";

export interface Transaction {
  id: string;
  type: TxType;
  coin: Coin;
  amount: number;
  fee?: number;
  network?: Network;
  address?: string;
  status: TxStatus;
  createdAt: string;
  /** Marks funds credited by the demo button rather than a real chain deposit. */
  demo?: boolean;
  note?: string;
}

export interface WalletService {
  getCoins(): Promise<CoinMeta[]>;
  getBalances(): Promise<Balance[]>;
  getRates(): Promise<Record<Coin, number>>;
  getDepositAddress(
    coin: Coin,
    network: Network,
  ): Promise<{ address: string; minDeposit: number; memo?: string }>;
  /** Credits demo funds — the portfolio stand-in for an on-chain deposit. */
  simulateDeposit(coin: Coin, amount: number): Promise<Result<Transaction>>;
  getWithdrawFee(coin: Coin, network: Network): Promise<number>;
  requestWithdraw(input: {
    coin: Coin;
    network: Network;
    address: string;
    amount: number;
  }): Promise<Result<Transaction>>;
  getTransactions(filter?: { type?: TxType; page?: number; pageSize?: number }): Promise<Paginated<Transaction>>;
  /** Internal debit/credit used by betting and bonuses. */
  applyDelta(input: { coin: Coin; amount: number; type: TxType; note?: string }): Promise<Result<Balance>>;
  onBalanceChange(cb: (balances: Balance[]) => void): Unsubscribe;
  onTransactionUpdate(cb: (tx: Transaction) => void): Unsubscribe;
}

/* ── Casino games ─────────────────────────────────────────────────────── */

export interface Provider {
  id: string;
  name: string;
  gameCount: number;
}

export interface GameCategoryInfo {
  slug: string;
  count: number;
}

export interface Game {
  id: string;
  slug: string;
  title: string;
  provider: string;
  providerName: string;
  categories: string[];
  rtp: number;
  volatility: "low" | "medium" | "high";
  isNew: boolean;
  popularity: number;
  /**
   * INTEGRATION POINT: a licensed provider returns a launch URL here; the game
   * page renders it in an iframe. Null in this demo build.
   */
  launchUrl: string | null;
}

export interface GamesService {
  getGames(query?: {
    category?: string;
    providers?: string[];
    search?: string;
    sort?: "popular" | "new" | "az";
    page?: number;
    pageSize?: number;
  }): Promise<Paginated<Game>>;
  getGameBySlug(slug: string): Promise<Game | null>;
  getGamesByIds(ids: string[]): Promise<Game[]>;
  getCategories(): Promise<GameCategoryInfo[]>;
  getProviders(): Promise<Provider[]>;
  getFavorites(): Promise<string[]>;
  toggleFavorite(gameId: string): Promise<boolean>;
  getRecentlyPlayed(): Promise<Game[]>;
  trackGameOpen(gameId: string): Promise<void>;
}

/* ── Sports ───────────────────────────────────────────────────────────── */

export interface Sport {
  slug: string;
  liveCount: number;
  upcomingCount: number;
}

export interface Outcome {
  id: string;
  /** Translation key inside the `sports.outcomes` namespace, or a literal team name. */
  label: string;
  odds: number;
  locked?: boolean;
}

export interface Market {
  id: string;
  /** Translation key inside the `sports.markets` namespace. */
  key: string;
  outcomes: Outcome[];
}

export interface SportEvent {
  id: string;
  sport: string;
  league: string;
  home: string;
  away: string;
  startsAt: string;
  isLive: boolean;
  score?: { home: number; away: number };
  /** Minutes elapsed, live events only. */
  minute?: number;
  mainMarket: Market;
  marketCount: number;
}

export interface SportEventDetail extends SportEvent {
  markets: Market[];
}

export interface BetSelection {
  eventId: string;
  marketId: string;
  outcomeId: string;
  eventLabel: string;
  marketKey: string;
  outcomeLabel: string;
  odds: number;
}

export type BetStatus = "open" | "won" | "lost" | "void";

export interface Bet {
  id: string;
  type: "single" | "combo";
  selections: BetSelection[];
  stake: number;
  coin: Coin;
  totalOdds: number;
  potentialWin: number;
  status: BetStatus;
  createdAt: string;
  settledAt?: string;
}

export interface OddsUpdate {
  eventId: string;
  outcomeId: string;
  odds: number;
  direction: "up" | "down";
}

export interface SportsService {
  getSports(): Promise<Sport[]>;
  getEvents(query?: { sport?: string; live?: boolean; top?: boolean; limit?: number }): Promise<SportEvent[]>;
  getEventById(id: string): Promise<SportEventDetail | null>;
  placeBet(input: {
    selections: BetSelection[];
    stake: number;
    coin: Coin;
    type: "single" | "combo";
  }): Promise<Result<Bet>>;
  getMyBets(filter?: { status?: "open" | "settled"; page?: number; pageSize?: number }): Promise<Paginated<Bet>>;
  subscribeOdds(eventIds: string[], cb: (updates: OddsUpdate[]) => void): Unsubscribe;
}

/* ── Bonuses & VIP ────────────────────────────────────────────────────── */

export interface Promotion {
  slug: string;
  /** Translation key inside `promotions.items`. */
  key: string;
  kind: "welcome" | "reload" | "cashback" | "freespins" | "sport";
  badgeKey?: string;
  accent: string;
}

export interface UserBonus {
  id: string;
  code: string;
  key: string;
  amount: number;
  coin: Coin;
  wagerRequired: number;
  wagerDone: number;
  claimedAt: string;
  expiresAt: string;
}

export interface VipLevel {
  level: number;
  key: string;
  xpRequired: number;
  cashbackPct: number;
}

export interface VipStatus {
  level: VipLevel;
  next: VipLevel | null;
  xp: number;
  progressPct: number;
}

export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  wagered: number;
  prize: number;
  isCurrentUser?: boolean;
}

export interface ReferralInfo {
  code: string;
  link: string;
  clicks: number;
  signups: number;
  earnings: number;
  coin: Coin;
}

export interface BonusService {
  getPromotions(): Promise<Promotion[]>;
  getPromotionBySlug(slug: string): Promise<Promotion | null>;
  getActiveBonuses(): Promise<UserBonus[]>;
  claimPromoCode(code: string): Promise<Result<UserBonus>>;
  getVipLevels(): Promise<VipLevel[]>;
  getVipStatus(): Promise<VipStatus>;
  getLeaderboard(period: "daily" | "weekly"): Promise<LeaderboardEntry[]>;
  getReferralInfo(): Promise<ReferralInfo>;
}

/* ── Support ──────────────────────────────────────────────────────────── */

export interface HelpArticle {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  body: string[];
}

export interface ChatMessage {
  id: string;
  from: "user" | "bot";
  text: string;
  createdAt: string;
}

export interface SupportService {
  getArticles(locale: string): Promise<HelpArticle[]>;
  getArticleBySlug(locale: string, slug: string): Promise<HelpArticle | null>;
  searchArticles(locale: string, query: string): Promise<HelpArticle[]>;
  getChatHistory(): Promise<ChatMessage[]>;
  sendChatMessage(locale: string, text: string): Promise<ChatMessage>;
  submitContactForm(input: { email: string; topic: string; message: string }): Promise<Result<void>>;
}

/* ── Notifications ────────────────────────────────────────────────────── */

export interface AppNotification {
  id: string;
  /** Translation key inside `notifications.items`. */
  key: string;
  values?: Record<string, string | number>;
  createdAt: string;
  read: boolean;
  href?: string;
}

export interface NotificationsService {
  getAll(): Promise<AppNotification[]>;
  push(input: { key: string; values?: Record<string, string | number>; href?: string }): Promise<AppNotification>;
  markRead(ids: string[]): Promise<void>;
  markAllRead(): Promise<void>;
  onNotification(cb: (n: AppNotification) => void): Unsubscribe;
}

/* ── Root ─────────────────────────────────────────────────────────────── */

export interface Services {
  auth: AuthService;
  wallet: WalletService;
  games: GamesService;
  sports: SportsService;
  bonus: BonusService;
  support: SupportService;
  notifications: NotificationsService;
}
