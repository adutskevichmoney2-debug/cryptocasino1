import type {
  Balance,
  CoinMeta,
  Paginated,
  Result,
  Transaction,
  TxStatus,
  TxType,
  WalletService,
} from "../types";
import { fail, ok } from "../types";
import { COINS, RATES, WITHDRAW_FEES } from "../mock/fixtures/coins";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { DbTxStatus, DbTxType, TransactionRow } from "@/lib/supabase/types";
import { generateAddress, isValidAddress } from "@/lib/address";
import { currentUserId } from "./auth.supabase";
import { errorCode, failFrom } from "./errors";
import { subscribeWithUser } from "./realtime";

const emptyBalances = (): Balance[] => COINS.map((c) => ({ coin: c.coin, amount: 0 }));

/**
 * The ledger carries two operator-only movement types the UI has no icon for:
 * an adjustment reads as a bonus credit, a rollback as funds coming back in.
 */
const TX_TYPE_FROM_DB: Record<DbTxType, TxType> = {
  deposit: "deposit",
  withdraw: "withdraw",
  bet: "bet",
  win: "win",
  bonus: "bonus",
  adjustment: "bonus",
  rollback: "deposit",
};

const TX_TYPE_TO_DB: Record<TxType, DbTxType[]> = {
  deposit: ["deposit", "rollback"],
  withdraw: ["withdraw"],
  bet: ["bet"],
  win: ["win"],
  bonus: ["bonus", "adjustment"],
};

const TX_STATUS_FROM_DB: Record<DbTxStatus, TxStatus> = {
  pending: "pending",
  processing: "pending",
  confirmed: "confirmed",
  rejected: "failed",
  failed: "failed",
};

/** credit_demo_funds tags its rows with note = 'demo'. */
function toTransaction(row: TransactionRow): Transaction {
  const demo = row.note === "demo";
  const fee = Number(row.fee);
  return {
    id: row.id,
    type: TX_TYPE_FROM_DB[row.type],
    coin: row.coin,
    amount: Number(row.amount),
    fee: fee > 0 ? fee : undefined,
    network: row.network ?? undefined,
    address: row.address ?? undefined,
    status: TX_STATUS_FROM_DB[row.status],
    createdAt: row.created_at,
    demo: demo || undefined,
    note: demo ? undefined : row.note ?? undefined,
  };
}

export function createWalletService(): WalletService {
  const supabase = getSupabaseBrowserClient();

  const readBalances = async (uid: string): Promise<Balance[]> => {
    const { data } = await supabase.from("balances").select("coin, amount").eq("user_id", uid);
    const stored = new Map((data ?? []).map((row) => [row.coin, Number(row.amount)]));
    return COINS.map((c) => ({ coin: c.coin, amount: stored.get(c.coin) ?? 0 }));
  };

  return {
    async getCoins(): Promise<CoinMeta[]> {
      return COINS;
    },

    async getBalances() {
      const uid = await currentUserId();
      if (!uid) return emptyBalances();
      return readBalances(uid);
    },

    async getRates() {
      // INTEGRATION POINT: a real build polls a price feed here.
      return RATES;
    },

    async getDepositAddress(coin, network) {
      const meta = COINS.find((c) => c.coin === coin)!;
      const { data, error } = await supabase.rpc("get_deposit_address", {
        p_coin: coin,
        p_network: network,
      });

      // This method cannot report failure through its signature; falling back to
      // the deterministic placeholder keeps the deposit panel renderable.
      if (error || !data) {
        const uid = (await currentUserId()) ?? "guest";
        return { address: generateAddress(`${uid}:${coin}`, network), minDeposit: meta.minDeposit };
      }

      return {
        address: data.address,
        minDeposit: meta.minDeposit,
        memo: data.memo ?? undefined,
      };
    },

    async simulateDeposit(coin, amount): Promise<Result<Transaction>> {
      if (!Number.isFinite(amount) || amount <= 0) return fail("wallet/invalid-amount");
      try {
        const { data, error } = await supabase.rpc("credit_demo_funds", {
          p_coin: coin,
          p_amount: amount,
        });
        if (error || !data) return fail(errorCode(error));
        return ok(toTransaction(data));
      } catch (error) {
        return failFrom(error);
      }
    },

    async getWithdrawFee(coin, network) {
      return WITHDRAW_FEES[coin][network] ?? 0;
    },

    async requestWithdraw({ coin, network, address, amount }): Promise<Result<Transaction>> {
      const meta = COINS.find((c) => c.coin === coin);
      if (!meta || !meta.networks.includes(network)) return fail("wallet/network-unsupported");
      // Address shape is checked client-side: the RPC only rejects empty strings.
      if (!isValidAddress(address, network)) return fail("wallet/invalid-address");
      if (!Number.isFinite(amount) || amount <= 0) return fail("wallet/invalid-amount");
      if (amount < meta.minWithdraw) {
        return fail("wallet/below-minimum", { amount: meta.minWithdraw, coin });
      }

      try {
        const { data, error } = await supabase.rpc("request_withdrawal", {
          p_coin: coin,
          p_network: network,
          p_address: address.trim(),
          p_amount: amount,
          p_fee: WITHDRAW_FEES[coin][network] ?? 0,
        });
        if (error || !data) return fail(errorCode(error));
        return ok(toTransaction(data));
      } catch (error) {
        return failFrom(error);
      }
    },

    async getTransactions(filter): Promise<Paginated<Transaction>> {
      const page = filter?.page ?? 1;
      const pageSize = filter?.pageSize ?? 20;
      const uid = await currentUserId();
      if (!uid) return { items: [], total: 0, page, pageSize };

      let query = supabase
        .from("transactions")
        .select("*", { count: "exact" })
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      if (filter?.type) query = query.in("type", TX_TYPE_TO_DB[filter.type]);

      const { data, count } = await query.range((page - 1) * pageSize, page * pageSize - 1);
      return {
        items: (data ?? []).map(toTransaction),
        total: count ?? 0,
        page,
        pageSize,
      };
    },

    /**
     * Casino play: one round in, balance out. `note` carries the game slug,
     * which record_game_round requires — without it there is no round to write,
     * so the call degrades to a balance check. That is the sportsbook's path:
     * place_bet moves the stake itself, and the betslip's pre-debit here must
     * not double-charge it.
     */
    async applyDelta({ coin, amount, type, note }): Promise<Result<Balance>> {
      const uid = await currentUserId();
      if (!uid) return fail("auth/not-authenticated");

      const balances = await readBalances(uid);
      const current = balances.find((b) => b.coin === coin)?.amount ?? 0;
      if (amount < 0 && current + amount < 0) return fail("wallet/insufficient-funds");
      if (!note) return ok({ coin, amount: current });

      try {
        const { error } = await supabase.rpc("record_game_round", {
          p_game_slug: note,
          p_provider: null,
          p_coin: coin,
          p_bet: type === "bet" || amount < 0 ? Math.abs(amount) : 0,
          p_win: type !== "bet" && amount > 0 ? amount : 0,
        });
        if (error) return fail(errorCode(error));

        const updated = await readBalances(uid);
        return ok(updated.find((b) => b.coin === coin) ?? { coin, amount: current });
      } catch (error) {
        return failFrom(error);
      }
    },

    onBalanceChange(cb) {
      return subscribeWithUser((uid) =>
        supabase
          .channel(`balances:${uid}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "balances", filter: `user_id=eq.${uid}` },
            () => {
              // The payload holds one coin; the store wants the whole wallet.
              void readBalances(uid).then(cb);
            },
          )
          .subscribe(),
      );
    },

    onTransactionUpdate(cb) {
      return subscribeWithUser((uid) =>
        supabase
          .channel(`transactions:${uid}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${uid}` },
            (payload) => {
              const row = payload.new as Partial<TransactionRow>;
              if (row.id) cb(toTransaction(row as TransactionRow));
            },
          )
          .subscribe(),
      );
    },
  };
}
