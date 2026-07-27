-- ============================================================================
-- 0008 — QA corrective SQL  (WRITTEN, NOT APPLIED)
-- ============================================================================
-- Produced by the pre-launch audit of the operator panel and database layer.
-- Every statement below is a fix for a defect found in migrations 0002–0004.
-- Read the notes on each section before running it: items 1 and 5 deliberately
-- change behaviour the current demo front-end depends on.
--
-- Numbered 0008 because a concurrent audit added 0007_server_side_odds.sql.
-- The two files do not overlap: 0007 rewrites place_bet only.
-- ----------------------------------------------------------------------------


-- ── 1. CRITICAL: settle_bet lets a player pay themselves ────────────────────
--
-- Defect (0003_functions.sql, settle_bet):
--   `if v_bet.user_id <> auth.uid() and not public.is_staff() then raise`
--   means the bet OWNER is an accepted caller. settle_bet is granted to
--   `authenticated`, so any signed-in player can run
--     rpc('settle_bet', { p_bet_id: <their own open bet>, p_won: true })
--   and apply_ledger credits `potential_win` with no further checks.
--
--   As shipped it also compounded with place_bet, which read odds straight out
--   of the client's p_selections JSON despite the "recomputed server-side"
--   comment: a slip with stake 1 and odds 99999999.9999 (the numeric(12,4)
--   ceiling) plus a self-settle minted ~1e8 units of any coin.
--   0007_server_side_odds.sql closes the odds half. This closes the other half:
--   without it a player still pays themselves the honest potential_win of every
--   open bet, i.e. wins 100% of them.
--
-- Fix: staff only. NOTE — src/services/supabase/sports.supabase.ts calls
-- settle_bet from the browser with a client-side coin flip (`betWins(row.id)`).
-- Applying this WILL stop demo bets from auto-settling. The correct production
-- shape is a server-side settlement job (or a sportsbook feed webhook) holding
-- the service role; until that exists, apply this and settle from the panel.

create or replace function public.settle_bet(p_bet_id uuid, p_won boolean)
returns public.bets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bet public.bets;
begin
  if not public.is_staff() then
    raise exception 'forbidden' using errcode = 'P0001';
  end if;

  select * into v_bet from public.bets where id = p_bet_id for update;
  if not found then
    raise exception 'bet_not_found' using errcode = 'P0001';
  end if;
  if v_bet.status <> 'open' then
    return v_bet;               -- idempotent: double settlement is already safe
  end if;

  if p_won then
    perform public.apply_ledger(
      p_user_id => v_bet.user_id,
      p_coin    => v_bet.coin,
      p_delta   => v_bet.potential_win,
      p_type    => 'win',
      p_note    => v_bet.selections -> 0 ->> 'eventLabel',
      p_reference => v_bet.id
    );
    perform public.push_notification(
      v_bet.user_id, 'betWon',
      jsonb_build_object('amount', v_bet.potential_win, 'coin', v_bet.coin),
      '/profile/bets'
    );
  else
    perform public.push_notification(
      v_bet.user_id, 'betLost',
      jsonb_build_object('event', v_bet.selections -> 0 ->> 'eventLabel'),
      '/profile/bets'
    );
  end if;

  update public.bets
  set status = case when p_won then 'won' else 'lost' end,
      payout = case when p_won then v_bet.potential_win else 0 end,
      settled_at = now()
  where id = p_bet_id
  returning * into v_bet;

  return v_bet;
end;
$$;


-- ── 2. HIGH: players can rewrite operator-only profile columns ──────────────
--
-- Defect (0002_rls.sql, profiles_update_own):
--   The WITH CHECK pins role / status / player_id / kyc_status only. Every
--   other column is writable by the row owner, and Supabase grants UPDATE on
--   public tables to `authenticated`, so a player can simply
--     PATCH /rest/v1/profiles?id=eq.<self>
--       { "internal_note": "", "xp": 999999999, "wagered_total": 0,
--         "email": "someone.else@example.com" }
--   Consequences: the operator's internal_note (and status_reason /
--   status_changed_by, i.e. the record of who froze the account and why) can be
--   erased or forged by the very player under investigation; xp drives VIP
--   tier; wagered_total is the bonus wagering counter; profiles.email is what
--   the panel's player search matches on.
--
-- The four columns the policy DOES pin are genuinely safe: an RLS WITH CHECK
-- subquery runs against the pre-command snapshot, so it reads the OLD row and
-- the comparison behaves as intended. The problem is only the omissions.
--
-- Fix: pin every column a player has no business changing. What stays editable
-- is exactly the presentation set the comment claims: nickname, avatar_id,
-- two_factor_enabled, referred_by.

drop policy if exists profiles_update_own on public.profiles;

-- Written as one IS NOT DISTINCT FROM per column on purpose: four of these
-- columns are nullable, and a plain `=` against a NULL old value yields NULL,
-- which RLS treats as a failure — that would lock every player out of editing
-- their own nickname.
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid())
  with check (
    id = auth.uid()
    and role       is not distinct from (select p.role       from public.profiles p where p.id = auth.uid())
    and status     is not distinct from (select p.status     from public.profiles p where p.id = auth.uid())
    and player_id  is not distinct from (select p.player_id  from public.profiles p where p.id = auth.uid())
    and kyc_status is not distinct from (select p.kyc_status from public.profiles p where p.id = auth.uid())
    and email      is not distinct from (select p.email      from public.profiles p where p.id = auth.uid())
    and ref_code   is not distinct from (select p.ref_code   from public.profiles p where p.id = auth.uid())
    and xp         is not distinct from (select p.xp         from public.profiles p where p.id = auth.uid())
    and wagered_total is not distinct from (select p.wagered_total from public.profiles p where p.id = auth.uid())
    and internal_note is not distinct from (select p.internal_note from public.profiles p where p.id = auth.uid())
    and status_reason is not distinct from (select p.status_reason from public.profiles p where p.id = auth.uid())
    and status_changed_at is not distinct from (select p.status_changed_at from public.profiles p where p.id = auth.uid())
    and status_changed_by is not distinct from (select p.status_changed_by from public.profiles p where p.id = auth.uid())
  );


-- ── 3. HIGH: approving a deposit credits the balance twice ──────────────────
--
-- Defect (0003_functions.sql, apply_ledger + admin_review_transaction):
--   apply_ledger applies p_delta to the balance unconditionally, whatever
--   p_status is — the "pending movements ... settle the balance figure only
--   once confirmed" comment does not match the code. Anything that creates a
--   *pending deposit* row therefore credits the player immediately, and then
--   admin_review_transaction's approve branch calls apply_ledger AGAIN with
--   +v_tx.amount. The player is paid twice, and the ledger grows a second
--   confirmed `deposit` row for one deposit (which admin_dashboard_stats then
--   double-counts in depositsToday).
--   Symmetrically, REJECTING such a deposit claws nothing back: the money
--   credited at request time stays in the balance.
--
--   Nothing in the repo creates a pending deposit yet (credit_demo_funds writes
--   'confirmed'), which is the only reason this is not live today. The whole
--   review UI exists for the provider-webhook integration point named in
--   0003, so it will fire the day that lands.
--
-- Fix: a pending/processing CREDIT does not move the balance and gets no
-- balance_after; a DEBIT still reserves funds immediately (withdrawals depend
-- on that, and request_withdrawal/admin_review_transaction's refund of
-- amount + fee is already exactly right).

create or replace function public.apply_ledger(
  p_user_id  uuid,
  p_coin     coin,
  p_delta    numeric,
  p_type     tx_type,
  p_status   tx_status default 'confirmed',
  p_fee      numeric default 0,
  p_note     text default null,
  p_actor_id uuid default null,
  p_network  network default null,
  p_address  text default null,
  p_reference uuid default null
)
returns public.transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance numeric(38,18);
  v_apply boolean;
  v_tx public.transactions;
begin
  -- Credits are only applied once the movement settles; debits reserve now.
  v_apply := (p_delta < 0) or (p_status not in ('pending','processing'));

  -- Lock this user's row for the coin so concurrent bets cannot race.
  select amount into v_balance
  from public.balances
  where user_id = p_user_id and coin = p_coin
  for update;

  if not found then
    -- on conflict guards the two-concurrent-first-writes case
    insert into public.balances (user_id, coin, amount)
    values (p_user_id, p_coin, 0)
    on conflict (user_id, coin) do update set amount = balances.amount
    returning amount into v_balance;
  end if;

  if v_apply then
    if p_delta < 0 and v_balance + p_delta < 0 then
      raise exception 'insufficient_funds' using errcode = 'P0001';
    end if;

    update public.balances
    set amount = amount + p_delta, updated_at = now()
    where user_id = p_user_id and coin = p_coin
    returning amount into v_balance;
  end if;

  insert into public.transactions (
    user_id, type, coin, amount, fee, status, network, address,
    balance_after, note, actor_id, reference_id, settled_at
  )
  values (
    p_user_id, p_type, p_coin, abs(p_delta), coalesce(p_fee, 0), p_status,
    p_network, p_address,
    case when v_apply then v_balance end,
    p_note, p_actor_id, p_reference,
    case when p_status = 'confirmed' then now() end
  )
  returning * into v_tx;

  return v_tx;
end;
$$;

revoke all on function public.apply_ledger from public, anon, authenticated;


-- ── 4. MEDIUM: approving a deposit leaves a duplicate ledger row ────────────
--
-- Defect: even with §3 applied, admin_review_transaction credits a deposit by
-- INSERTing a fresh confirmed `deposit` transaction next to the original one.
-- The player's statement shows the same deposit twice and depositsToday counts
-- it twice.
--
-- Fix: settle the row that already exists. The balance is moved under the same
-- row lock apply_ledger uses, and balance_after is stamped onto the original
-- transaction so the statement stays auditable.

create or replace function public.admin_review_transaction(
  p_tx_id  uuid,
  p_approve boolean,
  p_note   text default null
)
returns public.transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_tx public.transactions;
  v_balance numeric(38,18);
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = 'P0001';
  end if;

  select * into v_tx from public.transactions where id = p_tx_id for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0001';
  end if;
  if v_tx.status not in ('pending','processing') then
    raise exception 'already_settled' using errcode = 'P0001';
  end if;
  -- The panel only offers review for these two; the RPC must agree.
  if v_tx.type not in ('deposit','withdraw') then
    raise exception 'not_reviewable' using errcode = 'P0001';
  end if;

  if p_approve then
    if v_tx.type = 'deposit' then
      -- Credit now (§3 left a pending deposit uncredited) on the existing row.
      select amount into v_balance
      from public.balances
      where user_id = v_tx.user_id and coin = v_tx.coin
      for update;

      if not found then
        insert into public.balances (user_id, coin, amount)
        values (v_tx.user_id, v_tx.coin, 0)
        on conflict (user_id, coin) do update set amount = balances.amount
        returning amount into v_balance;
      end if;

      update public.balances
      set amount = amount + v_tx.amount, updated_at = now()
      where user_id = v_tx.user_id and coin = v_tx.coin
      returning amount into v_balance;
    end if;

    update public.transactions
    set status = 'confirmed', settled_at = now(), actor_id = v_actor,
        balance_after = coalesce(v_balance, balance_after),
        note = coalesce(p_note, note)
    where id = p_tx_id
    returning * into v_tx;

    perform public.push_notification(
      v_tx.user_id,
      case when v_tx.type = 'deposit' then 'depositConfirmed' else 'withdrawConfirmed' end,
      jsonb_build_object('amount', v_tx.amount, 'coin', v_tx.coin),
      '/profile/transactions'
    );
  else
    -- Rejecting a withdrawal returns the reserved funds (amount + fee, exactly
    -- what request_withdrawal took). A pending deposit was never credited, so
    -- rejecting one is a status change only.
    if v_tx.type = 'withdraw' then
      perform public.apply_ledger(
        p_user_id => v_tx.user_id, p_coin => v_tx.coin,
        p_delta => v_tx.amount + v_tx.fee, p_type => 'rollback',
        p_note => p_note, p_actor_id => v_actor, p_reference => v_tx.id
      );
    end if;

    update public.transactions
    set status = 'rejected', settled_at = now(), actor_id = v_actor,
        note = coalesce(p_note, note)
    where id = p_tx_id
    returning * into v_tx;

    perform public.push_notification(
      v_tx.user_id, 'transactionRejected',
      jsonb_build_object('amount', v_tx.amount, 'coin', v_tx.coin),
      '/profile/transactions'
    );
  end if;

  insert into public.admin_actions (actor_id, target_user, action, details)
  values (v_actor, v_tx.user_id,
          case when p_approve then 'tx.approve' else 'tx.reject' end,
          jsonb_build_object('tx', p_tx_id, 'note', p_note));

  return v_tx;
end;
$$;


-- ── 5. MEDIUM: every active promo code is world-readable ────────────────────
--
-- Defect (0002_rls.sql): `promo_codes_select using (active or is_staff())`.
-- Verified against the live project with the anon key: an unauthenticated
-- request to /rest/v1/promo_codes returns every active code with its amount.
-- claim_promo_code needs nothing but the string, so any visitor can enumerate
-- and claim the entire campaign list.
--
-- Fix: staff only. claim_promo_code is SECURITY DEFINER and reads the table as
-- the owner, so claiming keeps working.
-- CHECK FIRST: any player-facing promotions screen that lists codes straight
-- from this table will go empty. Give it a SECURITY DEFINER "public campaigns"
-- function returning only the fields it should show.

drop policy if exists promo_codes_select on public.promo_codes;

create policy promo_codes_select on public.promo_codes
  for select using (public.is_staff());


-- ── 6. MEDIUM: the demo-funds cap is coin-blind and racy ────────────────────
--
-- Defect (0004_seed.sql, credit_demo_funds): the 100 000 lifetime cap sums
-- `amount` over every coin, so 10 000 BTC passes the same test as 10 000 USDT
-- (~USD 964 000 000 at the panel's own rate table, which is what the operator
-- dashboard then displays). The sum is also read without any lock, so N
-- concurrent calls all see the same pre-image and each add up to 10 000.
--
-- Fix: cap in USDT-equivalent terms by only allowing stablecoins, and take the
-- per-user advisory lock so the check and the credit are atomic.

create or replace function public.credit_demo_funds(p_coin coin, p_amount numeric)
returns public.transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_credited numeric;
  v_max_total constant numeric := 100000;
  v_max_call  constant numeric := 10000;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;
  perform public.assert_active_account(v_user);

  if p_coin not in ('USDT','USDC') then
    raise exception 'invalid_coin' using errcode = 'P0001';
  end if;
  if p_amount is null or p_amount <= 0 or p_amount > v_max_call then
    raise exception 'invalid_amount' using errcode = 'P0001';
  end if;

  -- Serialise concurrent claims for this user for the rest of the transaction.
  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 0));

  select coalesce(sum(amount), 0) into v_credited
  from public.transactions
  where user_id = v_user and type = 'deposit' and note = 'demo';

  if v_credited + p_amount > v_max_total then
    raise exception 'demo_limit_reached' using errcode = 'P0001';
  end if;

  return public.apply_ledger(
    p_user_id => v_user,
    p_coin    => p_coin,
    p_delta   => p_amount,
    p_type    => 'deposit',
    p_note    => 'demo'
  );
end;
$$;


-- ── 7. MEDIUM: the dashboard money tiles add different coins together ───────
--
-- Defect (0003_functions.sql, admin_dashboard_stats): wageredToday,
-- depositsToday and withdrawalsToday are bare sum(amount)/sum(stake) over rows
-- of ALL EIGHT coins, and the panel renders them through fmtUsdt() with a
-- "USDT" label. One 1 BTC deposit plus one 1 DOGE deposit displays as
-- "2.00 USDT". wageredToday also ignores casino turnover (game_rounds), so the
-- "Sum of stakes" hint is wrong twice over.
--
-- Fix: restrict the money aggregates to the stablecoins, which makes the USDT
-- label truthful, and include game rounds in the wagered figure. A real fix
-- needs an FX rate table in the database; this is the honest interim.

create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not public.is_staff() then
    raise exception 'forbidden' using errcode = 'P0001';
  end if;

  select jsonb_build_object(
    'players', (select count(*) from public.profiles where role = 'player'),
    'playersToday', (select count(*) from public.profiles
                     where role = 'player' and created_at >= current_date),
    'online', (select count(*) from public.profiles
               where role = 'player' and last_seen_at >= now() - interval '5 minutes'),
    'pendingTx', (select count(*) from public.transactions
                  where status in ('pending','processing')),
    'openTickets', (select count(*) from public.support_tickets
                    where status in ('open','pending')),
    'betsToday', (select count(*) from public.bets where created_at >= current_date),
    'wageredToday', (
      (select coalesce(sum(stake), 0) from public.bets
       where coin in ('USDT','USDC') and created_at >= current_date)
      + (select coalesce(sum(bet_amount), 0) from public.game_rounds
         where coin in ('USDT','USDC') and created_at >= current_date)),
    'depositsToday', (select coalesce(sum(amount), 0) from public.transactions
                      where type = 'deposit' and status = 'confirmed'
                        and coin in ('USDT','USDC')
                        and created_at >= current_date),
    'withdrawalsToday', (select coalesce(sum(amount), 0) from public.transactions
                         where type = 'withdraw' and status = 'confirmed'
                           and coin in ('USDT','USDC')
                           and created_at >= current_date)
  ) into v_result;

  return v_result;
end;
$$;


-- ── 8. LOW: dead helper shadowing a reserved SQL function name ──────────────
-- public.current_role() is never called from anywhere and only parses because
-- it is schema-qualified (current_role is a reserved keyword). Drop it.

drop function if exists public.current_role();


-- ── NOT FIXED HERE — needs a product decision, see the QA report ────────────
--
-- * record_game_round(p_game_slug, p_provider, p_coin, p_bet, p_win) takes the
--   WIN AMOUNT from the client and credits it verbatim, with no cap and no
--   relation to p_bet. Any signed-in player can call it with p_bet => 0 and
--   p_win => 1000000. There is no safe patch: the game outcome has to be
--   produced server-side (a provably-fair RNG in the function, or a provider
--   callback authenticated with the service role). Until then this RPC must
--   not be granted to `authenticated` on a real-money deployment.
--
-- * place_bet takes total odds out of the client's p_selections JSON. Harmless
--   once §1 lands (staff see the inflated potential_win before settling), fatal
--   before it. Odds must come from the sportsbook feed, keyed by selection id.
--
-- * admin_actions.ip is declared but no RPC ever writes it, so the audit log's
--   IP column can only ever render "—". Either populate it (pass the request IP
--   in from the route handler) or drop the column and the panel's column.
--
-- * user_bonuses.wager_done is never incremented by anything, so a bonus's
--   wagering requirement is decorative and bonus funds are withdrawable
--   immediately.
--
-- * support_tickets_update_staff / support_messages_update_staff allow staff to
--   update ANY column, including support_tickets.user_id — a support operator
--   can reassign a ticket to a different player. Pin the columns if that
--   matters.
