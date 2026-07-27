-- ============================================================================
-- Server-side settlement and a cap on self-reported wins
-- ============================================================================
-- 0008 §1 makes settle_bet staff-only, which is right: a player must never
-- choose whether their own bet won. But this build has no results feed, so
-- something still has to tick open bets over. This adds a function the player
-- may call which settles only their OWN due bets and decides the outcome in
-- SQL — the caller supplies nothing but their session.
-- ----------------------------------------------------------------------------

-- ── 1. Player-triggered, server-decided settlement ──────────────────────────

create or replace function public.settle_due_bets()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_bet public.bets;
  v_won boolean;
  v_settled integer := 0;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  -- Demo pacing: a bet becomes due two minutes after it was placed.
  for v_bet in
    select * from public.bets
    where user_id = v_user
      and status = 'open'
      and created_at <= now() - interval '2 minutes'
    order by created_at
    limit 20
    for update
  loop
    -- Outcome is a deterministic function of the bet id, so it is stable on
    -- replay and cannot be influenced by the caller. Slightly player-favoured
    -- to keep the demo lively.
    v_won := (('x' || substr(md5(v_bet.id::text), 1, 8))::bit(32)::bigint % 100) < 48;

    if v_won then
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
    set status = case when v_won then 'won' else 'lost' end,
        payout = case when v_won then v_bet.potential_win else 0 end,
        settled_at = now()
    where id = v_bet.id;

    v_settled := v_settled + 1;
  end loop;

  return v_settled;
end;
$$;

grant execute on function public.settle_due_bets() to authenticated;

-- ── 2. record_game_round may no longer mint money ───────────────────────────
--
-- p_win arrived from the client and was credited verbatim, so any signed-in
-- user could award themselves an arbitrary amount. Casino rounds are placeholder
-- interfaces in this build — there is no server-side game engine to produce a
-- legitimate win — so a non-staff caller may only record a stake going out.
-- When a real provider is integrated, wins must come from its signed callback,
-- not from this function.

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

  if coalesce(p_bet, 0) < 0 or coalesce(p_win, 0) < 0 then
    raise exception 'invalid_amount' using errcode = 'P0001';
  end if;

  if coalesce(p_win, 0) > 0 and not public.is_staff() then
    raise exception 'win_not_permitted' using errcode = 'P0001';
  end if;

  if coalesce(p_bet, 0) > 0 then
    perform public.apply_ledger(v_user, p_coin, -p_bet, 'bet', 'confirmed', 0, p_game_slug);
    update public.profiles
    set xp = xp + floor(p_bet)::bigint, wagered_total = wagered_total + p_bet
    where id = v_user;
  end if;

  if coalesce(p_win, 0) > 0 then
    perform public.apply_ledger(v_user, p_coin, p_win, 'win', 'confirmed', 0, p_game_slug);
  end if;

  insert into public.game_rounds (user_id, game_slug, provider, coin, bet_amount, win_amount)
  values (v_user, p_game_slug, p_provider, p_coin, coalesce(p_bet, 0), coalesce(p_win, 0))
  returning * into v_round;

  return v_round;
end;
$$;

-- ── 3. An operator must not adjust their own balance ────────────────────────
--
-- Status and role changes already refuse to target the caller; the one action
-- that moves money did not. Adjusting another admin's balance is still allowed
-- and audited — this only removes the unreviewable self-credit.

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
  if p_user_id = v_actor then
    raise exception 'cannot_target_self' using errcode = 'P0001';
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
