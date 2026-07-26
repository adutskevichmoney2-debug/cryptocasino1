import type {
  Balance,
  Coin,
  CoinMeta,
  Network,
  Paginated,
  Result,
  Transaction,
  TxType,
  WalletService,
} from "../types";
import { fail, ok } from "../types";
import { COINS, NETWORK_CONFIRM_MIN, RATES, WITHDRAW_FEES } from "./fixtures/coins";
import { currentUserId } from "./auth.mock";
import { dbKeys, dbRead, dbWrite, makeId } from "./db";
import { delay, Emitter } from "./latency";
import { generateAddress, isValidAddress } from "@/lib/address";

const EMPTY_BALANCES: Balance[] = COINS.map((c) => ({ coin: c.coin, amount: 0 }));

/** Pending deposits/withdrawals settle after this long, mimicking confirmations. */
const CONFIRM_DELAY_MS = 35_000;

export function createWalletService(): WalletService {
  const balanceEmitter = new Emitter<Balance[]>();
  const txEmitter = new Emitter<Transaction>();
  const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();

  const readBalances = (uid: string): Balance[] => {
    const stored = dbRead<Balance[]>(dbKeys.wallet(uid), EMPTY_BALANCES);
    // Keep the shape in sync if the coin list grows between sessions
    return COINS.map((c) => stored.find((b) => b.coin === c.coin) ?? { coin: c.coin, amount: 0 });
  };

  const writeBalances = (uid: string, balances: Balance[]) => {
    dbWrite(dbKeys.wallet(uid), balances);
    balanceEmitter.emit(balances);
  };

  const readTx = (uid: string): Transaction[] => dbRead<Transaction[]>(dbKeys.transactions(uid), []);

  const writeTx = (uid: string, txs: Transaction[]) => dbWrite(dbKeys.transactions(uid), txs);

  const addTx = (uid: string, tx: Transaction) => {
    writeTx(uid, [tx, ...readTx(uid)]);
    txEmitter.emit(tx);
  };

  const credit = (uid: string, coin: Coin, delta: number): Balance[] => {
    const balances = readBalances(uid).map((b) =>
      b.coin === coin ? { ...b, amount: Math.max(0, b.amount + delta) } : b,
    );
    writeBalances(uid, balances);
    return balances;
  };

  /** Moves a pending transaction to confirmed and settles its balance effect. */
  const scheduleConfirmation = (uid: string, txId: string, onConfirm: () => void) => {
    const timer = setTimeout(() => {
      pendingTimers.delete(txId);
      const txs = readTx(uid);
      const index = txs.findIndex((t) => t.id === txId);
      if (index === -1 || txs[index].status !== "pending") return;
      const confirmed: Transaction = { ...txs[index], status: "confirmed" };
      txs[index] = confirmed;
      writeTx(uid, txs);
      onConfirm();
      txEmitter.emit(confirmed);
    }, CONFIRM_DELAY_MS);
    pendingTimers.set(txId, timer);
  };

  return {
    async getCoins(): Promise<CoinMeta[]> {
      return COINS;
    },

    async getBalances() {
      await delay(120, 300);
      const uid = currentUserId();
      return uid ? readBalances(uid) : EMPTY_BALANCES;
    },

    async getRates() {
      await delay(80, 200);
      return RATES;
    },

    async getDepositAddress(coin, network) {
      await delay(300, 700);
      const uid = currentUserId() ?? "guest";
      const meta = COINS.find((c) => c.coin === coin)!;
      return {
        address: generateAddress(`${uid}:${coin}`, network),
        minDeposit: meta.minDeposit,
      };
    },

    async simulateDeposit(coin, amount): Promise<Result<Transaction>> {
      await delay(400, 800);
      const uid = currentUserId();
      if (!uid) return fail("auth/not-authenticated");
      if (!Number.isFinite(amount) || amount <= 0) return fail("wallet/invalid-amount");

      const tx: Transaction = {
        id: makeId("tx"),
        type: "deposit",
        coin,
        amount,
        status: "confirmed",
        createdAt: new Date().toISOString(),
        demo: true,
      };
      credit(uid, coin, amount);
      addTx(uid, tx);
      return ok(tx);
    },

    async getWithdrawFee(coin, network) {
      return WITHDRAW_FEES[coin][network] ?? 0;
    },

    async requestWithdraw({ coin, network, address, amount }): Promise<Result<Transaction>> {
      await delay(500, 900);
      const uid = currentUserId();
      if (!uid) return fail("auth/not-authenticated");

      const meta = COINS.find((c) => c.coin === coin);
      if (!meta || !meta.networks.includes(network)) return fail("wallet/network-unsupported");
      if (!isValidAddress(address, network)) return fail("wallet/invalid-address");
      if (!Number.isFinite(amount) || amount <= 0) return fail("wallet/invalid-amount");
      if (amount < meta.minWithdraw) {
        return fail("wallet/below-minimum", { amount: meta.minWithdraw, coin });
      }

      const fee = WITHDRAW_FEES[coin][network] ?? 0;
      const balance = readBalances(uid).find((b) => b.coin === coin)?.amount ?? 0;
      if (amount + fee > balance) return fail("wallet/insufficient-funds");

      const tx: Transaction = {
        id: makeId("tx"),
        type: "withdraw",
        coin,
        amount,
        fee,
        network,
        address,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      // Funds leave the balance immediately; the transaction confirms later
      credit(uid, coin, -(amount + fee));
      addTx(uid, tx);
      scheduleConfirmation(uid, tx.id, () => {});
      return ok(tx);
    },

    async getTransactions(filter): Promise<Paginated<Transaction>> {
      await delay(200, 450);
      const uid = currentUserId();
      const all = uid ? readTx(uid) : [];
      const filtered = filter?.type ? all.filter((t) => t.type === filter.type) : all;
      const page = filter?.page ?? 1;
      const pageSize = filter?.pageSize ?? 20;
      return {
        items: filtered.slice((page - 1) * pageSize, page * pageSize),
        total: filtered.length,
        page,
        pageSize,
      };
    },

    async applyDelta({ coin, amount, type, note }): Promise<Result<Balance>> {
      const uid = currentUserId();
      if (!uid) return fail("auth/not-authenticated");

      const balance = readBalances(uid).find((b) => b.coin === coin)?.amount ?? 0;
      if (amount < 0 && balance + amount < 0) return fail("wallet/insufficient-funds");

      const balances = credit(uid, coin, amount);
      addTx(uid, {
        id: makeId("tx"),
        type,
        coin,
        amount: Math.abs(amount),
        status: "confirmed",
        createdAt: new Date().toISOString(),
        note,
      });
      return ok(balances.find((b) => b.coin === coin)!);
    },

    onBalanceChange(cb) {
      return balanceEmitter.subscribe(cb);
    },

    onTransactionUpdate(cb) {
      return txEmitter.subscribe(cb);
    },
  };
}

export { NETWORK_CONFIRM_MIN };
export type { Network };
