-- ============================================================================
-- Seed data and demo-mode helpers
-- ============================================================================

-- ── Promo codes ─────────────────────────────────────────────────────────────

insert into public.promo_codes (code, label_key, amount, coin, wager_multiplier, valid_days)
values
  ('WELCOME100',  'welcomeBonus',   100, 'USDT', 25, 14),
  ('FREESPINS50', 'freeSpinsBonus',  50, 'USDT', 30,  7),
  ('CASHBACK10',  'cashbackBonus',   10, 'USDT',  5,  3),
  ('SPORT25',     'sportBonus',      25, 'USDT', 10,  7)
on conflict (code) do nothing;

-- ── Demo funds ──────────────────────────────────────────────────────────────
-- Lets a visitor credit test funds so the wallet, betting and history screens
-- can be explored. Capped per call and per account so it cannot be abused.
--
-- REMOVE THIS FUNCTION when a real payment provider is connected — at that
-- point deposits arrive through the provider webhook and admin_review_transaction.

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

  if p_amount is null or p_amount <= 0 or p_amount > v_max_call then
    raise exception 'invalid_amount' using errcode = 'P0001';
  end if;

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

grant execute on function public.credit_demo_funds(coin, numeric) to authenticated;

-- ── Bootstrapping the first administrator ───────────────────────────────────
-- Sign up through the site first, then run this once in the SQL editor with
-- your own address:
--
--   update public.profiles set role = 'admin' where email = 'you@example.com';
