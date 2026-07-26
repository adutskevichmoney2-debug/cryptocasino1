import type { Balance, Coin, Transaction } from "../types";
import { COINS } from "./fixtures/coins";
import { dbKeys, dbRead, dbWrite } from "./db";
import { balanceBus, txBus } from "./bus";

/** Balance/transaction primitives shared by wallet, sports and bonus mocks. */

export const EMPTY_BALANCES: Balance[] = COINS.map((c) => ({ coin: c.coin, amount: 0 }));

export function readBalances(uid: string): Balance[] {
  const stored = dbRead<Balance[]>(dbKeys.wallet(uid), EMPTY_BALANCES);
  return COINS.map((c) => stored.find((b) => b.coin === c.coin) ?? { coin: c.coin, amount: 0 });
}

export function writeBalances(uid: string, balances: Balance[]): void {
  dbWrite(dbKeys.wallet(uid), balances);
  balanceBus.emit(balances);
}

export function credit(uid: string, coin: Coin, delta: number): Balance[] {
  const balances = readBalances(uid).map((b) =>
    b.coin === coin ? { ...b, amount: Math.max(0, b.amount + delta) } : b,
  );
  writeBalances(uid, balances);
  return balances;
}

export function readTransactions(uid: string): Transaction[] {
  return dbRead<Transaction[]>(dbKeys.transactions(uid), []);
}

export function writeTransactions(uid: string, txs: Transaction[]): void {
  dbWrite(dbKeys.transactions(uid), txs);
}

export function addTransaction(uid: string, tx: Transaction): void {
  writeTransactions(uid, [tx, ...readTransactions(uid)]);
  txBus.emit(tx);
}
