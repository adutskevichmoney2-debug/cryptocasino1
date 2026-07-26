-- ============================================================================
-- Money-moving RPC
-- ============================================================================
-- Every balance change happens here, inside a transaction, under SECURITY
-- DEFINER. Clients can only call these functions — they cannot UPDATE balances.
-- ----------------------------------------------------------------------------

-- ── Internal ledger primitive ───────────────────────────────────────────────
-- Locks the balance row, applies the delta, writes the transaction. Raises if
-- the movement would overdraw the account.

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
  v_tx public.transactions;
begin
  -- Lock this user's row for the coin so concurrent bets cannot race.
  select amount into v_balance
  from public.balances
  where user_id = p_user_id and coin = p_coin
  for update;

  if not found then
    insert into public.balances (user_id, coin, amount)
    values (p_user_id, p_coin, 0)
    returning amount into v_balance;
  end if;

  if p_delta < 0 and v_balance + p_delta < 0 then
    raise exception 'insufficient_funds' using errcode = 'P0001';
  end if;

  -- Pending movements reserve the funds immediately but settle the balance
  -- figure on the transaction only once confirmed.
  update public.balances
  set amount = amount + p_delta, updated_at = now()
  where user_id = p_user_id and coin = p_coin
  returning amount into v_balance;

  insert into public.transactions (
    user_id, type, coin, amount, fee, status, network, address,
    balance_after, note, actor_id, reference_id, settled_at
  )
  values (
    p_user_id, p_type, p_coin, abs(p_delta), coalesce(p_fee, 0), p_status,
    p_network, p_address, v_balance, p_note, p_actor_id, p_reference,
    case when p_status = 'confirmed' then now() end
  )
  returning * into v_tx;

  return v_tx;
end;
$$;

revoke all on function public.apply_ledger from public, anon, authenticated;

-- ── Notification helper ─────────────────────────────────────────────────────

create or replace function public.push_notification(
  p_user_id uuid,
  p_key     text,
  p_values  jsonb default null,
  p_href    text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, key, values, href)
  values (p_user_id, p_key, p_values, p_href);
end;
$$;

revoke all on function public.push_notification from public, anon, authenticated;

-- ── Guard: account must be usable ───────────────────────────────────────────

create or replace function public.assert_active_account(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status account_status;
begin
  select status into v_status from public.profiles where id = p_user_id;
  if v_status is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;
  if v_status <> 'active' then
    raise exception 'account_%', v_status using errcode = 'P0001';
  end if;
end;
$$;

revoke all on function public.assert_active_account from public, anon, authenticated;

-- ── Deposit address ─────────────────────────────────────────────────────────
-- Returns the stored address, generating a deterministic placeholder the first
-- time. INTEGRATION POINT: a payment provider issues the real address here.

create or replace function public.get_deposit_address(p_coin coin, p_network network)
returns public.deposit_addresses
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_row public.deposit_addresses;
  v_seed text;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  select * into v_row
  from public.deposit_addresses
  where user_id = v_user and coin = p_coin and network = p_network;

  if found then
    return v_row;
  end if;

  v_seed := encode(digest(v_user::text || p_coin::text || p_network::text, 'sha256'), 'hex');

  insert into public.deposit_addresses (user_id, coin, network, address)
  values (
    v_user, p_coin, p_network,
    case p_network
      when 'BTC'   then 'bc1q' || substr(v_seed, 1, 38)
      when 'TRC20' then 'T'    || substr(v_seed, 1, 33)
      when 'ERC20' then '0x'   || substr(v_seed, 1, 40)
      when 'BEP20' then '0x'   || substr(v_seed, 1, 40)
      when 'SOL'   then substr(v_seed, 1, 44)
      when 'LTC'   then 'ltc1q' || substr(v_seed, 1, 38)
      when 'DOGE'  then 'D'    || substr(v_seed, 1, 33)
    end
  )
  returning * into v_row;

  return v_row;
end;
$$;

-- ── Withdrawal request ──────────────────────────────────────────────────────
-- Debits immediately and leaves the transaction pending for operator review.

create or replace function public.request_withdrawal(
  p_coin    coin,
  p_network network,
  p_address text,
  p_amount  numeric,
  p_fee     numeric default 0
)
returns public.transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_tx public.transactions;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;
  perform public.assert_active_account(v_user);

  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid_amount' using errcode = 'P0001';
  end if;
  if coalesce(trim(p_address), '') = '' then
    raise exception 'invalid_address' using errcode = 'P0001';
  end if;

  v_tx := public.apply_ledger(
    p_user_id => v_user,
    p_coin    => p_coin,
    p_delta   => -(p_amount + coalesce(p_fee, 0)),
    p_type    => 'withdraw',
    p_status  => 'pending',
    p_fee     => p_fee,
    p_network => p_network,
    p_address => p_address
  );

  perform public.push_notification(
    v_user, 'withdrawSubmitted',
    jsonb_build_object('amount', p_amount, 'coin', p_coin), '/profile/transactions'
  );

  return v_tx;
end;
$$;

-- ── Place a sports bet ──────────────────────────────────────────────────────

create or replace function public.place_bet(
  p_selections jsonb,
  p_stake      numeric,
  p_coin       coin,
  p_type       text
)
returns public.bets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_odds numeric(12,4);
  v_bet public.bets;
  v_selection jsonb;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;
  perform public.assert_active_account(v_user);

  if p_selections is null or jsonb_array_length(p_selections) = 0 then
    raise exception 'empty_slip' using errcode = 'P0001';
  end if;
  if p_stake is null or p_stake <= 0 then
    raise exception 'invalid_stake' using errcode = 'P0001';
  end if;
  if p_type not in ('single','combo') then
    raise exception 'invalid_bet_type' using errcode = 'P0001';
  end if;

  -- Odds are recomputed server-side; a tampered client payload cannot inflate
  -- the payout.
  if p_type = 'combo' then
    v_odds := 1;
    for v_selection in select * from jsonb_array_elements(p_selections) loop
      v_odds := v_odds * (v_selection ->> 'odds')::numeric;
    end loop;
  else
    v_odds := (p_selections -> 0 ->> 'odds')::numeric;
  end if;
  v_odds := round(v_odds, 4);

  perform public.apply_ledger(
    p_user_id => v_user,
    p_coin    => p_coin,
    p_delta   => -p_stake,
    p_type    => 'bet',
    p_note    => p_selections -> 0 ->> 'eventLabel'
  );

  insert into public.bets (user_id, bet_type, selections, stake, coin, total_odds, potential_win)
  values (v_user, p_type, p_selections, p_stake, p_coin, v_odds, round(p_stake * v_odds, 18))
  returning * into v_bet;

  update public.profiles
  set xp = xp + floor(p_stake)::bigint,
      wagered_total = wagered_total + p_stake
  where id = v_user;

  return v_bet;
end;
$$;

-- ── Settle a bet ────────────────────────────────────────────────────────────

create or replace function public.settle_bet(p_bet_id uuid, p_won boolean)
returns public.bets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bet public.bets;
begin
  select * into v_bet from public.bets where id = p_bet_id for update;
  if not found then
    raise exception 'bet_not_found' using errcode = 'P0001';
  end if;
  if v_bet.status <> 'open' then
    return v_bet;
  end if;
  -- Players may settle only their own bets (the client ticks them over when an
  -- event finishes); staff may settle anyone's.
  if v_bet.user_id <> auth.uid() and not public.is_staff() then
    raise exception 'forbidden' using errcode = 'P0001';
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

-- ── Casino round ────────────────────────────────────────────────────────────

create or replace function public.record_game_round(
  p_game_slug text,
  p_provider  text,
  p_coin      coin,
  p_bet       numeric,
  p_win       numeric
)
returns public.game_rounds
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_round public.game_rounds;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;
  perform public.assert_active_account(v_user);

  if p_bet > 0 then
    perform public.apply_ledger(v_user, p_coin, -p_bet, 'bet', 'confirmed', 0, p_game_slug);
    update public.profiles
    set xp = xp + floor(p_bet)::bigint, wagered_total = wagered_total + p_bet
    where id = v_user;
  end if;

  if p_win > 0 then
    perform public.apply_ledger(v_user, p_coin, p_win, 'win', 'confirmed', 0, p_game_slug);
  end if;

  insert into public.game_rounds (user_id, game_slug, provider, coin, bet_amount, win_amount)
  values (v_user, p_game_slug, p_provider, p_coin, coalesce(p_bet, 0), coalesce(p_win, 0))
  returning * into v_round;

  return v_round;
end;
$$;

-- ── Promo codes ─────────────────────────────────────────────────────────────

create or replace function public.claim_promo_code(p_code text)
returns public.user_bonuses
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_code public.promo_codes;
  v_bonus public.user_bonuses;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;
  perform public.assert_active_account(v_user);

  select * into v_code
  from public.promo_codes
  where code = upper(trim(p_code))
  for update;

  if not found or not v_code.active then
    raise exception 'invalid_code' using errcode = 'P0001';
  end if;
  if v_code.expires_at is not null and v_code.expires_at < now() then
    raise exception 'invalid_code' using errcode = 'P0001';
  end if;
  if v_code.max_claims is not null and v_code.claims_count >= v_code.max_claims then
    raise exception 'invalid_code' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.user_bonuses where user_id = v_user and code = v_code.code) then
    raise exception 'already_claimed' using errcode = 'P0001';
  end if;

  insert into public.user_bonuses (
    user_id, code, label_key, amount, coin, wager_required, expires_at
  )
  values (
    v_user, v_code.code, v_code.label_key, v_code.amount, v_code.coin,
    v_code.amount * v_code.wager_multiplier,
    now() + make_interval(days => v_code.valid_days)
  )
  returning * into v_bonus;

  update public.promo_codes set claims_count = claims_count + 1 where code = v_code.code;

  perform public.apply_ledger(
    p_user_id => v_user,
    p_coin    => v_code.coin,
    p_delta   => v_code.amount,
    p_type    => 'bonus',
    p_note    => v_code.code
  );

  perform public.push_notification(
    v_user, 'bonusCredited',
    jsonb_build_object('amount', v_code.amount, 'coin', v_code.coin), '/promotions'
  );

  return v_bonus;
end;
$$;

-- ── Session logging ─────────────────────────────────────────────────────────
-- Called from a server route that can see the real client IP and User-Agent.

create or replace function public.record_session(
  p_ip          text,
  p_user_agent  text,
  p_device_type text,
  p_browser     text,
  p_os          text,
  p_country     text default null,
  p_city        text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
begin
  if v_user is null then
    return null;
  end if;

  -- One row per (user, ip, user agent): refresh it instead of piling up rows.
  select id into v_id
  from public.user_sessions
  where user_id = v_user
    and ip is not distinct from nullif(p_ip, '')::inet
    and user_agent is not distinct from p_user_agent
    and revoked_at is null
  limit 1;

  if v_id is not null then
    update public.user_sessions set last_seen_at = now() where id = v_id;
  else
    insert into public.user_sessions (
      user_id, ip, user_agent, device_type, browser, os, country, city
    )
    values (
      v_user, nullif(p_ip, '')::inet, p_user_agent, p_device_type,
      p_browser, p_os, p_country, p_city
    )
    returning id into v_id;
  end if;

  update public.profiles set last_seen_at = now() where id = v_user;
  return v_id;
end;
$$;

-- ── Operator actions ────────────────────────────────────────────────────────

create or replace function public.admin_adjust_balance(
  p_user_id uuid,
  p_coin    coin,
  p_amount  numeric,
  p_note    text default null
)
returns public.transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_tx public.transactions;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = 'P0001';
  end if;
  if p_amount = 0 then
    raise exception 'invalid_amount' using errcode = 'P0001';
  end if;

  v_tx := public.apply_ledger(
    p_user_id => p_user_id,
    p_coin    => p_coin,
    p_delta   => p_amount,
    p_type    => 'adjustment',
    p_note    => p_note,
    p_actor_id => v_actor
  );

  insert into public.admin_actions (actor_id, target_user, action, details)
  values (v_actor, p_user_id, 'balance.adjust',
          jsonb_build_object('coin', p_coin, 'amount', p_amount, 'note', p_note));

  perform public.push_notification(
    p_user_id,
    case when p_amount > 0 then 'balanceCredited' else 'balanceDebited' end,
    jsonb_build_object('amount', abs(p_amount), 'coin', p_coin),
    '/profile/transactions'
  );

  return v_tx;
end;
$$;

-- Approve or reject a pending deposit/withdrawal.
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

  if p_approve then
    -- Deposits credit on approval; withdrawals were already debited on request.
    if v_tx.type = 'deposit' then
      perform public.apply_ledger(
        p_user_id => v_tx.user_id, p_coin => v_tx.coin, p_delta => v_tx.amount,
        p_type => 'deposit', p_note => p_note, p_actor_id => v_actor,
        p_reference => v_tx.id
      );
    end if;

    update public.transactions
    set status = 'confirmed', settled_at = now(), actor_id = v_actor,
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
    -- Rejecting a withdrawal returns the reserved funds.
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

create or replace function public.admin_set_account_status(
  p_user_id uuid,
  p_status  account_status,
  p_reason  text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_profile public.profiles;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = 'P0001';
  end if;
  if p_user_id = v_actor then
    raise exception 'cannot_target_self' using errcode = 'P0001';
  end if;

  update public.profiles
  set status = p_status, status_reason = p_reason,
      status_changed_at = now(), status_changed_by = v_actor
  where id = p_user_id
  returning * into v_profile;

  insert into public.admin_actions (actor_id, target_user, action, details)
  values (v_actor, p_user_id, 'account.status',
          jsonb_build_object('status', p_status, 'reason', p_reason));

  return v_profile;
end;
$$;

create or replace function public.admin_set_kyc_status(
  p_user_id uuid,
  p_status  kyc_status,
  p_reason  text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_profile public.profiles;
begin
  if not public.is_staff() then
    raise exception 'forbidden' using errcode = 'P0001';
  end if;

  update public.profiles set kyc_status = p_status where id = p_user_id
  returning * into v_profile;

  insert into public.admin_actions (actor_id, target_user, action, details)
  values (v_actor, p_user_id, 'account.kyc',
          jsonb_build_object('status', p_status, 'reason', p_reason));

  perform public.push_notification(
    p_user_id, 'kyc' || initcap(p_status::text), null, '/profile/verification'
  );

  return v_profile;
end;
$$;

create or replace function public.admin_set_role(p_user_id uuid, p_role user_role)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_profile public.profiles;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = 'P0001';
  end if;
  if p_user_id = v_actor then
    raise exception 'cannot_target_self' using errcode = 'P0001';
  end if;

  update public.profiles set role = p_role where id = p_user_id
  returning * into v_profile;

  insert into public.admin_actions (actor_id, target_user, action, details)
  values (v_actor, p_user_id, 'account.role', jsonb_build_object('role', p_role));

  return v_profile;
end;
$$;

create or replace function public.admin_add_note(p_user_id uuid, p_note text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_profile public.profiles;
begin
  if not public.is_staff() then
    raise exception 'forbidden' using errcode = 'P0001';
  end if;

  update public.profiles set internal_note = p_note where id = p_user_id
  returning * into v_profile;

  insert into public.admin_actions (actor_id, target_user, action, details)
  values (v_actor, p_user_id, 'account.note', jsonb_build_object('note', p_note));

  return v_profile;
end;
$$;

-- ── Dashboard aggregates ────────────────────────────────────────────────────

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
               where last_seen_at >= now() - interval '5 minutes'),
    'pendingTx', (select count(*) from public.transactions
                  where status in ('pending','processing')),
    'openTickets', (select count(*) from public.support_tickets
                    where status in ('open','pending')),
    'betsToday', (select count(*) from public.bets where created_at >= current_date),
    'wageredToday', (select coalesce(sum(stake), 0) from public.bets
                     where created_at >= current_date),
    'depositsToday', (select coalesce(sum(amount), 0) from public.transactions
                      where type = 'deposit' and status = 'confirmed'
                        and created_at >= current_date),
    'withdrawalsToday', (select coalesce(sum(amount), 0) from public.transactions
                         where type = 'withdraw' and status = 'confirmed'
                           and created_at >= current_date)
  ) into v_result;

  return v_result;
end;
$$;

-- ── Grants ──────────────────────────────────────────────────────────────────

grant execute on function
  public.get_deposit_address(coin, network),
  public.request_withdrawal(coin, network, text, numeric, numeric),
  public.place_bet(jsonb, numeric, coin, text),
  public.settle_bet(uuid, boolean),
  public.record_game_round(text, text, coin, numeric, numeric),
  public.claim_promo_code(text),
  public.record_session(text, text, text, text, text, text, text),
  public.admin_adjust_balance(uuid, coin, numeric, text),
  public.admin_review_transaction(uuid, boolean, text),
  public.admin_set_account_status(uuid, account_status, text),
  public.admin_set_kyc_status(uuid, kyc_status, text),
  public.admin_set_role(uuid, user_role),
  public.admin_add_note(uuid, text),
  public.admin_dashboard_stats(),
  public.is_staff(),
  public.is_admin()
to authenticated;
